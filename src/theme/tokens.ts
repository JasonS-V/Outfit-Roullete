import { Platform } from 'react-native';

export type ColorScheme = 'light' | 'dark';
export type ThemeMode = ColorScheme | 'system';
export type ThemeColor = 'sage' | 'blue' | 'rose' | 'black';

export function resolveThemeMode(preference: ThemeMode, systemScheme: ColorScheme | 'unspecified' | null): ColorScheme {
  return preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
}

export const themeColorOptions: { key: ThemeColor; label: string; swatch: string }[] = [
  { key: 'sage', label: 'Salvia', swatch: '#30443A' },
  { key: 'blue', label: 'Azul', swatch: '#315675' },
  { key: 'rose', label: 'Rosa', swatch: '#704052' },
  { key: 'black', label: 'Negro', swatch: '#171717' },
];

export const palette = {
  ink: '#24312C', inkSoft: '#626D67', chicle: '#24312C', candado: '#D7E7DE',
  reelTop: '#E9EFE9', reelBottom: '#F3EAE2', reelLayer: '#E9EDE8', reelShoes: '#F1ECE5',
  white: '#FFFFFF', surfaceLight: '#F7F6F1', lineLight: '#DFE3DB',
} as const;

export const colors = {
  light: {
    ink: '#24312C', inkSoft: '#626D67', bg: '#F7F6F1', surface: '#ECEFE8',
    surfaceRaised: '#FFFFFF', glass: '#FFFFFF', line: '#DFE3DB', lineSoft: '#EBEEE8',
    cardEdge: '#DDE3DB', sheen: 'rgba(255, 255, 255, 0.7)',
    chicle: '#24312C', chiclePressed: '#35463E', onChicle: '#FFFFFF',
    candado: '#D7E7DE', onCandado: '#24312C',
    reelTop: '#E9EFE9', reelBottom: '#F3EAE2', reelLayer: '#E9EDE8', reelShoes: '#F1ECE5',
    danger: '#A34337', scrim: 'rgba(36, 49, 44, 0.45)',
  },
  dark: {
    ink: '#F3F4ED', inkSoft: '#B6C2B8', bg: '#171E1A', surface: '#26312B',
    surfaceRaised: '#202A24', glass: '#202A24', line: '#39483E', lineSoft: '#303D34',
    cardEdge: '#405044', sheen: 'rgba(255, 255, 255, 0.08)',
    chicle: '#D9E8DD', chiclePressed: '#ECF3EC', onChicle: '#1C2A22',
    candado: '#AFCDBA', onCandado: '#1C2A22',
    reelTop: '#2B3C32', reelBottom: '#3B342F', reelLayer: '#303B34', reelShoes: '#39352F',
    danger: '#FFADA0', scrim: 'rgba(0, 0, 0, 0.6)',
  },
} as const;

