/**
 * ColorMatrix · Armonía cromática (§13.1 A) + utilidades de color HSL.
 * Puro TypeScript: sin dependencias de React Native.
 */

import type { Garment } from './types';

export interface Hsl {
  h: number; // 0..360
  s: number; // 0..1
  l: number; // 0..1
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function hexToHsl(hex: string): Hsl {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
        break;
      case gn:
        h = ((bn - rn) / d + 2) * 60;
        break;
      default:
        h = ((rn - gn) / d + 4) * 60;
    }
  }
  return { h, s, l };
}

/** Luminancia relativa WCAG (para derivar tonos legibles). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(hexA: string, hexB: string): number {
  const la = relativeLuminance(hexA);
  const lb = relativeLuminance(hexB);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Mezcla lineal de dos colores (t = 0..1 hacia `to`). */
export function mix(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t);
}

/** Distancia tonal circular en grados (0..180). */
export function hueDistance(h1: number, h2: number): number {
  const d = Math.abs(h1 - h2) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Neutros absolutos (§13.1 A): blanco, negro, grises, denims, azul marino,
 * beige y marrón chocolate. Lista explícita, no heurística.
 */
const NEUTRAL_HEXES = new Set(
  [
    '#FFFFFF', // Blanco puro
    '#1A1A1A', // Negro azabache
    '#8E8E93', // Gris melange
    '#3A3A3C', // Gris marengo
    '#5D8AA8', // Azul denim claro
    '#1F4E79', // Azul denim clásico
    '#0B1B3D', // Azul marino
    '#D8C4B6', // Beige arena
    '#4A2E18', // Marrón chocolate
  ].map((c) => c.toUpperCase()),
);

/** Acento: fuera de la lista neutra y saturación HSL > 40%. */
export function isAccentColor(hex: string): boolean {
  if (NEUTRAL_HEXES.has(hex.toUpperCase())) return false;
  return hexToHsl(hex).s > 0.4;
}

export function isNeutralColor(hex: string): boolean {
  return !isAccentColor(hex);
}

export interface ColorHarmonyResult {
  score: number;
  accentCount: number;
  accentHues: number[];
}

/**
 * Puntuación de armonía cromática (§13.1 A):
 *  0 acentos = 1.00 · 1 acento = 0.95 · análogos (<=45) = 0.85 ·
 *  complementarios (150..210) = 0.75 · 2 lejanos no complementarios = 0.55 ·
 *  3+ acentos coordinados (todos <=45 entre sí) = 0.80 · conflicto = 0.20.
 */
export function scoreColorHarmony(garments: Garment[]): ColorHarmonyResult {
  const accentHues: number[] = [];
  for (const g of garments) {
    if (isAccentColor(g.colorHex)) accentHues.push(hexToHsl(g.colorHex).h);
  }
  const n = accentHues.length;
  if (n === 0) return { score: 1, accentCount: 0, accentHues };
  if (n === 1) return { score: 0.95, accentCount: 1, accentHues };
  if (n === 2) {
    const d = hueDistance(accentHues[0], accentHues[1]);
    if (d <= 45) return { score: 0.85, accentCount: 2, accentHues };
    if (d >= 150 && d <= 210) return { score: 0.75, accentCount: 2, accentHues };
    return { score: 0.55, accentCount: 2, accentHues };
  }
  // 3+ acentos: coordinados solo si todos los pares están a <= 45 grados.
  let coordinated = true;
  for (let i = 0; i < n && coordinated; i++) {
    for (let j = i + 1; j < n; j++) {
      if (hueDistance(accentHues[i], accentHues[j]) > 45) {
        coordinated = false;
        break;
      }
    }
  }
  return { score: coordinated ? 0.8 : 0.2, accentCount: n, accentHues };
}
