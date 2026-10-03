/**
 * Starter pack del onboarding (§9, paso 3).
 * 9 recomendadas (3 por carrete) por estilo; 6 vienen pre-marcadas
 * como en el wireframe "Llevas 6 de 9 recomendadas".
 */

import type { Audience, BasicItem } from './catalog';
import { BASIC_BY_KEY } from './catalog';

export interface StarterSet {
  top: string[];
  bottom: string[];
  shoes: string[];
  /** Claves pre-marcadas al abrir el paso (2 por carrete). */
  checked: string[];
}

export const STARTER_SETS: Record<'fem' | 'masc' | 'uni', StarterSet> = {
  fem: {
    top: ['polo_basico', 'crop_basico', 'hoodie_oversize'],
    bottom: ['jean_recto', 'falda_tablas', 'leggings'],
    shoes: ['zapas_blancas', 'chelsea', 'converse'],
    checked: ['polo_basico', 'crop_basico', 'jean_recto', 'falda_tablas', 'zapas_blancas', 'chelsea'],
  },
  masc: {
    top: ['polo_basico', 'polo_oversize', 'hoodie_oversize'],
    bottom: ['jean_recto', 'cargo', 'jogger'],
    shoes: ['zapas_blancas', 'combat', 'converse'],
    checked: ['polo_basico', 'polo_oversize', 'jean_recto', 'cargo', 'zapas_blancas', 'combat'],
  },
  uni: {
    top: ['polo_basico', 'polo_oversize', 'hoodie_oversize'],
    bottom: ['jean_recto', 'cargo', 'jogger'],
    shoes: ['zapas_blancas', 'combat', 'converse'],
    checked: ['polo_basico', 'polo_oversize', 'jean_recto', 'cargo', 'zapas_blancas', 'combat'],
  },
};

export function starterSetFor(audience: Audience): StarterSet {
  return STARTER_SETS[audience];
}

export interface StarterRow {
  label: string;
  items: BasicItem[];
}

/** Filas visuales del paso 3: Superior, Inferior, Calzado. */
export function starterRows(audience: Audience): StarterRow[] {
  const set = starterSetFor(audience);
  const toItems = (keys: string[]) => keys.map((k) => BASIC_BY_KEY[k]);
  return [
    { label: 'Superior', items: toItems(set.top) },
    { label: 'Inferior', items: toItems(set.bottom) },
    { label: 'Calzado', items: toItems(set.shoes) },
  ];
}

export const STARTER_RECOMMENDED_COUNT = 9;
