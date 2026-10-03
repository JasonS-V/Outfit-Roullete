/**
 * Reglas térmicas (§8.2, §13.1 C).
 * Umbrales base: >=26 calor · 18..25 templado · <18 fresco · <14 frío intenso.
 * El ajuste personal (+2 friolento / -2 caluroso) desplaza los umbrales.
 */

import type { Garment, ThermalMode } from './types';

export interface ReelConfig {
  showLayer: boolean;
  layerRequired: boolean;
}

export function modeForTemperature(tempC: number, personalOffsetC: number): ThermalMode {
  if (tempC >= 26 + personalOffsetC) return 'summer';
  if (tempC >= 18 + personalOffsetC) return 'temperate';
  if (tempC >= 14 + personalOffsetC) return 'cold';
  return 'heavyCold';
}

/** Abrigo ideal sugerido por el clima (1..4). */
export function idealWarmth(mode: ThermalMode): number {
  switch (mode) {
    case 'summer':
      return 1;
    case 'temperate':
      return 2;
    case 'cold':
      return 3;
    case 'heavyCold':
      return 4;
  }
}

/**
 * Filtro duro de clima por prenda (§8.2):
 * - Calor: fuera abrigos/hoodies gruesos (warmth >= 3) y la etiqueta thermal.
 * - Fresco y frío: fuera prendas de verano (shorts, sin mangas, sandalias).
 * - Frío intenso: además, fuera todo lo muy ligero (warmth 1).
 */
export function passesWeather(g: Garment, mode: ThermalMode): boolean {
  switch (mode) {
    case 'summer':
      return g.warmth < 3 && !g.tags.includes('thermal');
    case 'temperate':
      return true;
    case 'cold':
      return !g.tags.includes('summer');
    case 'heavyCold':
      return !g.tags.includes('summer') && g.warmth >= 2;
  }
}

/** Relajación térmica (§13.3 paso 3): un nivel de tolerancia extra. */
export function passesWeatherRelaxed(g: Garment, mode: ThermalMode): boolean {
  switch (mode) {
    case 'summer':
      return g.warmth < 4 && !g.tags.includes('thermal');
    case 'temperate':
      return true;
    case 'cold':
      return true;
    case 'heavyCold':
      return !g.tags.includes('summer');
  }
}

/** Configuración de carretes según clima (§8.2 + §13.3). */
export function reelConfigFor(mode: ThermalMode, layerEnabled: boolean): ReelConfig {
  switch (mode) {
    case 'summer':
      return { showLayer: false, layerRequired: false };
    case 'temperate':
      return { showLayer: layerEnabled, layerRequired: false };
    case 'cold':
      return { showLayer: true, layerRequired: false };
    case 'heavyCold':
      return { showLayer: true, layerRequired: true };
  }
}

/**
 * Puntuación térmica (§13.1 C): promedio ponderado de abrigo contra el ideal.
 * Pesos por carrete: top .30, bottom .30, layer .25, shoes .15 (renormalizados).
 * Cada nivel de desviación descuenta 0.30.
 */
export function scoreWarmth(garments: Garment[], mode: ThermalMode): number {
  if (garments.length === 0) return 0;
  const weightFor = (g: Garment): number => {
    switch (g.slot) {
      case 'top':
        return 0.3;
      case 'bottom':
        return 0.3;
      case 'layer':
        return 0.25;
      case 'shoes':
        return 0.15;
      default:
        // Una pieza equivale a top + bottom.
        return 0.6;
    }
  };
  let weighted = 0;
  let totalWeight = 0;
  for (const g of garments) {
    const w = weightFor(g);
    weighted += g.warmth * w;
    totalWeight += w;
  }
  const avg = weighted / totalWeight;
  const deviation = Math.abs(avg - idealWarmth(mode));
  return Math.max(0, 1 - 0.3 * deviation);
}
