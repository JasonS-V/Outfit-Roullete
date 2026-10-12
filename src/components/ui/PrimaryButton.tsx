/** CTA compartido: tinta ciruela, contorno suave y tipografía discreta. */

import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { hapticTap } from '@/services/haptics';
import { translate, useLanguage } from '@/localization';
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
  const { colors, actionGradient, radii, spacing } = useTheme();
  const language = useLanguage();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const textColor =
    variant === 'primary' ? colors.onChicle : variant === 'danger' ? colors.danger : colors.ink;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(disabled) }}
        accessibilityHint={accessibilityHint ? translate(accessibilityHint, language) : undefined}
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
            backgroundColor: disabled
              ? colors.surface
              : variant === 'primary'
                ? colors.chicle
                : variant === 'ghost'
                  ? colors.surface
                  : 'transparent',
            borderRadius: radii.md,
            paddingVertical: compact ? spacing.three : spacing.four,
            paddingHorizontal: spacing.seven,
            minHeight: compact ? 48 : 54,
            borderWidth: variant === 'ghost' || variant === 'danger' ? 1 : 0,
            borderColor: variant === 'ghost' ? colors.line : colors.danger,
            overflow: 'hidden',
          },
        ]}
      >
        {variant === 'primary' && !disabled ? (
          <LinearGradient
            colors={actionGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View style={styles.content}>
          {leading}
          <AppText variant="hero" color={disabled ? colors.inkSoft : textColor} style={styles.label}>
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
    gap: 8,
  },
  label: {
    letterSpacing: 0.2,
  },
});
