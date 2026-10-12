/**
 * Toast · confirmaciones rápidas con acción (p. ej. "Deshacer" al guardar).
 * Aparece sobre la barra de pestañas y se retira solo a los 4 segundos.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppText } from './AppText';

interface ToastOptions {
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const hide = useCallback(() => {
    Animated.timing(progress, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
      setToast(null),
    );
  }, [progress]);

  const showToast = useCallback(
    (options: ToastOptions) => {
      idRef.current += 1;
      setToast({ ...options, id: idRef.current });
      if (timer.current) clearTimeout(timer.current);
      Animated.timing(progress, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      timer.current = setTimeout(hide, 4000);
    },
    [progress, hide],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);
  const { colors, radii, shadows } = useTheme();

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          style={[
            styles.wrap,
            {
              opacity: progress,
              transform: [
                {
                  translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
                },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.toast,
              {
                backgroundColor: colors.ink,
                borderRadius: radii.md,
                ...shadows.floating,
              },
            ]}
          >
            <AppText variant="label" color={colors.bg} style={styles.text}>
              {toast.text}
            </AppText>
            {toast.actionLabel ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  toast.onAction?.();
                  hide();
                }}
                hitSlop={8}
              >
                <AppText variant="label" color={colors.candado}>
                  {toast.actionLabel}
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider');
  return context;
}

const styles = StyleSheet.create({
  wrap: {
    pointerEvents: 'box-none',
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 88,
    alignItems: 'center',
    zIndex: 50,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: 520,
  },
  text: {
    flexShrink: 1,
  },
});
