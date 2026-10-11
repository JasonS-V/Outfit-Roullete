/**
 * Tema · punto de entrada. Expone tokens y resuelve modo claro/oscuro.
 */

import { useColorScheme } from '@/hooks/use-color-scheme';
import { createContext, useContext } from 'react';
import {
  colors,
  colorThemes,
  reelGradient,
  reelTint,
  radii,
  shadows,
  spacing,
  touchTarget,
  actionGradient,
  resolveThemeMode,
  type ColorScheme,
  type ThemeColor,
  type ThemeMode,
} from './tokens';

export {
  colors,
  actionGradient,
  themeColorOptions,
  reelGradient,
  reelTint,
  radii,
  shadows,
  spacing,
  touchTarget,
} from './tokens';
export type { ColorScheme, ReelKey, Theme, ThemeColor, ThemeMode } from './tokens';
export { fontFamily, typeScale } from './typography';
export type { TypeVariant } from './typography';

export const ThemePreferencesContext = createContext<{ color: ThemeColor; mode: ThemeMode }>({ color: 'sage', mode: 'system' });

export function useTheme() {
  const scheme = useColorScheme();
  const preferences = useContext(ThemePreferencesContext);
  const mode: ColorScheme = resolveThemeMode(preferences.mode, scheme);
  const themeColor = preferences.color;
  const selected = themeColor === 'sage' ? null : colorThemes[themeColor][mode];
  const themedColors = selected ? { ...colors[mode], ...selected } : colors[mode];
  const themedReels = selected
    ? { top: selected.reelTop, bottom: selected.reelBottom, layer: selected.reelLayer, shoes: selected.reelShoes, onepiece: selected.reelTop }
    : reelTint[mode];
  return {
    mode,
    colors: themedColors,
    actionGradient: selected ? [selected.chiclePressed, selected.chicle] as const : actionGradient[mode],
    reelTint: themedReels,
    reelGradient: selected ? {
      top: [themedReels.top, selected.surface], bottom: [themedReels.bottom, selected.surface],
      layer: [themedReels.layer, selected.surface], shoes: [themedReels.shoes, selected.surface],
      onepiece: [themedReels.onepiece, selected.surface],
    } as const : reelGradient[mode],
    spacing,
    radii,
    shadows,
    touchTarget,
  };
}
