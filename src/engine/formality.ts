/**
 * Reglas de formalidad y ocasión (§8.1 y §13.1 B).
 * Puro TypeScript, sin dependencias de UI.
 */

import type { Garment, Occasion } from './types';

export interface OccasionRule {
  min: number;
  max: number;
  /** Etiquetas que excluyen la prenda por completo en esta ocasión. */
  excludeTags: string[];
  /** Solo prendas con etiqueta sport. */
  onlySport?: boolean;
}

export const OCCASION_RULES: Record<Occasion, OccasionRule> = {
  all: { min: 1, max: 5, excludeTags: [] },
  classes: { min: 1, max: 2, excludeTags: ['night', 'gala'] },
  date: { min: 2, max: 3, excludeTags: ['sport', 'gym', 'home', 'beach'] },
  party: { min: 3, max: 4, excludeTags: ['sport', 'gym', 'home', 'beach'] },
  gym: { min: 1, max: 5, excludeTags: ['home', 'night', 'gala'], onlySport: true },
};

export const OCCASION_LABELS: Record<Occasion, string> = {
  all: 'Todo',
  classes: 'Clases',
  date: 'Salida',
  party: 'Fiesta',
  gym: 'Gym',
};

/** ¿La prenda entra en el rango de la ocasión? */
export function fitsOccasion(g: Garment, occasion: Occasion): boolean {
  const rule = OCCASION_RULES[occasion];
  if (rule.onlySport && !g.tags.includes('sport')) return false;
  if (g.formality < rule.min || g.formality > rule.max) return false;
  if (rule.excludeTags.some((t) => g.tags.includes(t))) return false;
  return true;
}

/** Relajación de ocasión (§13.3 paso 2): expande el rango permitido ±1 nivel. */
export function fitsOccasionRelaxed(g: Garment, occasion: Occasion): boolean {
  const rule = OCCASION_RULES[occasion];
  if (rule.onlySport) {
    // §8.1: en gym la etiqueta sport es exclusiva y tampoco se relaja.
    return g.tags.includes('sport');
  }
  if (g.formality < rule.min - 1 || g.formality > rule.max + 1) return false;
  if (rule.excludeTags.some((t) => g.tags.includes(t))) return false;
  return true;
}

/**
 * Coherencia de formalidad (§13.1 B): según el delta máximo entre pares.
 *  <=1 nivel: 1.00 · delta 2: 0.50 · delta >=3: 0.10.
 */
export function scoreFormality(garments: Garment[]): number {
  if (garments.length < 2) return 1;
  let maxDelta = 0;
  for (let i = 0; i < garments.length; i++) {
    for (let j = i + 1; j < garments.length; j++) {
      const delta = Math.abs(garments[i].formality - garments[j].formality);
      if (delta > maxDelta) maxDelta = delta;
    }
  }
  if (maxDelta <= 1) return 1;
  if (maxDelta === 2) return 0.5;
  return 0.1;
}
