import { Platform } from 'react-native';

export const fontFamily = {
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semiBold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  extraBold: 'Figtree_800ExtraBold',
  editorial: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
} as const;

export const typeScale = {
  display: { fontFamily: fontFamily.editorial, fontSize: 42, lineHeight: 47, letterSpacing: -1.7 },
  title: { fontFamily: fontFamily.editorial, fontSize: 32, lineHeight: 38, letterSpacing: -1 },
  subtitle: { fontFamily: fontFamily.semiBold, fontSize: 17, lineHeight: 23, letterSpacing: -0.2 },
  body: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 23 },
  label: { fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 19 },
  hero: { fontFamily: fontFamily.semiBold, fontSize: 15, lineHeight: 21, letterSpacing: 0.1 },
  micro: { fontFamily: fontFamily.medium, fontSize: 11, lineHeight: 16, letterSpacing: 0.2 },
} as const;

export type TypeVariant = keyof typeof typeScale;
