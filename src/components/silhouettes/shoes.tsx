/**
 * Siluetas · Calzado (10 formas base + variantes).
 * Perfil lateral mirando a la derecha; base en y≈88.
 */

import { Circle, Path } from 'react-native-svg';
import type { ShapeFn } from './colors';

const W = 4;
const w = 1.6;

interface ElProps {
  c: import('./colors').SilhouetteColors;
}

interface FillProps {
  d: string;
  c: import('./colors').SilhouetteColors;
  fill?: string;
}

function Fill({ d, c, fill }: FillProps) {
  return (
    <Path d={d} fill={fill ?? c.base} stroke={c.stroke} strokeWidth={W} strokeLinejoin="round" strokeLinecap="round" />
  );
}
function Seam({ d, c, o = 0.6 }: { d: string; c: ElProps['c']; o?: number }) {
  return <Path d={d} fill="none" stroke={c.stroke} strokeWidth={w} strokeLinecap="round" opacity={o} />;
}

export const sneaker: ShapeFn = ({ c, variant }) => {
  const chunky = variant === 'chunky';
  const skate = variant === 'skate';
  const sole = chunky
    ? 'M16 74 Q12 88 26 90 L100 90 Q110 90 110 81 L110 74 Q60 82 16 68 Z'
    : 'M18 78 Q16 88 28 89 L100 89 Q107 89 107 82 L107 78 Q60 85 18 74 Z';
  const upper = skate
    ? 'M22 76 Q24 64 36 61 L52 57 Q60 55 66 48 Q71 42 76 44 Q84 48 90 55 Q96 60 102 66 L104 76 Q60 82 22 74 Z'
    : 'M20 76 Q22 62 34 59 L48 56 Q56 54 62 47 L68 40 Q72 36 77 39 Q84 44 90 51 Q97 58 102 64 Q106 68 106 73 L106 78 Q60 84 20 74 Z';
  return (
    <>
      <Fill d={upper} c={c} />
      <Fill d={sole} c={c} fill={c.paper} />
      {!skate && <Seam d="M86 49 Q94 56 101 63" c={c} o={0.5} />}
      <Seam d="M52 51 L57 55" c={c} />
      <Seam d="M57 47 L62 51" c={c} />
      <Seam d="M62 43 L66 47" c={c} />
      {chunky && <Seam d="M28 90 L28 94" c={c} o={0.5} />}
      {chunky && <Seam d="M64 90 L64 94" c={c} o={0.5} />}
      {chunky && <Seam d="M96 90 L96 94" c={c} o={0.5} />}
    </>
  );
};

export const highTop: ShapeFn = ({ c }) => (
  <>
    <Fill d="M20 77 Q20 60 34 58 L50 55 Q56 53 60 46 L64 32 Q65 27 72 27 L78 27 Q83 27 83 33 L83 44 Q88 48 94 56 Q99 63 103 69 L104 78 Q60 84 20 77 Z" c={c} />
    <Fill d="M18 78 Q16 88 28 89 L100 89 Q107 89 107 82 L107 78 Q60 85 18 74 Z" c={c} fill={c.paper} />
    <Seam d="M64 31 Q73 29 82 32" c={c} />
    <Seam d="M64 40 L74 38" c={c} />
    <Seam d="M62 46 L72 44" c={c} />
    <Seam d="M60 52 L70 50" c={c} />
    <Seam d="M88 50 Q95 57 101 64" c={c} o={0.5} />
  </>
);

export const runner: ShapeFn = ({ c }) => (
  <>
    <Fill d="M18 76 Q20 61 32 59 L50 55 Q58 53 64 47 L70 41 Q74 37 79 40 Q88 46 94 54 Q100 61 104 67 L104 77 Q60 83 18 74 Z" c={c} />
    <Fill d="M16 78 Q14 88 26 89 L100 89 Q108 89 108 82 L108 78 Q60 84 16 74 Z" c={c} fill={c.paper} />
    <Seam d="M36 61 Q52 57 62 48" c={c} o={0.5} />
    <Seam d="M40 67 Q58 63 72 51" c={c} o={0.5} />
    <Seam d="M28 59 Q23 66 21 75" c={c} o={0.5} />
  </>
);

