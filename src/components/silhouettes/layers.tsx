/**
 * Siluetas · Capa / abrigo (6 formas base + variantes).
 * Mangas largas, cuello y cierre frontal como señas comunes.
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
function Button({ x, y, r = 1.8, c }: { x: number; y: number; r?: number; c: ElProps['c'] }) {
  return <Path d={`M${x} ${y} m-${r} 0 a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 -${r * 2} 0`} fill={c.accent} />;
}

export const denimJacket: ShapeFn = ({ c }) => (
  <>
    <Fill d="M44 34 L60 44 L76 34 L90 36 L98 40 L100 68 L96 75 L84 67 L86 55 L88 96 L32 96 L34 55 L36 67 L24 75 L20 68 L22 40 L30 36 Z" c={c} />
    <Seam d="M50 34 Q60 30 70 34" c={c} />
    <Path d="M52 34 L58 32 L60 38 L54 40 Z" fill={c.base} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />
    <Path d="M68 34 L62 32 L60 38 L66 40 Z" fill={c.base} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />
    <Seam d="M54 38 L54 96" c={c} />
    <Seam d="M66 38 L66 96" c={c} />
    <Button x={54} y={50} c={c} />
    <Button x={54} y={62} c={c} />
    <Button x={54} y={74} c={c} />
    <Seam d="M38 48 L50 48 L50 60 L38 60 Z" c={c} />
    <Seam d="M70 48 L82 48 L82 60 L70 60 Z" c={c} />
    <Seam d="M38 54 L50 54" c={c} o={0.45} />
    <Seam d="M70 54 L82 54" c={c} o={0.45} />
    <Seam d="M32 90 L88 90" c={c} o={0.5} />
  </>
);

export const bomber: ShapeFn = ({ c, variant }) => {
  const wind = variant === 'wind';
  return (
    <>
      {wind && <Path d="M48 31 Q60 21 72 31 Q60 36 48 31 Z" fill={c.shade} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />}
      <Fill d="M44 33 Q60 41 76 33 L90 35 L98 39 L100 68 L96 76 L84 68 L86 56 L88 90 L32 90 L34 56 L36 68 L24 76 L20 68 L22 39 L30 35 Z" c={c} />
      {wind ? (
        <Seam d="M53 33 L53 42" c={c} />
      ) : (
        <>
          <Seam d="M50 32 Q60 27 70 32" c={c} />
          <Seam d="M51 34 Q60 29.5 69 34" c={c} o={0.45} />
        </>
      )}
      {wind && <Seam d="M67 33 L67 42" c={c} />}
      <Seam d="M60 31 L60 90" c={c} />
      <Path d="M58.5 40 L61.5 40 L61.5 46 L58.5 46 Z" fill={c.accent} />
      <Seam d="M32 84 L88 84" c={c} />
      <Seam d="M41 84 L41 90" c={c} o={0.4} />
      <Seam d="M60 84 L60 90" c={c} o={0.4} />
      <Seam d="M79 84 L79 90" c={c} o={0.4} />
    </>
  );
};

export const leatherJacket: ShapeFn = ({ c }) => (
  <>
    <Fill d="M44 33 Q60 41 76 33 L90 36 L96 40 L98 68 L94 76 L83 68 L85 56 L87 94 L33 94 L35 56 L37 68 L26 76 L22 68 L24 40 L30 36 Z" c={c} />
    <Seam d="M50 33 Q60 29 70 33" c={c} />
    <Seam d="M52 34 L62 44" c={c} />
    <Seam d="M68 34 L58 44" c={c} />
    <Seam d="M63 44 L53 90" c={c} />
    <Seam d="M33 88 L87 88" c={c} />
    <Path d="M56 85 L64 85 L64 91 L56 91 Z" fill={c.accent} />
  </>
);

export const puffer: ShapeFn = ({ c, variant }) => {
  if (variant === 'vest') {
    return (
      <>
        <Fill d="M44 33 Q60 41 76 33 L88 36 L92 42 L88 50 L88 94 L32 94 L32 50 L28 42 L32 36 Z" c={c} />
        <Seam d="M50 33 Q60 29 70 33" c={c} />
        <Seam d="M32 46 L88 46" c={c} />
        <Seam d="M32 56 L88 56" c={c} />
        <Seam d="M32 66 L88 66" c={c} />
        <Seam d="M32 76 L88 76" c={c} />
        <Seam d="M32 86 L88 86" c={c} />
        <Seam d="M60 33 L60 94" c={c} o={0.4} />
      </>
    );
  }
  const parka = variant === 'parka';
  return (
    <>
      {parka && <Path d="M48 30 Q60 20 72 30 Q60 35 48 30 Z" fill={c.shade} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />}
      <Fill d="M44 32 Q60 40 76 32 L92 35 L100 40 L102 70 L98 78 L86 70 L88 96 L32 96 L34 70 L22 78 L18 70 L20 40 L28 35 Z" c={c} />
      {parka && <Seam d="M48 30 Q60 20 72 30" c={c} />}
      <Seam d="M50 32 Q60 28 70 32" c={c} />
      <Seam d="M33 46 L87 46" c={c} />
      <Seam d="M32 56 L88 56" c={c} />
      <Seam d="M31 66 L89 66" c={c} />
      <Seam d="M32 76 L88 76" c={c} />
      <Seam d="M33 86 L87 86" c={c} />
      <Seam d="M60 34 L60 96" c={c} o={0.4} />
    </>
  );
};

export const coat: ShapeFn = ({ c, variant }) => {
  const trench = variant === 'trench';
  return (
    <>
      <Fill d="M44 34 Q60 42 76 34 L92 37 L100 42 L98 74 L92 80 L86 72 L88 58 L90 106 L30 106 L32 58 L34 72 L28 80 L22 74 L20 42 L28 37 Z" c={c} />
      <Seam d="M52 35 L62 46 L54 51 Z" c={c} />
      <Seam d="M68 35 L58 46 L66 51 Z" c={c} />
      {trench ? (
        <>
          <Seam d="M32 74 L88 74" c={c} />
          <Path d="M56 70.5 L66 70.5 L66 77.5 L56 77.5 Z" fill={c.base} stroke={c.stroke} strokeWidth={w} />
          <Button x={54} y={56} c={c} />
          <Button x={54} y={64} c={c} />
          <Button x={66} y={56} c={c} />
          <Button x={66} y={64} c={c} />
          <Button x={54} y={88} c={c} />
          <Button x={66} y={88} c={c} />
        </>
      ) : (
        <>
          <Seam d="M60 44 L60 104" c={c} />
          <Button x={60} y={56} c={c} />
          <Button x={60} y={68} c={c} />
          <Button x={60} y={80} c={c} />
          <Seam d="M40 66 L50 66" c={c} o={0.5} />
          <Seam d="M70 66 L80 66" c={c} o={0.5} />
        </>
      )}
    </>
  );
};

export const blazer: ShapeFn = ({ c }) => (
  <>
    <Fill d="M44 34 L60 46 L76 34 L90 37 L97 42 L96 72 L90 78 L84 70 L86 57 L88 100 L32 100 L34 57 L36 70 L30 78 L24 72 L23 42 L30 37 Z" c={c} />
    <Seam d="M52 36 L60 48" c={c} />
    <Seam d="M68 36 L60 48" c={c} />
    <Seam d="M60 48 L60 100" c={c} o={0.4} />
    <Button x={62} y={62} c={c} />
    <Button x={62} y={74} c={c} />
    <Seam d="M38 64 L48 64" c={c} o={0.55} />
    <Seam d="M72 64 L82 64" c={c} o={0.55} />
  </>
);
