/**
 * Sheet · hoja inferior deslizable (§15.3: radios de 28 en esquinas superiores).
 * Animación con Animated nativo; se cierra tocando el fondo.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { fontFamily, useTheme } from '@/theme';

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
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, { toValue: 1, duration: 240, useNativeDriver: true }).start();
    } else if (mounted) {
      Animated.timing(progress, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
        setMounted(false),
      );
    }
  }, [visible, mounted, progress]);

  if (!mounted) return null;

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [560, 0] });

  const body = (
    <View style={{ paddingHorizontal: spacing.six, paddingBottom: spacing.seven }}>
      {title ? (
        <View style={{ marginBottom: spacing.four }}>
          <View
            style={{
              alignSelf: 'center',
              width: 44,
              height: 5,
              borderRadius: 3,
              backgroundColor: colors.line,
              marginBottom: spacing.five,
              marginTop: spacing.three,
            }}
          />
          <View>
            <Animated.Text
              style={{
                fontFamily: fontFamily.editorial,
                fontSize: 28,
                lineHeight: 34,
                color: colors.ink,
              }}
            >
              {title}
            </Animated.Text>
          </View>
        </View>
      ) : (
        <View
          style={{
            alignSelf: 'center',
            width: 44,
            height: 5,
            borderRadius: 3,
            backgroundColor: colors.line,
            marginVertical: spacing.four,
          }}
        />
      )}
      {children}
    </View>
  );

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.ink, opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] }) }]}
        />
        <Pressable accessibilityLabel="Cerrar" style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.panel,
            shadows.sheet,
            {
              backgroundColor: colors.bg,
              borderTopLeftRadius: radii.sheet,
              borderTopRightRadius: radii.sheet,
              maxHeight: `${Math.round(maxHeightRatio * 100)}%` as unknown as number,
              transform: [{ translateY }],
            },
          ]}
        >
          {scroll ? (
            <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
              {body}
            </ScrollView>
          ) : (
            body
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
