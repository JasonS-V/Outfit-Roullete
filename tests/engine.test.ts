/**
 * Tests unitarios del motor de Outfit Roulette (SpinEngine).
 *
 * Referencias del documento maestro Outfit_Roulette_Master_Plan.md:
 *   - §13.1 A-F: fórmula del Match Score (color, formalidad, clima, frescura, subuso, penalizaciones).
 *   - §13.2: Modo Seguro vs Modo Caos.
 *   - §13.3: relajación de reglas ante armarios pequeños.
 *   - §8.1: matriz de ocasiones. §8.2: umbrales y filtros climáticos.
 *
 * Fixture propio: armarioBase() con 12 prendas sintéticas que cubren los 5 slots.
 * Notas de interpretación documentadas en el código que estos tests respetan:
 *   1. frescura devuelve 0.70 como valor intermedio cuando no aplica ningún caso exacto del spec;
 *   2. 2 acentos no análogos ni complementarios = 0.55;
 *   3. penalización de estampados = resta fija de 0.4 cuando hay 2 o más prendas estampadas;
 *   4. los candados del usuario nunca se relajan ni se filtran;
 *   5. orden de relajación: 1 repetición, 2 ocasión, 3 clima;
 *   6. en Modo Caos la selección es uniforme entre los candidatos generados.
 *
 * Las cuatro discrepancias detectadas por esta suite (descarte en Modo Seguro para
 * delta >= 3, gym estrictamente sport, subuso con historial de uso y candado de Capa
 * sin carrete activo) fueron corregidas en el motor; sus tests quedan como regresión.
 */

import { describe, expect, it } from 'vitest';
import {
  CANDIDATE_COUNT,
  FRESH_DAYS,
  PATTERN_PENALTY,
  RECENT_REPEAT_DAYS,
  SUBUSE_DAYS,
  TOP_K_SAFE,
  candidateKey,
  comboKey,
  fitsOccasion,
  fitsOccasionRelaxed,
  freshnessScore,
  hexToHsl,
  hueDistance,
  idealWarmth,
  isAccentColor,
  modeForTemperature,
  passesWeather,
  passesWeatherRelaxed,
  reelConfigFor,
  scoreCandidate,
  scoreColorHarmony,
  scoreFormality,
  scoreWarmth,
  spin,
  subuseScore,
} from '@/engine';
import type { Candidate, Garment, SpinInput, ThermalMode, WearLog } from '@/engine';

/* ------------------------------------------------------------------ */
/* Fixture y utilidades                                                */
/* ------------------------------------------------------------------ */

const DAY_MS = 24 * 60 * 60 * 1000;
/** Fecha fija para todo el archivo: nada depende del reloj real. */
const NOW = Date.UTC(2026, 9, 20, 15, 0, 0);

const ROJO = '#B22222';
const MOSTAZA = '#D4A017';
const VERDE_BOTELLA = '#1B4332';
const MILITAR = '#4B5320';
const NARANJA = '#C05621';

/** PRNG determinista (mulberry32) para inyectar en spin(). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type GarmentInit = Partial<Garment> & Pick<Garment, 'id' | 'slot'>;

function mkGarment(init: GarmentInit): Garment {
  return {
    name: init.id,
    silhouette: 'silueta-de-test',
    source: 'basic',
    colorHex: '#FFFFFF',
    colorName: 'blanco puro',
    colorFamily: 'neutral',
    hasPattern: false,
    warmth: 2,
    formality: 2,
    tags: [],
    isFavorite: false,
    isArchived: false,
    isLaundry: false,
    createdAt: NOW - 100 * DAY_MS,
    ...init,
  };
}

/** Armario sintético de 12 prendas: 3 arriba, 3 abajo, 3 calzado, 2 capa, 1 una pieza. */
function armarioBase(): Garment[] {
  return [
    mkGarment({ id: 'top-blanco', slot: 'top', name: 'Camiseta blanca', colorHex: '#FFFFFF', warmth: 1, formality: 2, tags: ['summer'] }),
    mkGarment({ id: 'top-oxford', slot: 'top', name: 'Camisa oxford', colorHex: '#D8C4B6', warmth: 2, formality: 3 }),
    mkGarment({ id: 'top-gym', slot: 'top', name: 'Polera gym', colorHex: '#1A1A1A', warmth: 1, formality: 1, tags: ['sport'] }),
    mkGarment({ id: 'bottom-jeans', slot: 'bottom', name: 'Jeans clásicos', colorHex: '#1F4E79', warmth: 2, formality: 2 }),
    mkGarment({ id: 'bottom-jogger', slot: 'bottom', name: 'Jogger gris', colorHex: '#8E8E93', warmth: 2, formality: 1, tags: ['sport'] }),
    mkGarment({ id: 'bottom-vestir', slot: 'bottom', name: 'Pantalón de vestir', colorHex: '#1A1A1A', warmth: 3, formality: 4 }),
    mkGarment({ id: 'shoes-urbanas', slot: 'shoes', name: 'Zapatillas urbanas', colorHex: '#FFFFFF', warmth: 2, formality: 2 }),
    mkGarment({ id: 'shoes-running', slot: 'shoes', name: 'Zapatillas running', colorHex: '#8E8E93', warmth: 2, formality: 1, tags: ['sport'] }),
    mkGarment({ id: 'shoes-botines', slot: 'shoes', name: 'Botines Chelsea', colorHex: '#4A2E18', warmth: 3, formality: 3 }),
    mkGarment({ id: 'layer-bomber', slot: 'layer', name: 'Bomber verde militar', colorHex: '#4B5320', warmth: 3, formality: 3 }),
    mkGarment({ id: 'layer-parka', slot: 'layer', name: 'Parka térmica', colorHex: '#1A1A1A', warmth: 4, formality: 4, tags: ['thermal'] }),
    mkGarment({ id: 'onepiece-vestido', slot: 'onepiece', name: 'Vestido negro', colorHex: '#1A1A1A', warmth: 2, formality: 3 }),
  ];
}

function tomar(id: string): Garment {
  const g = armarioBase().find((x) => x.id === id);
  if (!g) throw new Error(`Prenda no encontrada en el fixture: ${id}`);
  return g;
}

type OpcionesEntrada = Partial<Omit<SpinInput, 'thermalMode'>> & {
  /** Atajo de conveniencia sobre settings.personalOffsetC. */
  personalOffsetC?: number;
  /** Atajo de conveniencia sobre settings.chaosMode. */
  chaosMode?: boolean;
  /** Atajo de conveniencia sobre history.wearLogs. */
  wearLogs?: WearLog[];
  /** Atajo de conveniencia sobre history.recentComboKeys. */
  recentComboKeys?: string[];
};

