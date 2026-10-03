/**
 * Siluetas · Parte superior (13 formas).
 * Estilo sticker: una forma base + pliegues + detalles en la capa acento.
 */

import { Circle, Path } from 'react-native-svg';
import type { ShapeFn } from './colors';

const W = 2.8; // trazo principal
const w = 1.6; // trazo de detalle

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
function Shade({ d, c, o = 0.5 }: { d: string; c: ElProps['c']; o?: number }) {
  return <Path d={d} fill={c.shade} stroke="none" opacity={o} />;
}
function Button({ x, y, r = 1.9, c }: { x: number; y: number; r?: number; c: ElProps['c'] }) {
  return <Circle cx={x} cy={y} r={r} fill={c.accent} />;
}

/** Neckline según variante ('v' para cuello en V). */
function neck(v: string | undefined): string {
  return v === 'v' ? 'M46 33 L60 48 L74 33' : 'M46 33 Q60 41 74 33';
}

export const tee: ShapeFn = ({ c, variant }) => (
  <>
    <Fill
      d={`${neck(variant)} L86 34 L94 38 L99 52 L96 60 L82 54 L84 95 L36 95 L38 54 L24 60 L21 52 L26 38 L34 34 Z`}
      c={c}
    />
    <Seam d={neck(variant)} c={c} />
    <Seam d="M36 89 L84 89" c={c} />
    <Seam d="M93 45 L97 55" c={c} o={0.45} />
    <Seam d="M27 45 L23 55" c={c} o={0.45} />
  </>
);

export const teeOversize: ShapeFn = ({ c }) => (
  <>
    <Fill d="M44 32 Q60 39 76 32 L89 33 L97 37 L104 54 L99 64 L84 57 L86 98 L34 98 L36 57 L21 64 L16 54 L23 37 L31 33 Z" c={c} />
    <Seam d="M44 32 Q60 39 76 32" c={c} />
    <Seam d="M36 92 L84 92" c={c} />
    <Seam d="M96 44 L100 58" c={c} o={0.45} />
    <Seam d="M24 44 L20 58" c={c} o={0.45} />
  </>
);

export const tank: ShapeFn = ({ c }) => (
  <>
    <Fill d="M44 38 Q60 47 76 38 L84 31 L90 33 Q96 37 94.5 45 L90 93 L30 93 L25.5 45 Q24 37 30 33 L36 31 L44 38 Z" c={c} />
    <Seam d="M44 38 Q60 47 76 38" c={c} />
    <Seam d="M30 88 L90 88" c={c} />
  </>
);

export const crop: ShapeFn = ({ c }) => (
  <>
    <Fill d="M46 33 Q60 42 74 33 L86 34 L94 38 L99 50 L95 58 L82 53 L83 75 L37 75 L38 53 L25 58 L21 50 L26 38 L34 34 Z" c={c} />
    <Seam d="M46 33 Q60 42 74 33" c={c} />
    <Seam d="M37 71 L83 71" c={c} />
  </>
);

