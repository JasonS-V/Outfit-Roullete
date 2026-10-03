/**
 * Tema · punto de entrada. Expone tokens y resuelve modo claro/oscuro.
 */

import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, reelTint, radii, shadows, spacing, touchTarget, type ColorScheme } from './tokens';

export { colors, reelTint, radii, shadows, spacing, touchTarget } from './tokens';
export type { ColorScheme, Theme } from './tokens';
export { fontFamily, typeScale } from './typography';
export type { TypeVariant } from './typography';

export function useTheme() {
  const scheme = useColorScheme();
  const mode: ColorScheme = scheme === 'dark' ? 'dark' : 'light';
  return {
    mode,
    colors: colors[mode],
    reelTint: reelTint[mode],
    spacing,
    radii,
    shadows,
    touchTarget,
  };
}
