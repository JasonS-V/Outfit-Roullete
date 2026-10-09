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
  icon?: React.ReactNode;
}

export function Chip({ label, selected, onPress, tint, icon }: ChipProps) {
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
          minHeight: touchTarget.min,
          paddingHorizontal: spacing.four,
          borderRadius: radii.pill,
          backgroundColor: selected ? (tint ?? colors.chicle) : colors.bg,
          borderColor: selected ? 'transparent' : colors.line,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {icon}
      <AppText variant="label" color={selected ? colors.onChicle : colors.ink}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
  },
});
