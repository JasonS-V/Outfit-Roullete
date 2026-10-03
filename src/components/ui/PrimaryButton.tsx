/**
 * PrimaryButton · CTA principal (botón chicle) y variantes.
 * Elevación reservada para el CTA: lo hace el punto focal de la pantalla.
 */

import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { hapticTap } from '@/services/haptics';
import { useTheme } from '@/theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'ghost' | 'danger';

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: Variant;
  /** Elemento decorativo a la izquierda del texto (p. ej. el ícono de ruleta). */
  leading?: React.ReactNode;
  compact?: boolean;
  accessibilityHint?: string;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = 'primary',
  leading,
  compact,
  accessibilityHint,
}: PrimaryButtonProps) {
  const { colors, radii, shadows, spacing } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const background =
    variant === 'primary' ? colors.chicle : variant === 'danger' ? 'transparent' : colors.surface;
  const textColor =
    variant === 'primary' ? colors.onChicle : variant === 'danger' ? colors.danger : colors.ink;

  return (
    <Animated.View style={[animatedStyle, !disabled && variant === 'primary' ? shadows.floating : null]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(disabled) }}
        accessibilityHint={accessibilityHint}
        disabled={disabled}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 18, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 220 });
        }}
        onPress={() => {
          hapticTap();
          onPress?.();
        }}
        style={[
          styles.button,
          {
            backgroundColor: disabled ? colors.surface : background,
            borderRadius: radii.pill,
            paddingVertical: compact ? spacing.three : spacing.four,
            paddingHorizontal: spacing.seven,
            minHeight: compact ? 48 : 56,
            borderWidth: variant === 'ghost' ? 1 : variant === 'danger' ? 1 : 0,
            borderColor: variant === 'ghost' ? colors.line : colors.danger,
          },
        ]}
      >
        <View style={styles.content}>
          {leading}
          <AppText variant="hero" color={disabled ? colors.inkSoft : textColor}>
            {label}
          </AppText>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
