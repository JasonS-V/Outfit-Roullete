/**
 * Tipografía Figtree (Google Fonts, empaquetada localmente).
 * Escala del documento maestro §15.2. Nombres de familia = claves de carga en fonts.ts.
 */

export const fontFamily = {
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semiBold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  extraBold: 'Figtree_800ExtraBold',
} as const;

export const typeScale = {
  /** Bienvenida, Paywall */
  display: { fontFamily: fontFamily.extraBold, fontSize: 32, lineHeight: 38 },
  /** Encabezados de pantalla */
  title: { fontFamily: fontFamily.bold, fontSize: 22, lineHeight: 28 },
  /** Títulos de prendas, secciones */
  subtitle: { fontFamily: fontFamily.semiBold, fontSize: 17, lineHeight: 24 },
  /** Texto general */
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  /** Chips de ocasión, botones secundarios */
  label: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 20 },
  /** Texto del botón GIRAR */
  hero: { fontFamily: fontFamily.extraBold, fontSize: 20, lineHeight: 24 },
  /** Mínimo legal, notas al pie */
  micro: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16 },
} as const;

export type TypeVariant = keyof typeof typeScale;
