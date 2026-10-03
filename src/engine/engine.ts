/**
 * SpinEngine · Canalización determinista de 4 etapas (§13.3).
 *
 * [Armario] -> 1. FILTROS DUROS -> 2. N=40 CANDIDATOS ->
 * 3. PUNTUADOR (Score) -> 4. SELECCIÓN PONDERADA -> Outfit.
 *
 * Puro TypeScript: recibe `rng` y `now` inyectables para ser 100% testeable.
 * Los candados del usuario NUNCA se relajan (§13.3).
 */

import { scoreColorHarmony } from './color';
import { fitsOccasion, fitsOccasionRelaxed, scoreFormality } from './formality';
import {
  modeForTemperature,
  passesWeather,
  passesWeatherRelaxed,
  reelConfigFor,
  scoreWarmth,
} from './weather';
import type {
  Candidate,
  Garment,
  ScoreBreakdown,
  SpinInput,
  SpinResult,
  WearLog,
} from './types';
import { comboKey } from './types';

export const CANDIDATE_COUNT = 40;
export const TOP_K_SAFE = 3;
export const PATTERN_PENALTY = 0.4;
export const SUBUSE_DAYS = 30;
export const RECENT_REPEAT_DAYS = 3;
export const FRESH_DAYS = 5;
/** Probabilidad de proponer una pieza única cuando el pool lo permite. */
export const ONEPIECE_CHANCE = 0.3;

const DAY_MS = 24 * 60 * 60 * 1000;

interface Pools {
  tops: Garment[];
  bottoms: Garment[];
  layers: Garment[];
  shoes: Garment[];
  onepieces: Garment[];
}

interface PoolOptions {
  occasionRelaxed: boolean;
  weatherRelaxed: boolean;
}

