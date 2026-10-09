export type ColorScheme = 'light' | 'dark';

export const palette = {
  ink: '#24182F', inkSoft: '#716B79', chicle: '#24182F', candado: '#C4B0DA',
  reelTop: '#F1EBF4', reelBottom: '#F5F0ED', reelLayer: '#EEEAF0', reelShoes: '#F3F0EC',
  white: '#FFFFFF', surfaceLight: '#F8F6F7', lineLight: '#E8E3E8',
} as const;

export const colors = {
  light: {
    ink: '#24182F', inkSoft: '#716B79', bg: '#FFFFFF', surface: '#F8F6F7',
    surfaceRaised: '#FFFFFF', glass: '#FFFFFF', line: '#E8E3E8', lineSoft: '#F1EDF1',
    cardEdge: '#EAE5E9', sheen: 'rgba(255, 255, 255, 0.7)',
    chicle: '#24182F', chiclePressed: '#3C2B4D', onChicle: '#FFFFFF',
    candado: '#C4B0DA', onCandado: '#24182F',
    reelTop: '#F1EBF4', reelBottom: '#F5F0ED', reelLayer: '#EEEAF0', reelShoes: '#F3F0EC',
    danger: '#A13D52', scrim: 'rgba(36, 24, 47, 0.45)',
  },
  dark: {
    ink: '#F7F2F7', inkSoft: '#BCB1C0', bg: '#17121D', surface: '#241C2B',
    surfaceRaised: '#2D2335', glass: '#211929', line: '#403448', lineSoft: '#34293B',
    cardEdge: '#47394D', sheen: 'rgba(255, 255, 255, 0.08)',
    chicle: '#D6C3E3', chiclePressed: '#E5D8EF', onChicle: '#24182F',
    candado: '#C4B0DA', onCandado: '#24182F',
    reelTop: '#30263A', reelBottom: '#2C2530', reelLayer: '#29232F', reelShoes: '#2D272D',
    danger: '#F5A5B2', scrim: 'rgba(0, 0, 0, 0.6)',
  },
} as const;

export type Theme = (typeof colors)[ColorScheme];

export const reelTint = {
  light: { top: '#F1EBF4', bottom: '#F5F0ED', layer: '#EEEAF0', shoes: '#F3F0EC', onepiece: '#EEE8F3' },
  dark: { top: '#30263A', bottom: '#2C2530', layer: '#29232F', shoes: '#2D272D', onepiece: '#34283E' },
} as const;

export const reelGradient = {
  light: {
    top: ['#F7F2F8', '#ECE4F0'], bottom: ['#FAF7F5', '#F0EAE7'],
    layer: ['#F5F1F6', '#EAE5ED'], shoes: ['#F9F6F2', '#EEE9E3'], onepiece: ['#F6F0F8', '#E8E0ED'],
  },
  dark: {
    top: ['#382C43', '#2B2235'], bottom: ['#342A36', '#29222D'],
    layer: ['#312A37', '#27212C'], shoes: ['#332C32', '#282328'], onepiece: ['#3B2E46', '#2D2337'],
  },
} as const;

export type ReelKey = keyof (typeof reelGradient)['light'];

export const actionGradient = {
  light: ['#2C1D3B', '#24182F'], dark: ['#DCCBE8', '#CEB9DD'],
} as const;

export const spacing = { half: 2, one: 4, two: 8, three: 12, four: 16, five: 20, six: 24, seven: 32, eight: 40, nine: 48 } as const;
export const radii = { sm: 8, md: 12, card: 18, sheet: 28, pill: 999 } as const;
export const touchTarget = { min: 48 } as const;

export const shadows = {
  floating: { shadowColor: '#24182F', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  sheet: { shadowColor: '#24182F', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: -6 }, elevation: 12 },
} as const;