export const colorThemes = {
  black: {
    light: {
      ink: '#202020', inkSoft: '#595959', bg: '#F7F7F7', surface: '#ECECEC',
      surfaceRaised: '#FFFFFF', glass: '#FFFFFF', line: '#D9D9D9', lineSoft: '#E8E8E8',
      cardEdge: '#D9D9D9', chicle: '#171717', chiclePressed: '#333333', onChicle: '#FFFFFF',
      candado: '#DCDCDC', onCandado: '#171717',
      reelTop: '#E9E9E9', reelBottom: '#EFEFEF', reelLayer: '#E7E7E7', reelShoes: '#EDEDED',
    },
    dark: {
      ink: '#F5F5F5', inkSoft: '#BDBDBD', bg: '#0D0D0D', surface: '#1B1B1B',
      surfaceRaised: '#161616', glass: '#161616', line: '#383838', lineSoft: '#2A2A2A',
      cardEdge: '#404040', chicle: '#F1F1F1', chiclePressed: '#D9D9D9', onChicle: '#111111',
      candado: '#D1D1D1', onCandado: '#111111',
      reelTop: '#252525', reelBottom: '#2B2B2B', reelLayer: '#232323', reelShoes: '#292929',
    },
  },
  blue: {
    light: {
      ink: '#223544', inkSoft: '#516675', bg: '#F5F8FA', surface: '#E8F0F5',
      surfaceRaised: '#FFFFFF', glass: '#FFFFFF', line: '#D5E2EA', lineSoft: '#E8F0F5',
      cardEdge: '#D5E2EA', chicle: '#315675', chiclePressed: '#426989', onChicle: '#FFFFFF',
      candado: '#D5E9F3', onCandado: '#223E52',
      reelTop: '#E5F0F7', reelBottom: '#ECF1F7', reelLayer: '#E8EEF6', reelShoes: '#EEF2F7',
    },
    dark: {
      ink: '#F1F6F9', inkSoft: '#B8CBD6', bg: '#172630', surface: '#263B49',
      surfaceRaised: '#20313D', glass: '#20313D', line: '#3C5564', lineSoft: '#304653',
      cardEdge: '#456171', chicle: '#CDE8F6', chiclePressed: '#E0F2FA', onChicle: '#18313F',
      candado: '#9BC8DF', onCandado: '#18313F',
      reelTop: '#2A4657', reelBottom: '#303F51', reelLayer: '#304354', reelShoes: '#344352',
    },
  },
  rose: {
    light: {
      ink: '#3C2D34', inkSoft: '#6F5B64', bg: '#FAF6F7', surface: '#F3E9ED',
      surfaceRaised: '#FFFCFD', glass: '#FFFCFD', line: '#E9DCE2', lineSoft: '#F4EBEF',
      cardEdge: '#E7D8DF', chicle: '#704052', chiclePressed: '#855469', onChicle: '#FFFFFF',
      candado: '#F1DCE5', onCandado: '#4A2C39',
      reelTop: '#F5E7EE', reelBottom: '#F6EBE8', reelLayer: '#F1E8EF', reelShoes: '#F5ECEB',
    },
    dark: {
      ink: '#FAF1F4', inkSoft: '#D3BBC5', bg: '#281D23', surface: '#3A2B33',
      surfaceRaised: '#32252C', glass: '#32252C', line: '#59414D', lineSoft: '#473540',
      cardEdge: '#654A56', chicle: '#F4D3DF', chiclePressed: '#FAE5EC', onChicle: '#3B2430',
      candado: '#DDAABB', onCandado: '#3B2430',
      reelTop: '#49333F', reelBottom: '#4D3739', reelLayer: '#43333F', reelShoes: '#4A383D',
    },
  },
} as const;

export type Theme = (typeof colors)[ColorScheme];

export const reelTint = {
  light: { top: '#E9EFE9', bottom: '#F3EAE2', layer: '#E9EDE8', shoes: '#F1ECE5', onepiece: '#E5EDE5' },
  dark: { top: '#2B3C32', bottom: '#3B342F', layer: '#303B34', shoes: '#39352F', onepiece: '#2D4035' },
} as const;

export const reelGradient = {
  light: {
    top: ['#F0F5EF', '#E2EAE1'], bottom: ['#F9F0E9', '#EEE3D9'],
    layer: ['#EFF3ED', '#E3EAE2'], shoes: ['#F8F2EA', '#EBE5DC'], onepiece: ['#EDF3EA', '#DDE8DB'],
  },
  dark: {
    top: ['#34483A', '#29372E'], bottom: ['#463C35', '#362F2A'],
    layer: ['#39473C', '#2A362E'], shoes: ['#443D35', '#332E28'], onepiece: ['#3A4D3E', '#2B3B31'],
  },
} as const;

export type ReelKey = keyof (typeof reelGradient)['light'];

export const actionGradient = {
  light: ['#30443A', '#24312C'], dark: ['#E4F0E5', '#D1E3D5'],
} as const;

export const spacing = { half: 2, one: 4, two: 8, three: 12, four: 16, five: 20, six: 24, seven: 32, eight: 40, nine: 48 } as const;
export const radii = { sm: 8, md: 12, card: 18, sheet: 28, pill: 999 } as const;
export const touchTarget = { min: 48 } as const;

export const shadows = {
  floating: Platform.OS === 'web'
    ? { boxShadow: '0px 5px 12px rgba(36, 49, 44, 0.12)' }
    : { shadowColor: '#24312C', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  sheet: Platform.OS === 'web'
    ? { boxShadow: '0px -6px 24px rgba(36, 49, 44, 0.12)' }
    : { shadowColor: '#24312C', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: -6 }, elevation: 12 },
} as const;