export const bootChelsea: ShapeFn = ({ c }) => (
  <>
    <Fill d="M26 80 Q26 56 30 46 L34 34 Q36 28 44 28 L62 28 Q68 28 68 34 L70 48 Q78 52 86 58 Q94 64 100 70 L102 80 Q60 86 26 80 Z" c={c} />
    <Fill d="M22 82 Q22 88 30 89 L96 89 Q102 89 102 84 L102 81 Q60 86 22 79 Z" c={c} fill={c.paper} />
    <Path d="M52 30 L66 30 L68 52 L54 52 Z" fill={c.shade} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />
    <Seam d="M56 34 L58 48" c={c} o={0.4} />
    <Seam d="M60 34 L62 48" c={c} o={0.4} />
    <Seam d="M64 34 L66 48" c={c} o={0.4} />
    <Seam d="M30 46 L70 46" c={c} o={0.35} />
  </>
);

export const bootCombat: ShapeFn = ({ c }) => (
  <>
    <Fill d="M24 78 Q24 56 28 38 L30 28 Q32 22 42 22 L62 22 Q70 22 70 28 L72 46 Q80 50 88 56 Q96 62 102 68 L104 78 Q60 85 24 78 Z" c={c} />
    <Fill d="M20 80 Q18 90 30 91 L98 91 Q106 91 106 84 L106 80 Q60 86 20 76 Z" c={c} fill={c.paper} />
    <Seam d="M36 30 Q52 36 66 30" c={c} />
    <Seam d="M56 30 L54 74" c={c} o={0.5} />
    <Seam d="M66 30 L64 74" c={c} o={0.5} />
    <Circle cx={56} cy={36} r={1.2} fill={c.accent} />
    <Circle cx={66} cy={36} r={1.2} fill={c.accent} />
    <Circle cx={55} cy={44} r={1.2} fill={c.accent} />
    <Circle cx={65} cy={44} r={1.2} fill={c.accent} />
    <Circle cx={54} cy={52} r={1.2} fill={c.accent} />
    <Circle cx={64} cy={52} r={1.2} fill={c.accent} />
    <Circle cx={53} cy={60} r={1.2} fill={c.accent} />
    <Circle cx={63} cy={60} r={1.2} fill={c.accent} />
    <Seam d="M34 91 L34 95" c={c} o={0.5} />
    <Seam d="M64 91 L64 95" c={c} o={0.5} />
    <Seam d="M92 91 L92 95" c={c} o={0.5} />
  </>
);

export const bootWestern: ShapeFn = ({ c }) => (
  <>
    <Fill d="M28 78 Q28 52 34 38 L36 30 Q38 24 48 24 L60 24 Q66 24 66 30 L68 42 Q80 50 92 58 Q104 66 106 71 Q108 75 104 77 Q60 85 28 78 Z" c={c} />
    <Path d="M30 78 L28 90 L40 90 L42 80 Z" fill={c.base} stroke={c.stroke} strokeWidth={W} strokeLinejoin="round" />
    <Fill d="M22 80 Q20 86 28 87 L98 87 Q104 87 104 82 Q104 79 100 77 Q60 84 22 77 Z" c={c} fill={c.paper} />
    <Seam d="M36 32 Q50 38 64 32" c={c} />
    <Seam d="M42 32 L40 44" c={c} o={0.45} />
    <Seam d="M58 32 L60 44" c={c} o={0.45} />
    <Seam d="M44 58 Q60 54 72 56" c={c} o={0.4} />
    <Seam d="M46 64 Q60 60 70 62" c={c} o={0.4} />
  </>
);

