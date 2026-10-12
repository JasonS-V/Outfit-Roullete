/**
 * AppText · tipografía unificada (Inter, escala §15.2).
 */

import { Text, type TextProps } from 'react-native';

import { typeScale, useTheme, type TypeVariant } from '@/theme';
import { translateChildren, useLanguage } from '@/localization';

interface AppTextProps extends TextProps {
  variant?: TypeVariant;
  /** Color explícito; por defecto el token `ink`. */
  color?: string;
}

export function AppText({ variant = 'body', color, style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  const language = useLanguage();
  return (
    <Text
      {...rest}
      style={[typeScale[variant], { color: color ?? colors.ink }, style]}
    >{translateChildren(rest.children, language)}</Text>
  );
}
