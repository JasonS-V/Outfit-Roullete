/**
 * Chip · filtros de un toque (ocasión, categorías).
 * Seleccionado: fondo tinta y texto claro (contraste alto, un solo acento).
 */

import { Pressable, StyleSheet } from 'react-native';

import { hapticTap } from '@/services/haptics';
import { useTheme } from '@/theme';
import { AppText } from './AppText';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tint?: string;
}

export function Chip({ label, selected, onPress, tint }: ChipProps) {
  const { colors, radii, touchTarget, spacing } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(selected) }}
      onPress={() => {
        hapticTap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.chip,
        {
          minHeight: 40,
          paddingHorizontal: spacing.five,
          borderRadius: radii.pill,
          backgroundColor: selected ? (tint ?? colors.ink) : colors.surface,
          borderColor: selected ? 'transparent' : colors.line,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <AppText variant="label" color={selected ? colors.bg : colors.ink}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