export const shirt: ShapeFn = ({ c, variant }) => {
  const short = variant === 'short';
  const overshirt = variant === 'overshirt';
  const d = short
    ? 'M46 32 L34 34 L23 39 L18 52 L30 57 L41 50 L38 96 L82 96 L79 50 L90 57 L102 52 L97 39 L86 34 L74 32 Q60 41 46 32 Z'
    : overshirt
      ? 'M46 32 L34 34 L24 38 L18 66 L30 71 L41 56 L39 98 L81 98 L79 56 L90 71 L102 66 L96 38 L86 34 L74 32 Q60 41 46 32 Z'
      : 'M46 32 L34 34 L23 38 L16 68 L29 73 L40 57 L38 96 L82 96 L79 57 L91 73 L104 68 L97 38 L86 34 L74 32 Q60 41 46 32 Z';
  return (
    <>
      <Fill d={d} c={c} />
      <Path d="M47 32 L56 29 L60 36 L52 39 Z" fill={c.base} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />
      <Path d="M73 32 L64 29 L60 36 L68 39 Z" fill={c.base} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />
      <Seam d="M47 32 Q60 28 73 32" c={c} />
      <Seam d="M60 36 L60 96" c={c} />
      <Button x={60} y={48} c={c} />
      <Button x={60} y={59} c={c} />
      <Button x={60} y={70} c={c} />
      <Button x={60} y={81} c={c} />
      {short ? (
        <>
          <Seam d="M20 47 L31 52" c={c} o={0.45} />
          <Seam d="M100 47 L89 52" c={c} o={0.45} />
        </>
      ) : (
        <>
          <Seam d="M18 63 L30 68" c={c} o={0.45} />
          <Seam d="M102 63 L90 68" c={c} o={0.45} />
        </>
      )}
      {overshirt && (
        <>
          <Seam d="M42 50 L56 50 L56 64 L42 64 Z" c={c} />
          <Seam d="M64 50 L78 50 L78 64 L64 64 Z" c={c} />
          <Seam d="M42 55 L56 55" c={c} o={0.45} />
          <Seam d="M64 55 L78 55" c={c} o={0.45} />
        </>
      )}
    </>
  );
};

export const blouse: ShapeFn = ({ c }) => (
  <>
    <Fill d="M46 34 Q60 42 74 34 L86 36 L99 51 L94 62 L83 56 L85 93 Q60 99 36 93 L37 56 L26 62 L21 51 L34 36 Z" c={c} />
    <Seam d="M46 34 Q60 42 74 34" c={c} />
    <Seam d="M96 47 L92 58" c={c} o={0.45} />
    <Seam d="M24 47 L28 58" c={c} o={0.45} />
    <Shade d="M40 60 Q38 76 41 90 L52 92 Q48 76 49 62 Z" o={0.35} c={c} />
  </>
);

export const polo: ShapeFn = ({ c }) => (
  <>
    <Fill d="M46 33 Q60 41 74 33 L87 34 L95 38 L99 50 L95 60 L81 54 L83 96 L37 96 L39 54 L25 60 L21 50 L25 38 L33 34 Z" c={c} />
    <Path d="M47 33 L57 31 L60 37 L53 40 Z" fill={c.base} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />
    <Path d="M73 33 L63 31 L60 37 L67 40 Z" fill={c.base} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />
    <Seam d="M47 32 Q60 28 73 32" c={c} />
    <Seam d="M60 37 L60 54" c={c} />
    <Button x={60} y={45} c={c} />
    <Button x={60} y={52} c={c} />
    <Seam d="M43 96 L43 89" c={c} o={0.5} />
    <Seam d="M77 96 L77 89" c={c} o={0.5} />
    <Seam d="M94 45 L97 56" c={c} o={0.45} />
    <Seam d="M26 45 L23 56" c={c} o={0.45} />
  </>
);

export const crewneck: ShapeFn = ({ c }) => (
  <>
    <Fill d="M46 33 Q60 41 74 33 L88 35 L96 38 L97 68 L93 75 L82 67 L84 56 L85 92 L35 92 L36 56 L38 67 L27 75 L23 68 L24 38 L32 35 Z" c={c} />
    <Seam d="M47 35 Q60 43 73 35" c={c} />
    <Seam d="M35 86 L85 86" c={c} />
    <Seam d="M92 69 L83 62" c={c} o={0.45} />
    <Seam d="M28 69 L37 62" c={c} o={0.45} />
  </>
);

