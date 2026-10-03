/**
 * Sistema de siluetas "sticker" (Boutique Arcade).
 *
 * Razón (R-31): trazo grueso redondeado + relleno plano con pliegues suaves.
 * Se lee como una pieza de juego de boutique, es coherente en los 4 carretes
 * y funciona a 40 px en la rejilla del armario sin perder legibilidad.
 *
 * Capas semánticas (§10.1): base-fill · shadow-shade · accent-details.
 */

import type { ReactNode } from 'react';
import { mix, relativeLuminance } from '@/engine';

export interface SilhouetteColors {
  /** Capa base (color dominante de la prenda). */
  base: string;
  /** Pliegues y volumen (tono desplazado, semitransparente en los trazos). */
  shade: string;
  /** Contorno y costuras. */
  stroke: string;
  /** Detalles: botones, cordones, suelas, costuras destacadas. */
  accent: string;
  /** Relleno de detalles claros (suela, ribetes) que deben contrastar. */
  paper: string;
}

export function deriveSilhouetteColors(hex: string): SilhouetteColors {
  const lum = relativeLuminance(hex);
  const isLight = lum > 0.42;
  return {
    base: hex,
    shade: mix(hex, isLight ? '#1B1630' : '#FFFFFF', 0.16),
    stroke: isLight ? mix(hex, '#1B1630', 0.58) : mix(hex, '#FFFFFF', 0.42),
    accent: isLight ? mix(hex, '#1B1630', 0.42) : mix(hex, '#FFFFFF', 0.34),
    paper: isLight ? mix(hex, '#FFFFFF', 0.7) : mix(hex, '#FFFFFF', 0.75),
  };
}

export interface ShapeProps {
  c: SilhouetteColors;
  /** Variante tras los dos puntos en la clave de silueta ("hoodie:zip"). */
  variant?: string;
}

export type ShapeFn = (props: ShapeProps) => ReactNode;
