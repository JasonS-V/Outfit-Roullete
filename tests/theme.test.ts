import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({ Platform: { OS: 'web' } }));

import { colorThemes, colors, resolveThemeMode, themeColorOptions } from '@/theme/tokens';

function luminance(hex: string): number {
  const channels = hex.slice(1).match(/../g)!.map((part) => {
    const value = parseInt(part, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(a: string, b: string): number {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe('colores del tema', () => {
  it('respeta el modo elegido y sigue al sistema cuando corresponde', () => {
    expect(resolveThemeMode('light', 'dark')).toBe('light');
    expect(resolveThemeMode('dark', 'light')).toBe('dark');
    expect(resolveThemeMode('system', 'dark')).toBe('dark');
    expect(resolveThemeMode('system', null)).toBe('light');
    expect(resolveThemeMode('system', 'unspecified')).toBe('light');
  });

  it.each(themeColorOptions)('$label mantiene legibles los textos en claro y oscuro', ({ key }) => {
    for (const mode of ['light', 'dark'] as const) {
      const theme = key === 'sage' ? colors[mode] : { ...colors[mode], ...colorThemes[key][mode] };
      expect(contrast(theme.ink, theme.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(theme.inkSoft, theme.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(theme.ink, theme.surfaceRaised)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(theme.inkSoft, theme.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(theme.onChicle, theme.chicle)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(theme.onChicle, theme.chiclePressed)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(theme.onCandado, theme.candado)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
