/**
 * Outfit Roulette · Tokens de diseño "Boutique Arcade"
 *
 * Razones (R-31):
 * - "Pasteles de boutique + un solo acento de arcade": los 4 pasteles pertenecen
 *   a cada carrete (codificación funcional de categorías), el rosa chicle es el
 *   único color de acción (GIRAR), el amarillo candado solo marca carretes fijados.
 * - ink (#1B1630) es un ciruela-casi negro: mantiene contraste AAA y le da
 *   temperatura de "boutique" sin caer en el negro puro de las apps genéricas.
 * - Tokens en pares claro/oscuro desde el día 1 (R-21/R-34): ambos modos se prueban.
 */

export type ColorScheme = 'light' | 'dark';

export const palette = {
  // Marca
  ink: '#1B1630',
  inkSoft: '#5C5873',
  chicle: '#FF3D8B',
  candado: '#FFD60A',

  // Carretes (superficies)
  reelTop: '#FFD9EA',
  reelBottom: '#D9E6FF',
  reelLayer: '#D8F5E3',
  reelShoes: '#FFF1B8',

  // Neutros
  white: '#FFFFFF',
  surfaceLight: '#F5F4F9',
  lineLight: '#E4E2EC',
} as const;

export const colors = {
  light: {
    ink: '#1B1630',
    inkSoft: '#5C5873',
    bg: '#FFFFFF',
    surface: '#F5F4F9',
    surfaceRaised: '#FFFFFF',
    line: '#E4E2EC',
    chicle: '#FF3D8B',
    chiclePressed: '#E62E7A',
    onChicle: '#1B1630',
    candado: '#FFD60A',
    onCandado: '#1B1630',
    reelTop: '#FFD9EA',
    reelBottom: '#D9E6FF',
    reelLayer: '#D8F5E3',
    reelShoes: '#FFF1B8',
    danger: '#A1123C',
    scrim: 'rgba(27, 22, 48, 0.45)',
  },
  dark: {
    ink: '#F4F2FA',
    inkSoft: '#A9A4C0',
    bg: '#120F1C',
    surface: '#1D1930',
    surfaceRaised: '#251F3D',
    line: '#2E2946',
    chicle: '#FF5C9E',
    chiclePressed: '#FF7AB0',
    onChicle: '#120F1C',
    candado: '#FFD60A',
    onCandado: '#120F1C',
    reelTop: '#4A2040',
    reelBottom: '#1E3258',
    reelLayer: '#1B4332',
    reelShoes: '#4B3F12',
    danger: '#FF8FA3',
    scrim: 'rgba(0, 0, 0, 0.55)',
  },
} as const;

export type Theme = (typeof colors)[ColorScheme];

/** Carretes por categoría: fondo pastel claro / profundo oscuro. */
export const reelTint = {
  light: {
    top: '#FFD9EA',
    bottom: '#D9E6FF',
    layer: '#D8F5E3',
    shoes: '#FFF1B8',
    onepiece: '#E8DFFF',
  },
  dark: {
    top: '#4A2040',
    bottom: '#1E3258',
    layer: '#1B4332',
    shoes: '#4B3F12',
    onepiece: '#33265C',
  },
} as const;

/** Rejilla de 4pt (módulo base) + escala de espaciado 8pt. */
export const spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 40,
  nine: 48,
} as const;

/** Radios: tarjetas 20, hojas 28, pastilla solo para chips y CTA principal. */
export const radii = {
  sm: 10,
  md: 14,
  card: 20,
  sheet: 28,
  pill: 999,
} as const;

/** Áreas táctiles mínimas: 44pt iOS, 48dp Android. */
export const touchTarget = { min: 48 } as const;

export const shadows = {
  /** Elevación solo para elementos flotantes (botón GIRAR, FAB, hojas). */
  floating: {
    shadowColor: '#1B1630',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  sheet: {
    shadowColor: '#1B1630',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
} as const;
