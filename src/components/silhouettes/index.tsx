/**
 * GarmentSilhouette · renderizador de siluetas.
 * Recibe la clave "forma:variante" y el color; deriva las 3 capas y pinta
 * el estampado cuando la prenda lo tiene (cuadros, floral o rueda).
 */

import { useMemo } from 'react';
import { Circle, G, Path, Svg } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';

import { deriveSilhouetteColors, type SilhouetteColors, type ShapeFn } from './colors';
import { tee, teeOversize, tank, crop, shirt, blouse, polo, crewneck, hoodie, turtleneck, cardigan, longsleeve, vestKnit } from './tops';
import { jeans, pantsWide, cargo, jogger, chino, shorts, sportsShorts, skirt, skirtLong, leggings } from './bottoms';
import { denimJacket, bomber, leatherJacket, puffer, coat, blazer } from './layers';
import { sneaker, highTop, runner, bootChelsea, bootCombat, bootWestern, loafer, sandal, heel, espadrille } from './shoes';
import { dressShort, dressShirt, dressMidi, dressNight, jumpsuitLong } from './onepiece';

export type PatternKind = 'plaid' | 'floral' | 'roulette';

const SHAPES: Record<string, ShapeFn> = {
  // Superior
  tee,
  tee_oversize: teeOversize,
  tank,
  crop,
  shirt,
  blouse,
  polo,
  crewneck,
  hoodie,
  turtleneck,
  cardigan,
  longsleeve,
  vest_knit: vestKnit,
  // Inferior
  jeans,
  pants_wide: pantsWide,
  cargo,
  jogger,
  chino,
  shorts,
  shorts_sport: sportsShorts,
  skirt,
  skirt_long: skirtLong,
  leggings,
  // Capa
  denim_jacket: denimJacket,
  bomber,
  leather_jacket: leatherJacket,
  puffer,
  coat,
  blazer,
  // Calzado
  sneaker,
  high_top: highTop,
  runner,
  boot_chelsea: bootChelsea,
  boot_combat: bootCombat,
  boot_western: bootWestern,
  loafer,
  sandal,
  heel,
  espadrille,
  // Una pieza
  dress_short: dressShort,
  dress_shirt: dressShirt,
  dress_midi: dressMidi,
  dress_night: dressNight,
  jumpsuit_long: jumpsuitLong,
};

/** Estampado asociado a la clave del básico (si aplica). */
export function patternFor(basicKey?: string): PatternKind | undefined {
  switch (basicKey) {
    case 'camisa_cuadros':
      return 'plaid';
    case 'polo_grafico':
      return 'roulette';
    case 'vestido_floreado':
      return 'floral';
    default:
      return undefined;
  }
}

function PatternMotif({ kind, c }: { kind: PatternKind; c: SilhouetteColors }) {
  if (kind === 'roulette') {
    return (
      <G opacity={0.9}>
        <Circle cx={60} cy={56} r={10} fill="none" stroke={c.accent} strokeWidth={2.4} />
        <Path d="M60 46 L60 66 M50 56 L70 56 M53 49 L67 63 M67 49 L53 63" stroke={c.accent} strokeWidth={1.8} />
        <Circle cx={60} cy={56} r={2.6} fill={c.accent} />
      </G>
    );
  }
  if (kind === 'plaid') {
    return (
      <G opacity={0.55}>
        <Path d="M50 42 L50 82 M60 42 L60 82 M70 42 L70 82" stroke={c.accent} strokeWidth={2.2} />
        <Path d="M40 50 L80 50 M40 62 L80 62 M40 74 L80 74" stroke={c.accent} strokeWidth={2.2} />
      </G>
    );
  }
  // floral
  return (
    <G opacity={0.85}>
      <Circle cx={52} cy={58} r={2.6} fill={c.accent} />
      <Circle cx={60} cy={52} r={2.2} fill={c.accent} />
      <Circle cx={68} cy={58} r={2.6} fill={c.accent} />
      <Circle cx={56} cy={66} r={2.2} fill={c.accent} />
      <Circle cx={64} cy={66} r={2.2} fill={c.accent} />
    </G>
  );
}

export interface GarmentSilhouetteProps {
  /** Clave "forma:variante", p. ej. "hoodie:zip". */
  silhouette: string;
  colorHex: string;
  hasPattern?: boolean;
  pattern?: PatternKind;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function GarmentSilhouette({
  silhouette,
  colorHex,
  hasPattern,
  pattern,
  size = 96,
  style,
}: GarmentSilhouetteProps) {
  const [shapeKey, variant] = silhouette.split(':');
  const colors = useMemo(() => deriveSilhouetteColors(colorHex), [colorHex]);
  const shape = SHAPES[shapeKey];
  return (
    <Svg viewBox="0 0 120 120" width={size} height={size} style={style}>
      {shape ? (
        shape({ c: colors, variant })
      ) : (
        // Respaldo honesto: una percha simple si falta la silueta.
        <Path
          d="M60 34 a7 7 0 1 1 5 11 L60 50 L30 72 Q26 78 34 82 L86 82 Q94 78 90 72 Z"
          fill={colors.base}
          stroke={colors.stroke}
          strokeWidth={2.8}
          strokeLinejoin="round"
        />
      )}
      {hasPattern && pattern ? <PatternMotif kind={pattern} c={colors} /> : null}
    </Svg>
  );
}
