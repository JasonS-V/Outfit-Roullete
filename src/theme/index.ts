/**
 * Tema · punto de entrada. Expone tokens y resuelve modo claro/oscuro.
 */

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  colors,
  reelGradient,
  reelTint,
  radii,
  shadows,
  spacing,
  touchTarget,
  actionGradient,
  type ColorScheme,
} from './tokens';

export {
  colors,
  actionGradient,
  reelGradient,
  reelTint,
  radii,
  shadows,
  spacing,
  touchTarget,
} from './tokens';
export type { ColorScheme, ReelKey, Theme } from './tokens';
export { fontFamily, typeScale } from './typography';
export type { TypeVariant } from './typography';

export function useTheme() {
  const scheme = useColorScheme();
  const mode: ColorScheme = scheme === 'dark' ? 'dark' : 'light';
  return {
    mode,
    colors: colors[mode],
    actionGradient: actionGradient[mode],
    reelTint: reelTint[mode],
    reelGradient: reelGradient[mode],
    spacing,
    radii,
    shadows,
    touchTarget,
  };
}
