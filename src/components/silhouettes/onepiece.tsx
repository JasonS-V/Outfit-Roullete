/**
 * Siluetas · Una pieza (6 formas base + variantes).
 */

import { Path } from 'react-native-svg';
import type { ShapeFn } from './colors';

const W = 2.8;
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
function Button({ x, y, r = 1.7, c }: { x: number; y: number; r?: number; c: ElProps['c'] }) {
  return <Path d={`M${x} ${y} m-${r} 0 a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 -${r * 2} 0`} fill={c.accent} />;
}

export const dressShort: ShapeFn = ({ c }) => (
  <>
    <Seam d="M49 30 L47 25" c={c} />
    <Seam d="M71 30 L73 25" c={c} />
    <Fill d="M48 30 Q60 37 72 30 L76 33 L74 46 Q80 60 86 88 Q60 94 34 88 Q40 60 46 46 L44 33 Z" c={c} />
    <Seam d="M46 49 Q60 54 74 49" c={c} />
    <Seam d="M35 84 Q60 90 85 84" c={c} o={0.45} />
  </>
);

export const dressShirt: ShapeFn = ({ c }) => (
  <>
    <Fill d="M46 33 Q60 40 74 33 L86 36 L93 44 L90 64 L94 98 L26 98 L30 64 L27 44 L34 36 Z" c={c} />
    <Path d="M47 33 L56 30 L60 37 L52 40 Z" fill={c.base} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />
    <Path d="M73 33 L64 30 L60 37 L68 40 Z" fill={c.base} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />
    <Seam d="M47 33 Q60 29 73 33" c={c} />
    <Seam d="M60 37 L60 98" c={c} />
    <Button x={60} y={50} c={c} />
    <Button x={60} y={62} c={c} />
    <Seam d="M29 60 L91 60" c={c} />
    <Path d="M56 57 L64 57 L64 63 L56 63 Z" fill={c.accent} />
  </>
);

export const dressMidi: ShapeFn = ({ c }) => (
  <>
    <Seam d="M49 30 L47 25" c={c} />
    <Seam d="M71 30 L73 25" c={c} />
    <Fill d="M48 30 Q60 37 72 30 L76 33 L78 46 Q88 70 94 104 L26 104 Q32 70 42 46 L44 33 Z" c={c} />
    <Seam d="M46 49 Q60 54 74 49" c={c} />
    <Seam d="M28 99 Q60 105 92 99" c={c} o={0.45} />
  </>
);

export const dressNight: ShapeFn = ({ c, variant }) => {
  const rib = variant === 'rib';
  return (
    <>
      <Fill d="M48 30 Q60 36 72 30 L76 33 L74 48 L76 100 Q60 104 44 100 L46 48 L44 33 Z" c={c} />
      <Seam d="M66 72 L68 98" c={c} o={0.5} />
      {rib && (
        <>
          <Seam d="M52 46 L50 100" c={c} o={0.4} />
          <Seam d="M56 44 L55 100" c={c} o={0.4} />
          <Seam d="M64 44 L65 100" c={c} o={0.4} />
          <Seam d="M68 46 L70 100" c={c} o={0.4} />
        </>
      )}
    </>
  );
};

export const jumpsuitLong: ShapeFn = ({ c, variant }) => {
  const cropped = variant === 'short';
  const utility = variant === 'utility';
  const legY = cropped ? 84 : 104;
  const innerY = cropped ? 62 : 68;
  return (
    <>
      <Fill
        d={`M46 33 Q60 40 74 33 L84 35 L88 40 L86 52 L82 60 L84 ${legY} L62 ${legY} L60 ${innerY} L58 ${legY} L36 ${legY} L38 60 L34 52 L32 40 L36 35 Z`}
        c={c}
      />
      <Seam d="M46 33 Q60 40 74 33" c={c} />
      {utility ? (
        <>
          <Seam d="M50 33 Q60 29 70 33" c={c} />
          <Seam d="M60 38 L60 60" c={c} />
          <Seam d="M42 46 L52 46 L52 56 L42 56 Z" c={c} />
          <Seam d="M68 46 L78 46 L78 56 L68 56 Z" c={c} />
          <Seam d="M38 64 L82 64" c={c} o={0.5} />
        </>
      ) : (
        <>
          <Seam d="M48 58 L72 58" c={c} />
          <Seam d="M56 58 L53 50" c={c} />
          <Seam d="M64 58 L67 50" c={c} />
          <Seam d="M60 58 L60 66" c={c} o={0.5} />
        </>
      )}
    </>
  );
};
