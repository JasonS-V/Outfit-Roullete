/**
 * Siluetas · Parte inferior (10 formas base + variantes).
 * Cintura en y=26, basta en y=100 (bajos) para un encuadre consistente.
 */

import { Circle, Path } from 'react-native-svg';
import type { ShapeFn } from './colors';

const W = 4;
const w = 1.6;

interface ElProps {
  c: import('./colors').SilhouetteColors;
}

function Fill({ d, c }: { d: string; c: ElProps['c'] }) {
  return (
    <Path d={d} fill={c.base} stroke={c.stroke} strokeWidth={W} strokeLinejoin="round" strokeLinecap="round" />
  );
}
function Seam({ d, c, o = 0.6 }: { d: string; c: ElProps['c']; o?: number }) {
  return <Path d={d} fill="none" stroke={c.stroke} strokeWidth={w} strokeLinecap="round" opacity={o} />;
}

export const jeans: ShapeFn = ({ c }) => (
  <>
    <Fill d="M38 26 L82 26 L86 30 L86 44 L82 100 L64 100 L60 62 L56 100 L38 100 L34 44 L34 30 Z" c={c} />
    <Seam d="M37 32.5 L85 32.5" c={c} />
    <Circle cx={60} cy={29.5} r={1.6} fill={c.accent} />
    <Seam d="M60 29.5 L60 40 L64 46" c={c} />
    <Seam d="M40 33 Q45 39 43 46" c={c} o={0.5} />
    <Seam d="M80 33 Q75 39 77 46" c={c} o={0.5} />
    <Seam d="M39.5 95 L63 95" c={c} o={0.45} />
    <Seam d="M57 95 L80.5 95" c={c} o={0.45} />
  </>
);

export const pantsWide: ShapeFn = ({ c }) => (
  <>
    <Fill d="M36 26 L84 26 L88 30 L88 44 L90 100 L62 100 L60 66 L58 100 L30 100 L32 44 L32 30 Z" c={c} />
    <Seam d="M36 32.5 L84 32.5" c={c} />
    <Circle cx={60} cy={29.5} r={1.6} fill={c.accent} />
    <Seam d="M60 29.5 L60 42" c={c} />
    <Seam d="M31.5 95 L57 95" c={c} o={0.45} />
    <Seam d="M63 95 L88.5 95" c={c} o={0.45} />
  </>
);

export const cargo: ShapeFn = ({ c }) => (
  <>
    <Fill d="M38 26 L82 26 L86 30 L86 46 L84 100 L62 100 L60 64 L58 100 L36 100 L34 46 L34 30 Z" c={c} />
    <Seam d="M37 32.5 L85 32.5" c={c} />
    <Circle cx={60} cy={29.5} r={1.6} fill={c.accent} />
    <Seam d="M60 29.5 L60 42" c={c} />
    <Path d="M34 56 L26 60 L26 72 L34 76 Z" fill={c.shade} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />
    <Path d="M86 56 L94 60 L94 72 L86 76 Z" fill={c.shade} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />
    <Seam d="M27 63 L34 66" c={c} o={0.45} />
    <Seam d="M93 63 L86 66" c={c} o={0.45} />
    <Seam d="M36.5 95 L57 95" c={c} o={0.45} />
    <Seam d="M63 95 L83.5 95" c={c} o={0.45} />
  </>
);

export const jogger: ShapeFn = ({ c }) => (
  <>
    <Fill d="M38 26 L82 26 L86 30 L86 44 L78 90 L76 98 L62 98 L60 64 L58 98 L44 98 L42 90 L34 44 L34 30 Z" c={c} />
    <Seam d="M37 32.5 L83 32.5" c={c} />
    <Seam d="M55 29.5 Q60 34 65 29.5" c={c} />
    <Circle cx={54.5} cy={28.5} r={1.1} fill={c.accent} />
    <Circle cx={65.5} cy={28.5} r={1.1} fill={c.accent} />
    <Seam d="M44 92 L57 92" c={c} />
    <Seam d="M63 92 L76 92" c={c} />
  </>
);

export const chino: ShapeFn = ({ c, variant }) => {
  const suit = variant === 'suit';
  return (
    <>
      <Fill d="M38 26 L82 26 L85 30 L85 44 L82 100 L63 100 L60 62 L57 100 L38 100 L35 44 L35 30 Z" c={c} />
      <Seam d="M38 32.5 L82 32.5" c={c} />
      {suit && <Seam d="M56 30 L56 44" c={c} o={0.5} />}
      {suit && <Seam d="M64 30 L64 44" c={c} o={0.5} />}
      <Seam d="M48 46 L45 96" c={c} o={0.45} />
      <Seam d="M72 46 L75 96" c={c} o={0.45} />
      <Seam d="M40 33 L46 39" c={c} o={0.5} />
      <Seam d="M80 33 L74 39" c={c} o={0.5} />
    </>
  );
};

