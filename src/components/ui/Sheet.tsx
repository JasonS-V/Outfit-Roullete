/** Hoja inferior que acompaña el arrastre del encabezado. */

import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { fontFamily, useTheme } from '@/theme';
import { translate, useLanguage } from '@/localization';
import { shouldCloseSheet } from './sheetGesture';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Altura máxima como fracción de pantalla (0..1). */
  maxHeightRatio?: number;
  scroll?: boolean;
}

export function Sheet({ visible, onClose, title, children, maxHeightRatio = 0.85, scroll = true }: SheetProps) {
  const { colors, radii, spacing, shadows } = useTheme();
  const language = useLanguage();
  const { height } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const position = useSharedValue(height);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      position.set(withTiming(0, { duration: 240 }));
    } else {
      position.set(withTiming(height, { duration: 200 }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      }));
    }
  }, [visible, height, position]);

  const pan = Gesture.Pan()
    .enabled(visible)
    .activeOffsetY(8)
    .failOffsetX([-24, 24])
    .onUpdate((event) => {
      position.set(Math.max(0, event.translationY));
    })
    .onEnd((event, success) => {
      if (success && shouldCloseSheet(event.translationY, event.velocityY)) {
        runOnJS(onClose)();
      } else {
        position.set(withSpring(0, { damping: 22, stiffness: 260 }));
      }
    });

  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateY: position.get() }] }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(position.get(), [0, height], [1, 0], 'clamp'),
  }));

  if (!mounted) return null;

  const body = (
    <View style={{ paddingHorizontal: spacing.six, paddingBottom: spacing.seven }}>
      {children}
    </View>
  );

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, backdropStyle]} />
        <Pressable accessibilityRole="button" accessibilityLabel={translate('Cerrar panel', language)} style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.panel,
            shadows.sheet,
            {
              backgroundColor: colors.bg,
              borderTopLeftRadius: radii.sheet,
              borderTopRightRadius: radii.sheet,
              maxHeight: `${Math.round(maxHeightRatio * 100)}%` as unknown as number,
            },
            panelStyle,
          ]}
        >
          <GestureDetector gesture={pan}>
            <View style={{ paddingHorizontal: spacing.six, marginBottom: title ? spacing.four : 0 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={translate('Cerrar panel', language)}
                accessibilityHint={translate('También puedes deslizar hacia abajo', language)}
                onPress={onClose}
                hitSlop={12}
                style={{ alignSelf: 'center', paddingVertical: title ? spacing.three : spacing.four }}
              >
                <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: colors.line }} />
              </Pressable>
              {title ? (
                <Text style={{ fontFamily: fontFamily.editorial, fontSize: 28, lineHeight: 34, color: colors.ink }}>
                  {translate(title, language)}
                </Text>
              ) : null}
            </View>
          </GestureDetector>
          {scroll ? (
            <ScrollView style={styles.scroll} bounces={false} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {body}
            </ScrollView>
          ) : (
            body
          )}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexShrink: 1 },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