export const loafer: ShapeFn = ({ c, variant }) => {
  const oxford = variant === 'oxford';
  return (
    <>
      <Fill d="M20 76 Q22 62 34 60 L50 56 Q58 54 66 52 Q74 50 82 50 Q92 50 98 56 Q104 61 106 67 L106 76 Q60 83 20 74 Z" c={c} />
      <Fill d="M18 78 Q16 88 28 89 L100 89 Q107 89 107 82 L107 78 Q60 85 18 74 Z" c={c} fill={c.paper} />
      {oxford ? (
        <>
          <Seam d="M52 56 L76 52" c={c} o={0.5} />
          <Circle cx={56} cy={58} r={1.2} fill={c.accent} />
          <Circle cx={64} cy={56.5} r={1.2} fill={c.accent} />
          <Circle cx={72} cy={55} r={1.2} fill={c.accent} />
          <Seam d="M84 52 Q92 58 98 64" c={c} o={0.5} />
        </>
      ) : (
        <>
          <Seam d="M50 60 Q60 54 70 53" c={c} />
          <Path d="M52 58 Q60 53 68 52 L66 60 Q58 62 52 64 Z" fill={c.shade} stroke={c.stroke} strokeWidth={w} strokeLinejoin="round" />
        </>
      )}
    </>
  );
};

export const sandal: ShapeFn = ({ c, variant }) => {
  const platform = variant === 'platform';
  const slide = variant === 'slide';
  const sole = platform
    ? 'M16 72 Q12 86 26 88 L100 88 Q110 88 110 79 L110 72 Q60 80 16 66 Z'
    : 'M18 76 Q16 85 26 86 L102 86 Q108 86 108 81 L108 76 Q60 81 18 71 Z';
  return (
    <>
      {slide ? (
        <Path d="M34 74 Q44 58 60 56 L74 58 Q60 64 54 76 Z" fill={c.base} stroke={c.stroke} strokeWidth={W} strokeLinejoin="round" />
      ) : (
        <>
          <Path d="M36 74 Q38 61 48 57 L57 60 Q50 65 48 76 Z" fill={c.base} stroke={c.stroke} strokeWidth={W} strokeLinejoin="round" />
          <Path d="M60 74 Q62 59 72 55 L81 57 Q72 63 70 76 Z" fill={c.base} stroke={c.stroke} strokeWidth={W} strokeLinejoin="round" />
        </>
      )}
      <Fill d={sole} c={c} fill={c.paper} />
    </>
  );
};

export const heel: ShapeFn = ({ c }) => (
  <>
    <Path d="M30 76 L28 92 L38 92 L42 78 Z" fill={c.base} stroke={c.stroke} strokeWidth={W} strokeLinejoin="round" />
    <Fill d="M24 78 Q26 65 44 62 Q64 59 84 55 Q96 52 103 50 Q108 49 107 56 L104 76 Q60 82 24 76 Z" c={c} />
    <Seam d="M26 74 Q62 68 102 56" c={c} o={0.45} />
    <Seam d="M30 92 L38 92" c={c} />
  </>
);

export const espadrille: ShapeFn = ({ c }) => (
  <>
    <Fill d="M20 74 Q22 62 34 60 L50 57 Q58 55 66 53 Q74 51 82 51 Q90 51 96 55 L100 61 Q60 71 20 72 Z" c={c} />
    <Fill d="M18 75 Q16 84 26 85 L102 85 Q108 85 108 80 L108 76 Q60 80 18 70 Z" c={c} fill={c.shade} />
    <Seam d="M28 78 L33 82" c={c} o={0.5} />
    <Seam d="M44 79 L49 83" c={c} o={0.5} />
    <Seam d="M60 80 L65 84" c={c} o={0.5} />
    <Seam d="M76 80 L81 84" c={c} o={0.5} />
    <Seam d="M92 80 L97 84" c={c} o={0.5} />
  </>
);
