/**
 * LockButton · candado del carrete (§7).
 * Estados con doble canal (forma + color): contorno suave vs relleno lavanda.
 * Área táctil de 48dp y pop de escala de 120 ms con vibración rígida.
 */

import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

import { hapticLock } from '@/services/haptics';
import { useTheme } from '@/theme';

interface LockButtonProps {
  locked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function LockButton({ locked, onToggle, disabled }: LockButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const iconColor = locked ? colors.onCandado : colors.ink;
  const surface = locked ? colors.candado : colors.surfaceRaised;
  const edge = locked ? colors.candado : colors.line;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={locked ? 'Carrete fijado. Toca para desbloquear' : 'Fijar este carrete'}
      accessibilityState={{ selected: locked, disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={() => {
        hapticLock();
        scale.value = withSequence(
          withTiming(1.2, { duration: 60 }),
          withTiming(1, { duration: 60 }),
        );
        onToggle();
      }}
      style={[
        styles.button,
        animatedStyle,
        {
          backgroundColor: surface,
          borderColor: edge,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Svg width={22} height={22} viewBox="0 0 24 24">
        {/* Arco del candado: cerrado o abierto según estado */}
        {locked ? (
          <Path
            d="M8 10 L8 7.5 A4 4 0 0 1 16 7.5 L16 10"
            stroke={iconColor}
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <Path
            d="M8 10 L8 7.5 A4 4 0 0 1 16 7.5 L16 9"
            stroke={iconColor}
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="20"
            strokeDashoffset={0}
            transform="rotate(24 12 9)"
          />
        )}
        <Rect x={6.5} y={10} width={11} height={9} rx={2.6} fill={iconColor} />
      </Svg>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