function input(overrides: OpcionesEntrada = {}): Omit<SpinInput, 'thermalMode'> {
  const { personalOffsetC = 0, chaosMode = false, wearLogs, recentComboKeys, history, ...rest } = overrides;
  return {
    garments: armarioBase(),
    locks: {},
    occasion: 'all',
    temperatureC: 20,
    layerEnabled: false,
    now: NOW,
    rng: mulberry32(1),
    ...rest,
    settings: { personalOffsetC, chaosMode },
    history: history ?? { wearLogs: wearLogs ?? [], recentComboKeys: recentComboKeys ?? [] },
  };
}

/** Igual que input() pero con thermalMode ya calculado, para scoreCandidate(). */
function spinInput(overrides: OpcionesEntrada = {}): SpinInput {
  const raw = input(overrides);
  return { ...raw, thermalMode: modeForTemperature(raw.temperatureC, raw.settings.personalOffsetC) };
}

function itemsOf(outfit: Candidate): Garment[] {
  return [outfit.top, outfit.bottom, outfit.layer, outfit.shoes, outfit.onepiece].filter(
    (g): g is Garment => Boolean(g),
  );
}

function candidato(items: Garment[]): Candidate {
  const candidate: Candidate = {
    breakdown: { color: 0, formality: 0, warmth: 0, freshness: 0, subuse: 0, patternPenalty: 0, total: 0 },
  };
  for (const g of items) candidate[g.slot] = g;
  return candidate;
}

function wearLog(garmentIds: string[], dateMs: number): WearLog {
  return { id: `log-${dateMs}-${garmentIds.join('+')}`, wornOn: '2026-10-20', dateMs, garmentIds };
}

function prendaDeColor(hex: string, slot: Garment['slot'] = 'top'): Garment {
  return mkGarment({ id: `prenda-${hex}-${slot}`, slot, colorHex: hex });
}

const SEMILLAS = [1, 2, 3, 5, 8, 13];

/* ------------------------------------------------------------------ */
/* §13.1 A: Armonía cromática                                          */
/* ------------------------------------------------------------------ */