export const hoodie: ShapeFn = ({ c, variant }) => {
  const zip = variant === 'zip';
  return (
    <>
      {!zip && <Path d="M48 33 Q60 19 72 33 Q60 39 48 33 Z" fill={c.shade} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />}
      <Fill d="M46 33 Q60 41 74 33 L88 35 L96 39 L98 68 L94 76 L82 68 L84 56 L86 97 L34 97 L36 56 L38 68 L26 76 L22 68 L24 39 L32 35 Z" c={c} />
      {zip ? (
        <>
          <Seam d="M60 34 L60 97" c={c} />
          <Path d="M58 44 L62 44 L62 48 L58 48 Z" fill={c.accent} />
          <Seam d="M40 72 L43 80" c={c} o={0.5} />
          <Seam d="M80 72 L77 80" c={c} o={0.5} />
        </>
      ) : (
        <>
          <Seam d="M53 36 L53 44" c={c} />
          <Seam d="M67 36 L67 44" c={c} />
          <Circle cx={53} cy={45.5} r={1.4} fill={c.accent} />
          <Circle cx={67} cy={45.5} r={1.4} fill={c.accent} />
          <Seam d="M45 67 L75 67 L72 83 L48 83 Z" c={c} />
        </>
      )}
      <Seam d="M34 91 L86 91" c={c} />
      <Seam d="M94 70 L84 63" c={c} o={0.45} />
      <Seam d="M26 70 L36 63" c={c} o={0.45} />
    </>
  );
};

export const turtleneck: ShapeFn = ({ c }) => (
  <>
    <Fill d="M50 33 L50 24 Q60 19 70 24 L70 33 L88 35 L96 38 L97 68 L93 75 L82 67 L84 56 L85 92 L35 92 L36 56 L38 67 L27 75 L23 68 L24 38 L32 35 Z" c={c} />
    <Seam d="M50 27 Q60 32 70 27" c={c} />
    <Seam d="M35 86 L85 86" c={c} />
    <Seam d="M92 69 L83 62" c={c} o={0.45} />
    <Seam d="M28 69 L37 62" c={c} o={0.45} />
  </>
);

export const cardigan: ShapeFn = ({ c, variant }) => {
  const long = variant === 'long';
  const body = long
    ? 'M46 33 L60 46 L74 33 L88 35 L96 38 L97 66 L93 73 L83 66 L85 56 L86 104 L34 104 L35 56 L37 66 L27 73 L23 66 L24 38 L32 35 Z'
    : 'M46 33 L60 46 L74 33 L88 35 L96 38 L97 68 L93 75 L82 67 L84 56 L85 92 L35 92 L36 56 L38 67 L27 75 L23 68 L24 38 L32 35 Z';
  const hem = long ? 104 : 92;
  return (
    <>
      <Fill d={body} c={c} />
      <Seam d="M53 37 L53 89" c={c} o={0.5} />
      <Seam d="M63 37 L63 89" c={c} o={0.5} />
      {!long && (
        <>
          <Button x={58} y={50} c={c} />
          <Button x={58} y={62} c={c} />
          <Button x={58} y={74} c={c} />
        </>
      )}
      {long && (
        <>
          <Seam d={`M45 60 Q44 82 46 ${hem - 4}`} c={c} o={0.4} />
          <Seam d={`M75 60 Q76 82 74 ${hem - 4}`} c={c} o={0.4} />
        </>
      )}
      <Seam d="M46 33 L60 46 L74 33" c={c} />
    </>
  );
};

export const longsleeve: ShapeFn = ({ c }) => (
  <>
    <Fill d="M46 33 Q60 41 74 33 L86 34 L93 38 L95 66 L91 73 L81 65 L82 54 L84 95 L36 95 L38 54 L39 65 L29 73 L25 66 L27 38 L34 34 Z" c={c} />
    <Seam d="M46 33 Q60 41 74 33" c={c} />
    <Seam d="M36 89 L84 89" c={c} />
    <Seam d="M92 66 L88 72" c={c} o={0.45} />
    <Seam d="M28 66 L32 72" c={c} o={0.45} />
  </>
);

export const vestKnit: ShapeFn = ({ c }) => (
  <>
    <Fill d="M46 33 L60 44 L74 33 L88 35 L92 39 L90 47 L86 92 L34 92 L30 47 L28 39 L32 35 Z" c={c} />
    <Seam d="M46 33 L60 44 L74 33" c={c} />
    <Seam d="M34 86 L86 86" c={c} />
    <Seam d="M44 86 L44 92" c={c} o={0.4} />
    <Seam d="M60 86 L60 92" c={c} o={0.4} />
    <Seam d="M76 86 L76 92" c={c} o={0.4} />
  </>
);