function buildPools(input: SpinInput, options: PoolOptions): Pools {
  const usable = (g: Garment) => !g.isArchived && !g.isLaundry;
  const occasionOk = (g: Garment) =>
    options.occasionRelaxed ? fitsOccasionRelaxed(g, input.occasion) : fitsOccasion(g, input.occasion);
  const weatherOk = (g: Garment) =>
    options.weatherRelaxed
      ? passesWeatherRelaxed(g, input.thermalMode)
      : passesWeather(g, input.thermalMode);
  const eligible = input.garments.filter((g) => usable(g) && occasionOk(g) && weatherOk(g));
  return {
    tops: eligible.filter((g) => g.slot === 'top'),
    bottoms: eligible.filter((g) => g.slot === 'bottom'),
    layers: eligible.filter((g) => g.slot === 'layer'),
    shoes: eligible.filter((g) => g.slot === 'shoes'),
    onepieces: eligible.filter((g) => g.slot === 'onepiece'),
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function lastWornMs(logs: WearLog[], garmentId: string): number | null {
  let last: number | null = null;
  for (const log of logs) {
    if (log.garmentIds.includes(garmentId)) {
      if (last === null || log.dateMs > last) last = log.dateMs;
    }
  }
  return last;
}

function itemsOf(candidate: Candidate): Garment[] {
  return [candidate.top, candidate.bottom, candidate.layer, candidate.shoes, candidate.onepiece].filter(
    (g): g is Garment => Boolean(g),
  );
}

export function candidateKey(candidate: Candidate): string {
  return comboKey(itemsOf(candidate).map((g) => g.id));
}

/** Frescura anti-repetición (§13.1 D) con 0.70 como valor intermedio documentado. */
export function freshnessScore(
  candidate: Candidate,
  logs: WearLog[],
  now: number,
): number {
  const items = itemsOf(candidate);
  const key = candidateKey(candidate);
  const recentWindow = now - RECENT_REPEAT_DAYS * DAY_MS;
  if (logs.some((l) => l.dateMs >= recentWindow && comboKey(l.garmentIds) === key)) {
    return 0;
  }
  const yesterday = now - 1 * DAY_MS;
  if (items.some((g) => { const last = lastWornMs(logs, g.id); return last !== null && last >= yesterday; })) {
    return 0.4;
  }
  const allFresh = items.every((g) => {
    const last = lastWornMs(logs, g.id);
    return last === null || last <= now - FRESH_DAYS * DAY_MS;
  });
  if (allFresh) return 1;
  return 0.7;
}

/** Reactivación de subuso (§13.1 E): proporción de prendas con 30+ días sin registrar uso. */
export function subuseScore(candidate: Candidate, now: number, logs: WearLog[] = []): number {
  const items = itemsOf(candidate);
  if (items.length === 0) return 0;
  const threshold = now - SUBUSE_DAYS * DAY_MS;
  const dormant = items.filter((g) => {
    const last = lastWornMs(logs, g.id);
    const reference = last ?? g.createdAt;
    return reference <= threshold;
  }).length;
  return dormant / items.length;
}

export function scoreCandidate(candidate: Candidate, input: SpinInput): ScoreBreakdown {
  const items = itemsOf(candidate);
  const color = scoreColorHarmony(items).score;
  const formality = scoreFormality(items);
  const warmth = scoreWarmth(items, input.thermalMode);
  const freshness = freshnessScore(candidate, input.history.wearLogs, input.now);
  const subuse = subuseScore(candidate, input.now, input.history.wearLogs);
  const patterns = items.filter((g) => g.hasPattern).length;
  const patternPenalty = patterns >= 2 ? PATTERN_PENALTY : 0;
  const total = Math.max(
    0,
    Math.min(
      1,
      0.3 * color + 0.2 * formality + 0.2 * warmth + 0.15 * freshness + 0.15 * subuse - patternPenalty,
    ),
  );
  return { color, formality, warmth, freshness, subuse, patternPenalty, total };
}

function requiredSlotsSatisfied(
  input: SpinInput,
  pools: Pools,
  config: { layerRequired: boolean },
  onepieceLock?: Garment,
): boolean {
  const upperOk = onepieceLock
    ? true
    : (input.locks.top !== undefined || pools.tops.length > 0 || pools.onepieces.length > 0) &&
      (input.locks.bottom !== undefined || pools.bottoms.length > 0 || pools.onepieces.length > 0);
  const shoesOk = input.locks.shoes !== undefined || pools.shoes.length > 0;
  const layerOk =
    !config.layerRequired ||
    input.locks.layer !== undefined ||
    pools.layers.length > 0;
  return upperOk && shoesOk && layerOk;
}

/** Genera hasta CANDIDATE_COUNT combinaciones únicas válidas. */
function generateCandidates(
  input: SpinInput,
  pools: Pools,
  config: { showLayer: boolean; layerRequired: boolean },
  excludeRecent: boolean,
  onepieceLock?: Garment,
): Candidate[] {
  const { locks, rng } = input;
  const recent = new Set(input.history.recentComboKeys);
  const seen = new Set<string>();
  const out: Candidate[] = [];
  const target = CANDIDATE_COUNT;
  const maxAttempts = target * 25;

  const layerNeeded = config.showLayer || locks.layer !== undefined;
  /** El candado de capa manda: se incluye aunque el carrete esté apagado (§13.3). */
  const layerFor = (): Garment | undefined =>
    locks.layer ??
    (layerNeeded && pools.layers.length && (config.layerRequired || rng() < 0.7)
      ? pick(pools.layers, rng)
      : undefined);
  const canOnepiece =
    !onepieceLock && locks.top === undefined && locks.bottom === undefined && pools.onepieces.length > 0;

  for (let attempt = 0; attempt < maxAttempts && out.length < target; attempt++) {
    let candidate: Candidate;
    if (onepieceLock) {
      candidate = {
        onepiece: onepieceLock,
        shoes: locks.shoes ?? (pools.shoes.length ? pick(pools.shoes, rng) : undefined),
        layer: layerFor(),
      } as Candidate;
    } else if (canOnepiece && rng() < ONEPIECE_CHANCE) {
      candidate = {
        onepiece: pick(pools.onepieces, rng),
        shoes: locks.shoes ?? (pools.shoes.length ? pick(pools.shoes, rng) : undefined),
        layer: layerFor(),
      } as Candidate;
    } else {
      const top = locks.top ?? (pools.tops.length ? pick(pools.tops, rng) : undefined);
      const bottom = locks.bottom ?? (pools.bottoms.length ? pick(pools.bottoms, rng) : undefined);
      if (!top && !bottom && pools.onepieces.length) {
        candidate = {
          onepiece: pick(pools.onepieces, rng),
          shoes: locks.shoes ?? (pools.shoes.length ? pick(pools.shoes, rng) : undefined),
          layer: layerFor(),
        } as Candidate;
      } else {
        candidate = {
          top,
          bottom,
          shoes: locks.shoes ?? (pools.shoes.length ? pick(pools.shoes, rng) : undefined),
          layer: layerFor(),
        } as Candidate;
      }
    }
    if (!candidate.top && !candidate.bottom && !candidate.onepiece) continue;
    const key = candidateKey(candidate);
    if (seen.has(key)) continue;
    if (excludeRecent && recent.has(key)) continue;
    seen.add(key);
    candidate.breakdown = scoreCandidate(candidate, input);
    out.push(candidate);
  }
  return out;
}

function weightedPick(candidates: Candidate[], rng: () => number): Candidate {
  const weights = candidates.map((c) => c.breakdown.total + 0.05);
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = rng() * sum;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

export function spin(rawInput: Omit<SpinInput, 'thermalMode'>): SpinResult {
  const mode = modeForTemperature(rawInput.temperatureC, rawInput.settings.personalOffsetC);

  /*
   * Caso especial "Una Pieza" (§6.1): la UI fusiona los carretes Superior e
   * Inferior en una tarjeta doble. Su candado llega como locks.top y/o
   * locks.bottom apuntando a la MISMA prenda 'onepiece'; aquí se normaliza
   * a un candado único de pieza completa.
   */
  let onepieceLock: Garment | undefined;
  if (rawInput.locks.top?.slot === 'onepiece') onepieceLock = rawInput.locks.top;
  else if (rawInput.locks.bottom?.slot === 'onepiece') onepieceLock = rawInput.locks.bottom;
  const { top: _topLock, bottom: _bottomLock, ...restLocks } = rawInput.locks;
  const locks = onepieceLock ? restLocks : rawInput.locks;

  const input: SpinInput = { ...rawInput, locks, thermalMode: mode };
  const config = reelConfigFor(mode, rawInput.layerEnabled);

  /*
   * Etapa 1 + relajación (§13.3), en orden estricto:
   *   nivel 0: pools estrictos, sin repetir giros recientes.
   *   nivel 1: se elimina la penalización de repetición reciente.
   *   nivel 2: se expande el rango de ocasión (+-1 nivel de formalidad).
   *   nivel 3: se amplía la tolerancia de abrigo (+-1 nivel térmico).
   * Los candados NUNCA se relajan.
   */
  let relaxationLevel: 0 | 1 | 2 | 3 = 3;
  let candidates: Candidate[] = [];
  for (const level of [0, 1, 2, 3] as const) {
    const poolOptions: PoolOptions =
      level <= 1
        ? { occasionRelaxed: false, weatherRelaxed: false }
        : level === 2
          ? { occasionRelaxed: true, weatherRelaxed: false }
          : { occasionRelaxed: true, weatherRelaxed: true };
    const pools = buildPools(input, poolOptions);
    if (!requiredSlotsSatisfied(input, pools, config, onepieceLock)) continue;
    const generated = generateCandidates(input, pools, config, level === 0, onepieceLock);
    if (generated.length > 0) {
      candidates = generated;
      relaxationLevel = level;
      break;
    }
  }

  if (candidates.length === 0) {
    // Sin ninguna combinación posible por candados/pools: devolver vacío controlado.
    const empty: Candidate = {
      top: input.locks.top ?? undefined,
      bottom: input.locks.bottom ?? undefined,
      layer: input.locks.layer,
      shoes: input.locks.shoes,
      onepiece: onepieceLock,
      breakdown: {
        color: 0,
        formality: 0,
        warmth: 0,
        freshness: 0,
        subuse: 0,
        patternPenalty: 0,
        total: 0,
      },
    };
    return { outfit: empty, candidateCount: 0, relaxationLevel: 3, thermalMode: mode };
  }

  // Etapa 3 + 4: selección (ponderada en Modo Seguro · azar puro en Modo Caos).
  let winner: Candidate;
  if (input.settings.chaosMode) {
    winner = pick(candidates, input.rng);
  } else {
    const sorted = [...candidates].sort((a, b) => b.breakdown.total - a.breakdown.total);
    // §13.1 B: F = 0.10 (delta >= 3 niveles) se descarta en Modo Seguro.
    const eligible = sorted.filter((c) => c.breakdown.formality > 0.1);
    winner = weightedPick((eligible.length > 0 ? eligible : sorted).slice(0, TOP_K_SAFE), input.rng);
  }

  return {
    outfit: winner,
    candidateCount: candidates.length,
    relaxationLevel,
    thermalMode: mode,
  };
}