describe('§13.1 A: armonía cromática (scoreColorHarmony)', () => {
  it('base 100% neutra puntúa 1.00 (0 acentos)', () => {
    const res = scoreColorHarmony([
      prendaDeColor('#FFFFFF'),
      prendaDeColor('#1F4E79', 'bottom'),
      prendaDeColor('#FFFFFF', 'shoes'),
    ]);
    expect(res.accentCount).toBe(0);
    expect(res.score).toBe(1);
  });

  it('una única prenda de acento puntúa 0.95', () => {
    const res = scoreColorHarmony([
      prendaDeColor(ROJO),
      prendaDeColor('#1A1A1A', 'bottom'),
      prendaDeColor('#FFFFFF', 'shoes'),
    ]);
    expect(res.accentCount).toBe(1);
    expect(res.score).toBe(0.95);
  });

  it('dos acentos análogos (distancia <= 45 grados) puntúan 0.85', () => {
    const d = hueDistance(hexToHsl(ROJO).h, hexToHsl(MOSTAZA).h);
    expect(d).toBeLessThanOrEqual(45);
    const res = scoreColorHarmony([prendaDeColor(ROJO), prendaDeColor(MOSTAZA, 'bottom')]);
    expect(res.accentCount).toBe(2);
    expect(res.score).toBe(0.85);
  });

  it('dos acentos complementarios (150 a 210 grados) puntúan 0.75', () => {
    const d = hueDistance(hexToHsl(ROJO).h, hexToHsl(VERDE_BOTELLA).h);
    expect(d).toBeGreaterThanOrEqual(150);
    expect(d).toBeLessThanOrEqual(210);
    const res = scoreColorHarmony([prendaDeColor(ROJO), prendaDeColor(VERDE_BOTELLA, 'bottom')]);
    expect(res.accentCount).toBe(2);
    expect(res.score).toBe(0.75);
  });

  it('tres acentos descoordinados puntúan 0.20 (conflicto cromático)', () => {
    const items = [
      prendaDeColor(ROJO),
      prendaDeColor(MOSTAZA, 'bottom'),
      prendaDeColor(VERDE_BOTELLA, 'shoes'),
    ];
    // ROJO y VERDE_BOTELLA están a más de 45 grados: no están coordinados.
    expect(hueDistance(hexToHsl(ROJO).h, hexToHsl(VERDE_BOTELLA).h)).toBeGreaterThan(45);
    const res = scoreColorHarmony(items);
    expect(res.accentCount).toBe(3);
    expect(res.score).toBe(0.2);
  });

  it('tres acentos coordinados puntúan 0.80 (el spec no fija este valor; interpretación documentada)', () => {
    // §13.1 A solo define 0.20 para 3+ acentos descoordinados; el motor usa 0.80
    // cuando todos los pares están a <= 45 grados (comentario en src/engine/color.ts).
    const hues = [hexToHsl(ROJO).h, hexToHsl(NARANJA).h, hexToHsl(MOSTAZA).h];
    for (let i = 0; i < hues.length; i++) {
      for (let j = i + 1; j < hues.length; j++) {
        expect(hueDistance(hues[i], hues[j])).toBeLessThanOrEqual(45);
      }
    }
    const res = scoreColorHarmony([
      prendaDeColor(ROJO),
      prendaDeColor(NARANJA, 'bottom'),
      prendaDeColor(MOSTAZA, 'shoes'),
    ]);
    expect(res.accentCount).toBe(3);
    expect(res.score).toBe(0.8);
  });

  it('dos acentos ni análogos ni complementarios puntúan 0.55 (el spec no fija este valor)', () => {
    const d = hueDistance(hexToHsl(ROJO).h, hexToHsl(MILITAR).h);
    expect(d).toBeGreaterThan(45);
    expect(d).toBeLessThan(150);
    const res = scoreColorHarmony([prendaDeColor(ROJO), prendaDeColor(MILITAR, 'bottom')]);
    expect(res.score).toBe(0.55);
  });

  it('isAccentColor respeta la lista de neutros absolutos y la saturación > 40%', () => {
    // Azul denim clásico: saturación > 40% pero está en la lista explícita de neutros.
    expect(hexToHsl('#1F4E79').s).toBeGreaterThan(0.4);
    expect(isAccentColor('#1F4E79')).toBe(false);
    expect(isAccentColor('#FFFFFF')).toBe(false);
    expect(isAccentColor('#8E8E93')).toBe(false);
    expect(isAccentColor(ROJO)).toBe(true);
    expect(isAccentColor(MILITAR)).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/* §13.1 B: Coherencia de formalidad                                   */
/* ------------------------------------------------------------------ */

describe('§13.1 B: coherencia de formalidad (scoreFormality)', () => {
  const conFormalidad = (formality: number, id: string): Garment =>
    mkGarment({ id, slot: 'top', formality: formality as Garment['formality'] });

  it('delta <= 1 nivel puntúa 1.00', () => {
    expect(scoreFormality([conFormalidad(2, 'a'), conFormalidad(3, 'b'), conFormalidad(2, 'c')])).toBe(1);
  });

  it('delta exactamente 2 niveles puntúa 0.50', () => {
    expect(scoreFormality([conFormalidad(1, 'a'), conFormalidad(3, 'b')])).toBe(0.5);
  });

  it('delta >= 3 niveles puntúa 0.10', () => {
    expect(scoreFormality([conFormalidad(1, 'a'), conFormalidad(4, 'b')])).toBe(0.1);
    expect(scoreFormality([conFormalidad(1, 'a'), conFormalidad(5, 'b')])).toBe(0.1);
  });

  it('en Modo Seguro se descartan los outfits con delta >= 3 (§13.1 B)', () => {
    // Regresión: la selección en Modo Seguro excluye candidatos con F = 0.10.
    const garments = [
      mkGarment({ id: 'top-f2', slot: 'top', formality: 2 }),
      mkGarment({ id: 'top-f1', slot: 'top', formality: 1 }),
      mkGarment({ id: 'bottom-f4', slot: 'bottom', formality: 4 }),
      mkGarment({ id: 'shoes-f2', slot: 'shoes', formality: 2 }),
    ];
    const ganadores = Array.from({ length: 60 }, (_, i) => spin(input({ garments, rng: mulberry32(i + 1) })));
    const conDelta3 = ganadores.filter((r) => scoreFormality(itemsOf(r.outfit)) < 0.5);
    expect(conDelta3.length).toBe(0);
  });
});

/* ------------------------------------------------------------------ */
/* §8.2 y §13.1 C: clima                                               */
/* ------------------------------------------------------------------ */

describe('§8.2 y §13.1 C: clima (umbrales, filtros y abrigo)', () => {
  it('umbrales base: 26 verano, 18 templado, 14 fresco, menos de 14 frío intenso', () => {
    const casos: Array<[number, ThermalMode]> = [
      [35, 'summer'],
      [26, 'summer'],
      [25.9, 'temperate'],
      [18, 'temperate'],
      [17.9, 'cold'],
      [14, 'cold'],
      [13.9, 'heavyCold'],
      [-5, 'heavyCold'],
    ];
    for (const [temp, esperado] of casos) expect(modeForTemperature(temp, 0)).toBe(esperado);
  });

  it('ajuste friolento (+2): los umbrales se desplazan a 28 / 20 / 16', () => {
    // §8.2: "Soy friolento/a: Desplaza los umbrales +2°C (la casaca aparece con 20°C)".
    const casos: Array<[number, ThermalMode]> = [
      [28, 'summer'],
      [27.9, 'temperate'],
      [20, 'temperate'],
      [19.9, 'cold'],
      [19, 'cold'],
      [16, 'cold'],
      [15.9, 'heavyCold'],
    ];
    for (const [temp, esperado] of casos) expect(modeForTemperature(temp, 2)).toBe(esperado);
  });

  it('ajuste caluroso (-2): los umbrales se desplazan a 24 / 16 / 12', () => {
    // §8.2: "Soy caluroso/a: Desplaza los umbrales -2°C (la casaca aparece recién con 16°C)".
    const casos: Array<[number, ThermalMode]> = [
      [24, 'summer'],
      [23.9, 'temperate'],
      [16, 'temperate'],
      [15.9, 'cold'],
      [15, 'cold'],
      [12, 'cold'],
      [11.9, 'heavyCold'],
    ];
    for (const [temp, esperado] of casos) expect(modeForTemperature(temp, -2)).toBe(esperado);
  });

  it('idealWarmth devuelve 1 / 2 / 3 / 4 por modo', () => {
    expect(idealWarmth('summer')).toBe(1);
    expect(idealWarmth('temperate')).toBe(2);
    expect(idealWarmth('cold')).toBe(3);
    expect(idealWarmth('heavyCold')).toBe(4);
  });

  it('passesWeather en verano excluye abrigo grueso (warmth >= 3) y etiqueta thermal', () => {
    expect(passesWeather(mkGarment({ id: 'w2', slot: 'top', warmth: 2 }), 'summer')).toBe(true);
    expect(passesWeather(mkGarment({ id: 'w3', slot: 'top', warmth: 3 }), 'summer')).toBe(false);
    expect(passesWeather(mkGarment({ id: 'w4', slot: 'layer', warmth: 4 }), 'summer')).toBe(false);
    expect(passesWeather(mkGarment({ id: 'term', slot: 'top', warmth: 2, tags: ['thermal'] }), 'summer')).toBe(false);
  });

  it('passesWeather en templado no excluye ninguna prenda', () => {
    expect(passesWeather(mkGarment({ id: 'w1', slot: 'top', warmth: 1, tags: ['summer'] }), 'temperate')).toBe(true);
    expect(passesWeather(mkGarment({ id: 'w4', slot: 'layer', warmth: 4, tags: ['thermal'] }), 'temperate')).toBe(true);
  });

  it('passesWeather en fresco excluye la etiqueta summer (shorts, sin mangas, sandalias)', () => {
    expect(passesWeather(mkGarment({ id: 'w2', slot: 'bottom', warmth: 2 }), 'cold')).toBe(true);
    expect(passesWeather(mkGarment({ id: 'w1s', slot: 'top', warmth: 1, tags: ['summer'] }), 'cold')).toBe(false);
  });

  it('passesWeather en frío intenso exige warmth >= 2 y excluye summer', () => {
    expect(passesWeather(mkGarment({ id: 'w2', slot: 'top', warmth: 2 }), 'heavyCold')).toBe(true);
    expect(passesWeather(mkGarment({ id: 'w1', slot: 'top', warmth: 1 }), 'heavyCold')).toBe(false);
    expect(passesWeather(mkGarment({ id: 'w2s', slot: 'top', warmth: 2, tags: ['summer'] }), 'heavyCold')).toBe(false);
    expect(passesWeather(mkGarment({ id: 'w4t', slot: 'layer', warmth: 4, tags: ['thermal'] }), 'heavyCold')).toBe(true);
  });

  it('passesWeatherRelaxed amplía un nivel de tolerancia (§13.3 paso 3)', () => {
    // En verano se admite warmth 3, pero no warmth 4 ni thermal.
    expect(passesWeatherRelaxed(mkGarment({ id: 'w3', slot: 'top', warmth: 3 }), 'summer')).toBe(true);
    expect(passesWeatherRelaxed(mkGarment({ id: 'w4', slot: 'layer', warmth: 4 }), 'summer')).toBe(false);
    expect(passesWeatherRelaxed(mkGarment({ id: 'term', slot: 'top', warmth: 2, tags: ['thermal'] }), 'summer')).toBe(false);
    // En fresco ya no se excluye nada; en frío intenso se admite warmth 1.
    expect(passesWeatherRelaxed(mkGarment({ id: 'w1s', slot: 'top', warmth: 1, tags: ['summer'] }), 'cold')).toBe(true);
    expect(passesWeatherRelaxed(mkGarment({ id: 'w1', slot: 'top', warmth: 1 }), 'heavyCold')).toBe(true);
    expect(passesWeatherRelaxed(mkGarment({ id: 'w1s', slot: 'top', warmth: 1, tags: ['summer'] }), 'heavyCold')).toBe(false);
  });

  it('reelConfigFor: verano oculta Capa, templado opcional, fresco activa, frío intenso obliga', () => {
    expect(reelConfigFor('summer', true)).toEqual({ showLayer: false, layerRequired: false });
    expect(reelConfigFor('temperate', false)).toEqual({ showLayer: false, layerRequired: false });
    expect(reelConfigFor('temperate', true)).toEqual({ showLayer: true, layerRequired: false });
    expect(reelConfigFor('cold', false)).toEqual({ showLayer: true, layerRequired: false });
    expect(reelConfigFor('heavyCold', false)).toEqual({ showLayer: true, layerRequired: true });
  });

  it('scoreWarmth: promedio igual al ideal puntúa 1.00', () => {
    const items = [
      mkGarment({ id: 'a', slot: 'top', warmth: 2 }),
      mkGarment({ id: 'b', slot: 'bottom', warmth: 2 }),
      mkGarment({ id: 'c', slot: 'shoes', warmth: 2 }),
    ];
    expect(scoreWarmth(items, 'temperate')).toBeCloseTo(1, 10);
    // Una pieza se evalúa como prenda única contra el ideal del modo.
    expect(scoreWarmth([mkGarment({ id: 'd', slot: 'onepiece', warmth: 2 })], 'temperate')).toBeCloseTo(1, 10);
  });

  it('scoreWarmth: cada nivel de desviación descuenta 0.30', () => {
    const conWarmth = (w: number, id: string): Garment => mkGarment({ id, slot: 'top', warmth: w as Garment['warmth'] });
    expect(scoreWarmth([conWarmth(3, 'a'), conWarmth(3, 'b')], 'temperate')).toBeCloseTo(0.7, 10);
    expect(scoreWarmth([conWarmth(1, 'a'), conWarmth(1, 'b')], 'temperate')).toBeCloseTo(0.7, 10);
    expect(scoreWarmth([conWarmth(4, 'a')], 'summer')).toBeCloseTo(0.1, 10);
  });

  it('integración: el giro nunca devuelve prendas que no pasan el filtro de clima (nivel 0)', () => {
    const escenarios: Array<[number, ThermalMode]> = [
      [30, 'summer'],
      [20, 'temperate'],
      [15, 'cold'],
      [5, 'heavyCold'],
    ];
    for (const [temperatureC, modo] of escenarios) {
      for (const seed of SEMILLAS) {
        const res = spin(input({ temperatureC, layerEnabled: true, rng: mulberry32(seed) }));
        expect(res.relaxationLevel).toBe(0);
        for (const g of itemsOf(res.outfit)) expect(passesWeather(g, modo)).toBe(true);
      }
    }
  });
});

/* ------------------------------------------------------------------ */
/* §8.1: matriz de ocasiones                                           */
/* ------------------------------------------------------------------ */

describe('§8.1: matriz de ocasiones', () => {
  const g = (formality: number, tags: string[], id: string): Garment =>
    mkGarment({ id, slot: 'top', formality: formality as Garment['formality'], tags });

  it('fitsOccasion respeta el rango de formalidad y las etiquetas excluidas', () => {
    // Todo: 1 a 5, sin exclusiones.
    expect(fitsOccasion(g(1, [], 't1'), 'all')).toBe(true);
    expect(fitsOccasion(g(5, ['night', 'gala'], 't5'), 'all')).toBe(true);
    // Clases: 1 a 2; excluye night y gala.
    expect(fitsOccasion(g(1, [], 'c1'), 'classes')).toBe(true);
    expect(fitsOccasion(g(2, [], 'c2'), 'classes')).toBe(true);
    expect(fitsOccasion(g(3, [], 'c3'), 'classes')).toBe(false);
    expect(fitsOccasion(g(2, ['night'], 'cN'), 'classes')).toBe(false);
    expect(fitsOccasion(g(1, ['gala'], 'cG'), 'classes')).toBe(false);
    // Salida: 2 a 3; excluye sport, gym, home y beach.
    expect(fitsOccasion(g(2, [], 'd2'), 'date')).toBe(true);
    expect(fitsOccasion(g(3, [], 'd3'), 'date')).toBe(true);
    expect(fitsOccasion(g(1, [], 'd1'), 'date')).toBe(false);
    expect(fitsOccasion(g(4, [], 'd4'), 'date')).toBe(false);
    expect(fitsOccasion(g(2, ['sport'], 'dS'), 'date')).toBe(false);
    expect(fitsOccasion(g(3, ['gym'], 'dG'), 'date')).toBe(false);
    expect(fitsOccasion(g(3, ['home'], 'dH'), 'date')).toBe(false);
    expect(fitsOccasion(g(3, ['beach'], 'dB'), 'date')).toBe(false);
    // Fiesta: 3 a 4; excluye sport, gym, home y beach.
    expect(fitsOccasion(g(3, [], 'p3'), 'party')).toBe(true);
    expect(fitsOccasion(g(4, [], 'p4'), 'party')).toBe(true);
    expect(fitsOccasion(g(2, [], 'p2'), 'party')).toBe(false);
    expect(fitsOccasion(g(5, [], 'p5'), 'party')).toBe(false);
    expect(fitsOccasion(g(3, ['sport'], 'pS'), 'party')).toBe(false);
    expect(fitsOccasion(g(4, ['home'], 'pH'), 'party')).toBe(false);
    // Gym: exclusivamente etiqueta sport (cualquier formalidad).
    expect(fitsOccasion(g(1, ['sport'], 'g1'), 'gym')).toBe(true);
    expect(fitsOccasion(g(5, ['sport'], 'g5'), 'gym')).toBe(true);
    expect(fitsOccasion(g(1, [], 'gNo'), 'gym')).toBe(false);
    expect(fitsOccasion(g(2, ['sport', 'home'], 'gH'), 'gym')).toBe(false);
  });

  it('fitsOccasionRelaxed expande el rango ±1 nivel sin levantar las etiquetas excluidas', () => {
    expect(fitsOccasionRelaxed(g(3, [], 'r3'), 'classes')).toBe(true);
    expect(fitsOccasionRelaxed(g(4, [], 'r4'), 'classes')).toBe(false);
    expect(fitsOccasionRelaxed(g(2, ['night'], 'rN'), 'classes')).toBe(false);
    expect(fitsOccasionRelaxed(g(1, [], 'r1'), 'date')).toBe(true);
    expect(fitsOccasionRelaxed(g(4, [], 'r4d'), 'date')).toBe(true);
    expect(fitsOccasionRelaxed(g(5, [], 'r5d'), 'date')).toBe(false);
    expect(fitsOccasionRelaxed(g(3, ['sport'], 'rS'), 'date')).toBe(false);
  });

  it('la relajación de gym mantiene "exclusivamente sport" (§8.1 y caso QA 10)', () => {
    // Regresión: en gym la etiqueta sport es exclusiva también en el filtro relajado.
    expect(fitsOccasionRelaxed(mkGarment({ id: 'top-casual', slot: 'top', tags: [] }), 'gym')).toBe(false);
  });

  it.each(['all', 'classes', 'date', 'party', 'gym'] as const)(
    'integración: con ocasión %s el giro solo devuelve prendas válidas (nivel 0)',
    (occasion) => {
      for (const seed of [1, 2, 3, 7, 11, 42]) {
        const res = spin(input({ occasion, rng: mulberry32(seed) }));
        expect(res.relaxationLevel).toBe(0);
        const items = itemsOf(res.outfit);
        expect(items.length).toBeGreaterThan(0);
        for (const g0 of items) expect(fitsOccasion(g0, occasion)).toBe(true);
      }
    },
  );
});

/* ------------------------------------------------------------------ */
/* §13.1 D: frescura anti-repetición                                   */
/* ------------------------------------------------------------------ */

describe('§13.1 D: frescura anti-repetición (freshnessScore)', () => {
  const base = () => candidato([tomar('top-blanco'), tomar('bottom-jeans'), tomar('shoes-urbanas')]);
  const ids = ['top-blanco', 'bottom-jeans', 'shoes-urbanas'];

  it('la combinación exacta usada en los últimos 3 días puntúa 0.00', () => {
    expect(freshnessScore(base(), [wearLog(ids, NOW - 1 * DAY_MS)], NOW)).toBe(0);
    expect(freshnessScore(base(), [wearLog(ids, NOW - 2 * DAY_MS)], NOW)).toBe(0);
  });

  it('el orden de los ids no importa: el combo se compara canónicamente', () => {
    const enOtroOrden = ['shoes-urbanas', 'top-blanco', 'bottom-jeans'];
    expect(comboKey(enOtroOrden)).toBe(comboKey(ids));
    expect(freshnessScore(base(), [wearLog(enOtroOrden, NOW - 1 * DAY_MS)], NOW)).toBe(0);
  });

  it('límite: exactamente 3 días atrás sigue contando como reciente (0.00)', () => {
    expect(freshnessScore(base(), [wearLog(ids, NOW - 3 * DAY_MS)], NOW)).toBe(0);
  });

  it('una prenda individual usada ayer puntúa 0.40', () => {
    expect(freshnessScore(base(), [wearLog(['top-blanco'], NOW - 1 * DAY_MS)], NOW)).toBe(0.4);
    expect(freshnessScore(base(), [wearLog(['bottom-jeans'], NOW - 12 * 60 * 60 * 1000)], NOW)).toBe(0.4);
  });

  it('sin uso en 5 días o más puntúa 1.00', () => {
    expect(freshnessScore(base(), [], NOW)).toBe(1);
    expect(freshnessScore(base(), [wearLog(['top-blanco'], NOW - 5 * DAY_MS)], NOW)).toBe(1);
    expect(freshnessScore(base(), [wearLog(ids, NOW - 30 * DAY_MS)], NOW)).toBe(1);
  });

  it('se usa el registro de uso más reciente de cada prenda', () => {
    // La camiseta tiene un uso viejo y otro de hace 2 días: manda el más reciente.
    const logs = [wearLog(['top-blanco'], NOW - 10 * DAY_MS), wearLog(['top-blanco'], NOW - 2 * DAY_MS)];
    expect(freshnessScore(base(), logs, NOW)).toBe(0.7);
  });

  it('valor intermedio 0.70 cuando no aplica ningún caso del spec (interpretación documentada)', () => {
    // Una prenda usada hace 3 días (ni ayer ni dentro de la ventana de 5 días) no
    // encaja en las reglas de §13.1 D; el motor devuelve 0.70 (documentado en engine.ts).
    expect(freshnessScore(base(), [wearLog(['shoes-urbanas'], NOW - 3 * DAY_MS)], NOW)).toBe(0.7);
  });
});

/* ------------------------------------------------------------------ */
/* §13.1 E: reactivación de subuso                                     */
/* ------------------------------------------------------------------ */

describe('§13.1 E: reactivación de subuso (subuseScore)', () => {
  it('una prenda recién creada no aporta subuso', () => {
    const nueva = mkGarment({ id: 'nueva', slot: 'top', createdAt: NOW - 10 * DAY_MS });
    expect(subuseScore(candidato([nueva]), NOW)).toBe(0);
  });

  it('una prenda creada hace más de 30 días aporta subuso (proporción de dormidas)', () => {
    const vieja = mkGarment({ id: 'vieja', slot: 'top', createdAt: NOW - 40 * DAY_MS });
    const nueva = mkGarment({ id: 'nueva', slot: 'bottom', createdAt: NOW - 10 * DAY_MS });
    expect(subuseScore(candidato([vieja]), NOW)).toBe(1);
    expect(subuseScore(candidato([vieja, nueva]), NOW)).toBe(0.5);
  });

  it('una prenda usada ayer no es "dormida" aunque se creara hace 60 días (§13.1 E)', () => {
    // Regresión: subuseScore recibe el historial y usa el último uso registrado.
    const usadaAyer = mkGarment({ id: 'usada-ayer', slot: 'top', createdAt: NOW - 60 * DAY_MS });
    expect(subuseScore(candidato([usadaAyer]), NOW, [wearLog(['usada-ayer'], NOW - DAY_MS)])).toBe(0);
  });
});

/* ------------------------------------------------------------------ */
/* §13.1 F: penalizaciones severas                                     */
/* ------------------------------------------------------------------ */

describe('§13.1 F: penalizaciones severas (estampados y dedupe)', () => {
  it('una sola prenda estampada no genera penalización', () => {
    const items = [
      mkGarment({ id: 'a', slot: 'top', hasPattern: true }),
      mkGarment({ id: 'b', slot: 'bottom' }),
      mkGarment({ id: 'c', slot: 'shoes' }),
    ];
    expect(scoreCandidate(candidato(items), spinInput()).patternPenalty).toBe(0);
  });

  it('dos o más prendas estampadas restan 0.4 fija (interpretación documentada de la penalización)', () => {
    const dos = [
      mkGarment({ id: 'a', slot: 'top', hasPattern: true }),
      mkGarment({ id: 'b', slot: 'bottom', hasPattern: true }),
      mkGarment({ id: 'c', slot: 'shoes' }),
    ];
    const tres = [
      mkGarment({ id: 'a', slot: 'top', hasPattern: true }),
      mkGarment({ id: 'b', slot: 'bottom', hasPattern: true }),
      mkGarment({ id: 'c', slot: 'shoes', hasPattern: true }),
    ];
    expect(scoreCandidate(candidato(dos), spinInput()).patternPenalty).toBe(PATTERN_PENALTY);
    expect(scoreCandidate(candidato(tres), spinInput()).patternPenalty).toBe(PATTERN_PENALTY);
  });

  it('la fórmula total aplica los pesos del spec (0.30/0.20/0.20/0.15/0.15) y el total queda en [0, 1]', () => {
    const b = scoreCandidate(
      candidato([tomar('top-blanco'), tomar('bottom-jeans'), tomar('shoes-urbanas')]),
      spinInput({ temperatureC: 30 }),
    );
    // Verano (ideal 1): top w1, bottom w2 y shoes w2 dan promedio ponderado 1.6 => W = 1 - 0.3*0.6.
    expect(b.color).toBe(1);
    expect(b.formality).toBe(1);
    expect(b.warmth).toBeCloseTo(0.82, 10);
    expect(b.freshness).toBe(1);
    expect(b.subuse).toBe(1);
    expect(b.patternPenalty).toBe(0);
    expect(b.total).toBeCloseTo(0.964, 10);
    expect(b.total).toBeGreaterThanOrEqual(0);
    expect(b.total).toBeLessThanOrEqual(1);
  });

  it('el total se recorta a 0 cuando las penalizaciones superan la suma ponderada', () => {
    const items = [
      mkGarment({ id: 'top-rojo', slot: 'top', colorHex: ROJO, formality: 1, warmth: 1, hasPattern: true, createdAt: NOW - 10 * DAY_MS }),
      mkGarment({ id: 'bottom-verde', slot: 'bottom', colorHex: VERDE_BOTELLA, formality: 4, warmth: 4, hasPattern: true, createdAt: NOW - 10 * DAY_MS }),
      mkGarment({ id: 'shoes-mostaza', slot: 'shoes', colorHex: MOSTAZA, formality: 1, warmth: 1, createdAt: NOW - 10 * DAY_MS }),
    ];
    const logs = [wearLog(['top-rojo', 'bottom-verde', 'shoes-mostaza'], NOW - 1 * DAY_MS)];
    const b = scoreCandidate(candidato(items), spinInput({ temperatureC: 30, history: { wearLogs: logs, recentComboKeys: [] } }));
    expect(b.color).toBe(0.2); // 3 acentos descoordinados
    expect(b.formality).toBe(0.1); // delta 3
    expect(b.patternPenalty).toBe(0.4);
    expect(b.total).toBe(0); // 0.06 + 0.02 + 0.128 + 0 + 0 - 0.4 = -0.192, recortado a 0
  });

  it('los giros recientes de la sesión (lista de hasta 20) se descartan en el nivel 0', () => {
    const garments = [tomar('top-blanco'), tomar('top-oxford'), tomar('bottom-jeans'), tomar('shoes-urbanas')];
    const comboReciente = comboKey(['top-blanco', 'bottom-jeans', 'shoes-urbanas']);
    // Simula la ventana de "últimos 20 giros" de la app: 1 clave real y 19 de relleno.
    const recientes = [comboReciente, ...Array.from({ length: 19 }, (_, i) => comboKey([`fantasma-${i}`, 'x', 'y']))];
    const comboValido = comboKey(['top-oxford', 'bottom-jeans', 'shoes-urbanas']);
    for (const seed of SEMILLAS) {
      const res = spin(input({ garments, recentComboKeys: recientes, rng: mulberry32(seed) }));
      expect(res.relaxationLevel).toBe(0);
      expect(res.candidateCount).toBe(1);
      expect(candidateKey(res.outfit)).not.toBe(comboReciente);
      expect(candidateKey(res.outfit)).toBe(comboValido);
    }
  });
});

/* ------------------------------------------------------------------ */
/* §13.2: Modo Seguro vs Modo Caos                                     */
/* ------------------------------------------------------------------ */

describe('§13.2: Modo Seguro vs Modo Caos', () => {
  it('constantes del spec: N = 40 candidatos y Top K = 3 en Modo Seguro', () => {
    expect(CANDIDATE_COUNT).toBe(40);
    expect(TOP_K_SAFE).toBe(3);
  });

  it('Modo Seguro concentra la selección en los mejores candidatos (Top 3)', () => {
    const semillas = Array.from({ length: 100 }, (_, i) => i + 1);
    const seguros = semillas.map((s) => spin(input({ rng: mulberry32(s) })));
    const caos = semillas.map((s) => spin(input({ chaosMode: true, rng: mulberry32(s) })));
    const promedio = (rs: typeof seguros): number =>
      rs.reduce((acc, r) => acc + r.outfit.breakdown.total, 0) / rs.length;
    const minSeguro = Math.min(...seguros.map((r) => r.outfit.breakdown.total));
    const minCaos = Math.min(...caos.map((r) => r.outfit.breakdown.total));
    const mediaSeguro = promedio(seguros);
    const mediaCaos = promedio(caos);
    expect(mediaSeguro, `medias: seguro=${mediaSeguro} caos=${mediaCaos}`).toBeGreaterThan(mediaCaos + 0.05);
    expect(minSeguro, `mínimos: seguro=${minSeguro} caos=${minCaos}`).toBeGreaterThan(minCaos);
  });

  it('Modo Caos selecciona con azar puro sobre todo el arreglo de candidatos', () => {
    // Se registra la secuencia exacta de rng() de un giro y se repite variando solo la
    // última llamada (la de selección): con 0 debe salir el primer candidato y con ~1 el último.
    const base = mulberry32(42);
    const valores: number[] = [];
    const primera = spin(
      input({
        chaosMode: true,
        rng: () => {
          const v = base();
          valores.push(v);
          return v;
        },
      }),
    );
    expect(primera.candidateCount).toBeGreaterThan(5);
    const n = valores.length;
    const reproducirConFinal = (final: number) => {
      let i = 0;
      return () => {
        const v = i < n - 1 ? valores[i] : final;
        i += 1;
        return v;
      };
    };
    const primero = spin(input({ chaosMode: true, rng: reproducirConFinal(0) }));
    const ultimo = spin(input({ chaosMode: true, rng: reproducirConFinal(0.999999) }));
    expect(primero.candidateCount).toBe(ultimo.candidateCount);
    expect(candidateKey(primero.outfit)).not.toBe(candidateKey(ultimo.outfit));
  });

  it('Modo Caos mantiene los candados y el filtro de clima (§13.2)', () => {
    const bloqueada = tomar('bottom-vestir'); // warmth 3: no pasa el verano, pero es candado
    expect(passesWeather(bloqueada, 'summer')).toBe(false);
    for (const seed of SEMILLAS) {
      const res = spin(input({ chaosMode: true, temperatureC: 30, locks: { bottom: bloqueada }, rng: mulberry32(seed) }));
      expect(res.outfit.bottom?.id).toBe('bottom-vestir');
      for (const g of itemsOf(res.outfit)) {
        if (g.id !== 'bottom-vestir') expect(passesWeather(g, 'summer')).toBe(true);
      }
      expect(res.relaxationLevel).toBe(0);
    }
  });
});

/* ------------------------------------------------------------------ */
/* §13.3: relajación de reglas                                         */
/* ------------------------------------------------------------------ */

describe('§13.3: relajación de reglas ante armarios pequeños', () => {
  it('nivel 0: sin relajación cuando el armario estricto ya produce candidatos', () => {
    for (const seed of SEMILLAS) {
      const res = spin(input({ rng: mulberry32(seed) }));
      expect(res.relaxationLevel).toBe(0);
      expect(res.candidateCount).toBeGreaterThan(0);
    }
  });

  it('paso 1: elimina la penalización de repetición reciente (nivel 1)', () => {
    const garments = [tomar('top-blanco'), tomar('bottom-jeans'), tomar('shoes-urbanas')];
    const key = comboKey(['top-blanco', 'bottom-jeans', 'shoes-urbanas']);
    const res = spin(input({ garments, recentComboKeys: [key], rng: mulberry32(3) }));
    expect(res.relaxationLevel).toBe(1);
    expect(res.candidateCount).toBe(1);
    expect(candidateKey(res.outfit)).toBe(key);
  });

  it('paso 2: expande el rango de ocasión ±1 (nivel 2)', () => {
    const garments = [
      mkGarment({ id: 'top-f2', slot: 'top', formality: 2, colorHex: '#FFFFFF' }),
      mkGarment({ id: 'bottom-f3', slot: 'bottom', formality: 3, colorHex: '#1F4E79' }),
      mkGarment({ id: 'shoes-f2', slot: 'shoes', formality: 2, colorHex: '#FFFFFF' }),
    ];
    expect(fitsOccasion(garments[1], 'classes')).toBe(false);
    expect(fitsOccasionRelaxed(garments[1], 'classes')).toBe(true);
    const res = spin(input({ garments, occasion: 'classes', rng: mulberry32(5) }));
    expect(res.relaxationLevel).toBe(2);
    expect(res.outfit.bottom?.id).toBe('bottom-f3');
  });

  it('paso 3: amplía la tolerancia de abrigo ±1 nivel (nivel 3)', () => {
    const garments = [
      mkGarment({ id: 'top-w2', slot: 'top', warmth: 2 }),
      mkGarment({ id: 'bottom-w2', slot: 'bottom', warmth: 2 }),
      mkGarment({ id: 'shoes-w2', slot: 'shoes', warmth: 2 }),
      mkGarment({ id: 'layer-w1', slot: 'layer', warmth: 1, colorHex: MILITAR }),
    ];
    expect(passesWeather(garments[3], 'heavyCold')).toBe(false);
    expect(passesWeatherRelaxed(garments[3], 'heavyCold')).toBe(true);
    const res = spin(input({ garments, temperatureC: 10, rng: mulberry32(7) }));
    expect(res.thermalMode).toBe('heavyCold');
    expect(res.relaxationLevel).toBe(3);
    expect(res.outfit.layer?.id).toBe('layer-w1');
  });

  it('el orden se respeta: repetición (nivel 1) antes que ocasión (nivel 2)', () => {
    const garments = [
      tomar('top-blanco'),
      tomar('bottom-jeans'),
      tomar('shoes-urbanas'),
      mkGarment({ id: 'bottom-f3', slot: 'bottom', formality: 3 }),
    ];
    const combo = comboKey(['top-blanco', 'bottom-jeans', 'shoes-urbanas']);
    const res = spin(input({ garments, occasion: 'classes', recentComboKeys: [combo], rng: mulberry32(11) }));
    // La relajación de ocasión (que admitiría bottom-f3) no se aplica: basta el nivel 1.
    expect(res.relaxationLevel).toBe(1);
    expect(candidateKey(res.outfit)).toBe(combo);
    expect(res.outfit.bottom?.id).toBe('bottom-jeans');
  });

  it('los candados saltan los filtros de clima y ocasión y no se relajan', () => {
    const res = spin(
      input({
        temperatureC: 30,
        occasion: 'gym',
        locks: { top: tomar('top-blanco'), bottom: tomar('bottom-vestir'), shoes: tomar('shoes-urbanas') },
        rng: mulberry32(4),
      }),
    );
    // Ninguna de las tres prendas cumple la ocasión gym, y el pantalón tampoco el clima de verano.
    expect(fitsOccasion(tomar('top-blanco'), 'gym')).toBe(false);
    expect(fitsOccasion(tomar('bottom-vestir'), 'gym')).toBe(false);
    expect(passesWeather(tomar('bottom-vestir'), 'summer')).toBe(false);
    expect(res.outfit.top?.id).toBe('top-blanco');
    expect(res.outfit.bottom?.id).toBe('bottom-vestir');
    expect(res.outfit.shoes?.id).toBe('shoes-urbanas');
    expect(res.relaxationLevel).toBe(0);
  });

  it('el candado de Capa se respeta aunque el carrete Capa esté desactivado (§13.3: nunca se relajan)', () => {
    // Regresión: un candado de capa fuerza su inclusión aunque el carrete esté apagado.
    const res = spin(input({ temperatureC: 20, layerEnabled: false, locks: { layer: tomar('layer-bomber') }, rng: mulberry32(2) }));
    expect(res.outfit.layer?.id).toBe('layer-bomber');
  });

  it('una prenda en lavandería no participa en ningún giro y una archivada tampoco', () => {
    const conLavanderia = [
      mkGarment({ id: 'top-sucia', slot: 'top', isLaundry: true }),
      tomar('top-oxford'),
      tomar('bottom-jeans'),
      tomar('shoes-urbanas'),
    ];
    for (const seed of SEMILLAS) {
      const res = spin(input({ garments: conLavanderia, rng: mulberry32(seed) }));
      expect(res.relaxationLevel).toBe(0);
      expect(res.outfit.top?.id).toBe('top-oxford');
    }
    const conArchivada = [
      tomar('top-blanco'),
      mkGarment({ id: 'bottom-archivado', slot: 'bottom', isArchived: true }),
      tomar('bottom-jogger'),
      tomar('shoes-urbanas'),
    ];
    const res = spin(input({ garments: conArchivada, rng: mulberry32(9) }));
    expect(res.outfit.bottom?.id).toBe('bottom-jogger');
  });

  it('si la disponibilidad no alcanza ni con relajación máxima, devuelve vacío controlado', () => {
    const garments = [
      mkGarment({ id: 'top-ok', slot: 'top', warmth: 2 }),
      mkGarment({ id: 'bottom-ok', slot: 'bottom', warmth: 2 }),
      mkGarment({ id: 'shoes-ok', slot: 'shoes', warmth: 2 }),
      mkGarment({ id: 'layer-lavado', slot: 'layer', warmth: 3, isLaundry: true }),
      mkGarment({ id: 'layer-archivada', slot: 'layer', warmth: 3, isArchived: true }),
    ];
    const res = spin(input({ garments, temperatureC: 5, rng: mulberry32(1) }));
    expect(res.thermalMode).toBe('heavyCold'); // Capa obligatoria y ninguna disponible
    expect(res.candidateCount).toBe(0);
    expect(itemsOf(res.outfit)).toHaveLength(0);
  });

  it('armario con una sola prenda por carrete: devuelve esa combinación (caso QA 14)', () => {
    const garments = [tomar('top-blanco'), tomar('bottom-jeans'), tomar('shoes-urbanas')];
    const res = spin(input({ garments, rng: mulberry32(6) }));
    expect(res.relaxationLevel).toBe(0);
    expect(res.candidateCount).toBe(1);
    expect(itemsOf(res.outfit).map((g) => g.id).sort()).toEqual(['bottom-jeans', 'shoes-urbanas', 'top-blanco']);
  });
});

/* ------------------------------------------------------------------ */
/* Distancia tonal y utilidades de color                               */
/* ------------------------------------------------------------------ */

describe('utilidades de color (apoyo de §13.1 A)', () => {
  it('hueDistance es circular (0 a 180 grados)', () => {
    expect(hueDistance(0, 20)).toBe(20);
    expect(hueDistance(350, 10)).toBe(20);
    expect(hueDistance(10, 350)).toBe(20);
    expect(hueDistance(0, 180)).toBe(180);
    expect(hueDistance(90, 270)).toBe(180);
  });

  it('hexToHsl convierte colores conocidos del fixture', () => {
    expect(hexToHsl(ROJO).h).toBeCloseTo(0, 6);
    expect(hexToHsl('#FFFFFF')).toEqual({ h: 0, s: 0, l: 1 });
    expect(hexToHsl('#000000')).toEqual({ h: 0, s: 0, l: 0 });
  });
});

/* ------------------------------------------------------------------ */
/* Determinismo de spin()                                              */
/* ------------------------------------------------------------------ */

describe('spin: determinismo con rng y now inyectados', () => {
  it('con la misma rng inyectada el resultado es idéntico', () => {
    const a = spin(input({ rng: mulberry32(123) }));
    const b = spin(input({ rng: mulberry32(123) }));
    expect(a).toEqual(b);
  });

  it('el resultado es determinista también en Modo Caos y con candados', () => {
    const a = spin(input({ chaosMode: true, locks: { top: tomar('top-oxford') }, rng: mulberry32(99) }));
    const b = spin(input({ chaosMode: true, locks: { top: tomar('top-oxford') }, rng: mulberry32(99) }));
    expect(a).toEqual(b);
  });

  it('la rng inyectada gobierna la generación de candidatos', () => {
    const a = spin(input({ rng: () => 0 }));
    const b = spin(input({ rng: () => 0.999 }));
    expect(candidateKey(a.outfit)).toBe(comboKey(['onepiece-vestido', 'shoes-urbanas']));
    expect(a.outfit.top).toBeUndefined();
    expect(a.outfit.onepiece?.id).toBe('onepiece-vestido');
    expect(candidateKey(b.outfit)).toBe(comboKey(['top-gym', 'bottom-vestir', 'shoes-botines']));
    expect(a.candidateCount).toBe(1);
    expect(b.candidateCount).toBe(1);
  });

  it('el ganador sale de los candidatos generados: candidateCount entre 1 y 40', () => {
    for (const seed of SEMILLAS) {
      const res = spin(input({ rng: mulberry32(seed) }));
      expect(res.candidateCount).toBeGreaterThanOrEqual(1);
      expect(res.candidateCount).toBeLessThanOrEqual(CANDIDATE_COUNT);
      expect(itemsOf(res.outfit).length).toBeGreaterThan(0);
    }
  });

  it('con un armario amplio se generan los 40 candidatos del spec', () => {
    const amplio = [
      ...armarioBase(),
      ...armarioBase().map((g) => ({ ...g, id: `${g.id}-b`, tags: [...g.tags] })),
      ...armarioBase().map((g) => ({ ...g, id: `${g.id}-c`, tags: [...g.tags] })),
    ];
    for (const seed of [1, 2, 3, 4]) {
      const res = spin(input({ garments: amplio, rng: mulberry32(seed) }));
      expect(res.candidateCount).toBe(CANDIDATE_COUNT);
    }
  });

  it('thermalMode del resultado lo calcula el motor desde la temperatura', () => {
    expect(spin(input({ temperatureC: 30 })).thermalMode).toBe('summer');
    expect(spin(input({ temperatureC: 20 })).thermalMode).toBe('temperate');
    expect(spin(input({ temperatureC: 15 })).thermalMode).toBe('cold');
    expect(spin(input({ temperatureC: 5 })).thermalMode).toBe('heavyCold');
    expect(spin(input({ temperatureC: 17, personalOffsetC: 2 })).thermalMode).toBe('cold');
    expect(spin(input({ temperatureC: 17, personalOffsetC: -2 })).thermalMode).toBe('temperate');
  });

  it('las constantes de frescura y subuso coinciden con el spec', () => {
    expect(RECENT_REPEAT_DAYS).toBe(3); // §13.1 D: últimos 3 días
    expect(FRESH_DAYS).toBe(5); // §13.1 D: 5 o más días sin uso
    expect(SUBUSE_DAYS).toBe(30); // §13.1 E: más de 30 días
    expect(PATTERN_PENALTY).toBe(0.4); // §13.1 F: penalización por estampados
  });
});