export const shorts: ShapeFn = ({ c, variant }) => {
  const tight = variant === 'tight';
  const d = tight
    ? 'M40 32 L80 32 L84 36 L84 52 L80 86 L64 86 L60 64 L56 86 L40 86 L36 52 L36 36 Z'
    : 'M38 32 L82 32 L86 36 L86 50 L84 82 L64 82 L60 60 L56 82 L36 82 L34 50 L34 36 Z';
  return (
    <>
      <Fill d={d} c={c} />
      <Seam d={tight ? 'M39.5 38.5 L80.5 38.5' : 'M37 38.5 L83 38.5'} c={c} />
      <Seam d="M60 36 L60 44" c={c} o={0.5} />
      {!tight && <Seam d="M36 78 L56 78" c={c} o={0.45} />}
      {!tight && <Seam d="M64 78 L84 78" c={c} o={0.45} />}
      {variant === 'cargo' && (
        <>
          <Path d="M35 48 L27 52 L27 64 L35 68 Z" fill={c.shade} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />
          <Path d="M85 48 L93 52 L93 64 L85 68 Z" fill={c.shade} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />
        </>
      )}
    </>
  );
};

export const sportsShorts: ShapeFn = ({ c }) => (
  <>
    <Fill d="M38 30 L82 30 L86 34 L88 48 L86 72 L84 76 L64 76 L60 56 L56 76 L36 76 L34 72 L32 48 L34 34 Z" c={c} />
    <Seam d="M55 33 Q60 37 65 33" c={c} />
    <Seam d="M39 38 L37 74" c={c} />
    <Seam d="M81 38 L83 74" c={c} />
    <Seam d="M36 72 L56 72" c={c} o={0.45} />
    <Seam d="M64 72 L84 72" c={c} o={0.45} />
  </>
);

export const skirt: ShapeFn = ({ c, variant }) => {
  const midi = variant === 'midi';
  const d = midi
    ? 'M42 30 L78 30 L84 34 Q92 56 98 98 L22 98 Q28 56 36 34 Z'
    : 'M42 30 L78 30 L82 34 Q88 50 92 84 L28 84 Q32 50 38 34 Z';
  return (
    <>
      <Fill d={d} c={c} />
      <Seam d="M42 35.5 L78 35.5" c={c} />
      {midi ? (
        <>
          <Seam d="M46 35.5 L38 96" c={c} o={0.5} />
          <Seam d="M53 35.5 L47 96" c={c} o={0.5} />
          <Seam d="M60 35.5 L60 96" c={c} o={0.5} />
          <Seam d="M67 35.5 L73 96" c={c} o={0.5} />
          <Seam d="M74 35.5 L82 96" c={c} o={0.5} />
          <Seam d="M24 94 Q60 100 96 94" c={c} o={0.45} />
        </>
      ) : (
        <>
          <Seam d="M48 35.5 L42 82" c={c} o={0.5} />
          <Seam d="M54 35.5 L50 82" c={c} o={0.5} />
          <Seam d="M60 35.5 L60 82" c={c} o={0.5} />
          <Seam d="M66 35.5 L70 82" c={c} o={0.5} />
          <Seam d="M72 35.5 L78 82" c={c} o={0.5} />
          <Seam d="M30 80 Q60 84 90 80" c={c} o={0.45} />
        </>
      )}
    </>
  );
};

export const skirtLong: ShapeFn = ({ c }) => (
  <>
    <Fill d="M44 30 L76 30 L80 34 Q90 55 98 98 L22 98 Q30 55 40 34 Z" c={c} />
    <Seam d="M44 35.5 L76 35.5" c={c} />
    <Seam d="M64 38 Q72 62 78 96" c={c} o={0.35} />
    <Seam d="M24 94 Q60 100 96 94" c={c} o={0.45} />
  </>
);

export const leggings: ShapeFn = ({ c }) => (
  <>
    <Fill d="M40 26 L80 26 L84 30 L84 44 L78 102 L64 102 L60 60 L56 102 L42 102 L36 44 L36 30 Z" c={c} />
    <Seam d="M39.5 32 L39.5 35.5 L80.5 35.5 L80.5 32" c={c} />
    <Seam d="M43 96 L56 96" c={c} o={0.45} />
    <Seam d="M64 96 L77 96" c={c} o={0.45} />
  </>
);
