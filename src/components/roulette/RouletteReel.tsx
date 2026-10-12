/**
 * RouletteReel · carrete animado (§6).
 *
 * Física: aceleración instantánea, desaceleración bezier larga y un
 * rebote corto al aterrizar (withSpring). Tics de sonido/vibración al
 * cruzar cada fila. Arrastre manual con imán (snap) que el padre convierte
 * en selección de prenda.
 *
 * El carrete conserva la interacción original sobre una tarjeta editorial.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { GarmentSilhouette, patternFor } from '@/components/silhouettes';
import { AppText } from '@/components/ui/AppText';
import type { Garment, ReelSlot } from '@/engine';
import { translate, useLanguage } from '@/localization';
import { hapticTick } from '@/services/haptics';
import { playTick } from '@/services/sound';
import { useTheme, type ReelKey } from '@/theme';
import { LockButton } from './LockButton';

export const REEL_HEIGHT = 116;

/** Ventana interior: inset y radio siguen a la tarjeta (20 pt menos el inset). */
const WINDOW_INSET = 4;

const PICK = (pool: Garment[], count: number): Garment[] => {
  const out: Garment[] = [];
  if (pool.length === 0) return out;
  for (let i = 0; i < count; i++) {
    out.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return out;
};

/** Ventana centrada en el ganador para poder tirar del carrete a mano. */
function recenter(winner: Garment, pool: Garment[]): { items: Garment[]; index: number } {
  const left = PICK(pool, 5);
  const right = PICK(pool, 4);
  return { items: [...left, winner, ...right], index: left.length };
}

interface ReelRowProps {
  garment: Garment;
  height: number;
  slotLabel: string;
  compact: boolean;
}

const ReelRow = memo(function ReelRow({ garment, height, slotLabel, compact }: ReelRowProps) {
  const { colors, mode } = useTheme();
  return (
    <View style={[styles.row, { height, paddingRight: compact ? 56 : 64 }]}>
      <View style={[styles.rowArt, { width: compact ? 68 : Math.min(96, height - 6), backgroundColor: colors.surfaceRaised }]}>
        <GarmentSilhouette
          silhouette={garment.silhouette}
          colorHex={garment.colorHex}
          hasPattern={garment.hasPattern}
          pattern={patternFor(garment.basicKey)}
          size={compact ? 68 : Math.min(92, height - 14)}
        />
      </View>
      <View style={styles.rowText}>
        <AppText variant="micro" color={mode === 'dark' ? colors.ink : colors.inkSoft} style={styles.category}>
          {slotLabel.toUpperCase()}
        </AppText>
        <AppText variant="subtitle" numberOfLines={2}>
          {garment.name}
        </AppText>
        <AppText variant="micro" color={mode === 'dark' ? colors.ink : colors.inkSoft} numberOfLines={1}>
          {garment.colorName}
        </AppText>
      </View>
    </View>
  );
});

interface ReelProps {
  slot: ReelSlot;
  slotLabel: string;
  /** Clave del pastel de la categoría (degradado + tinte vienen del tema). */
  tintKey: ReelKey;
  pool: Garment[];
  winner: Garment | null;
  spinId: number;
  settleMs: number;
  locked: boolean;
  spinning: boolean;
  onSettled: (slot: ReelSlot) => void;
  onToggleLock: () => void;
  onManualPick: (slot: ReelSlot, garment: Garment) => void;
  /** Altura de la tarjeta; las piezas únicas usan doble altura (§6.1). */
  height?: number;
}

export function RouletteReel({
  slot,
  slotLabel,
  tintKey,
  pool,
  winner,
  spinId,
  settleMs,
  locked,
  spinning,
  onSettled,
  onToggleLock,
  onManualPick,
  height = REEL_HEIGHT,
}: ReelProps) {
  const H = height;
  const { width } = useWindowDimensions();
  const compact = width < 360;
  /** Paso real de fila dentro de la ventana interior. */
  const ROW = H - WINDOW_INSET * 2;
  const { colors, reelGradient, reelTint, radii } = useTheme();
  const language = useLanguage();
  const [strip, setStrip] = useState<Garment[]>(() => (winner ? [winner] : []));
  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);
  const centerIndex = useRef(0);
  const displayed = useRef<Garment | null>(winner);
  const stripRef = useRef(strip);
  stripRef.current = strip;
  if (winner) displayed.current = winner;

  const triggerTick = useCallback(() => {
    hapticTick();
    playTick();
  }, []);

  // Pool vivo para los callbacks sin re-crear animaciones.
  const stripPoolRef = useRef(pool);
  stripPoolRef.current = pool;

  const handleSettle = useCallback(
    (w: Garment) => {
      const next = recenter(w, stripPoolRef.current);
      centerIndex.current = next.index;
      setStrip(next.items);
      translateY.value = -next.index * ROW;
      onSettled(slot);
    },
    [onSettled, slot, translateY, ROW],
  );

  // ── Giro ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (spinId === 0) return;
    if (locked) return;
    if (!winner) {
      onSettled(slot);
      return;
    }
    const rows: Garment[] = [];
    const startItem = displayed.current && displayed.current.id !== winner.id ? displayed.current : null;
    if (startItem) rows.push(startItem);
    const N = Math.max(8, Math.round(settleMs / 60));
    rows.push(...PICK(pool.length > 0 ? pool : [winner], N - 1));
    rows.push(winner);
    setStrip(rows);
    translateY.value = 0;
    const target = -(rows.length - 1) * ROW;
    translateY.value = withTiming(
      target + 12,
      {
        duration: Math.max(300, settleMs - 130),
        easing: Easing.bezier(0.14, 0.78, 0.18, 1),
      },
      (finished) => {
        'worklet';
        if (finished) {
          translateY.value = withSpring(
            target,
            { damping: 17, stiffness: 240, mass: 0.9 },
            (landed) => {
              'worklet';
              if (landed) {
                runOnJS(handleSettle)(winner);
              }
            },
          );
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinId]);

  // ── Cambios externos del ganador (undo, cargar look, selección manual) ──
  useEffect(() => {
    if (spinning || !winner) return;
    if (stripRef.current[centerIndex.current]?.id === winner.id) return;
    const next = recenter(winner, stripPoolRef.current);
    centerIndex.current = next.index;
    setStrip(next.items);
    translateY.value = -next.index * ROW;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, spinning]);

  // ── Tics al cruzar filas ─────────────────────────────────────────────────
  useAnimatedReaction(
    () => Math.floor(-translateY.value / ROW + 0.5),
    (curr, prev) => {
      if (prev !== null && curr !== prev) {
        runOnJS(triggerTick)();
      }
    },
  );

  const handleManual = useCallback(
    (idx: number) => {
      const g = stripRef.current[idx];
      if (g && g.id !== displayed.current?.id) {
        onManualPick(slot, g);
      }
    },
    [onManualPick, slot],
  );

  // ── Arrastre manual con imán ─────────────────────────────────────────────
  const pan = Gesture.Pan()
    .enabled(!locked && !spinning && strip.length > 1)
    .activeOffsetY([-8, 8])
    .onBegin(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      const min = -(strip.length - 1) * ROW;
      let next = startY.value + event.translationY;
      if (next > 20) next = 20;
      if (next < min - 20) next = min - 20;
      translateY.value = next;
    })
    .onEnd(() => {
      const minIdx = 0;
      const maxIdx = strip.length - 1;
      let idx = Math.round(-translateY.value / ROW);
      idx = Math.max(minIdx, Math.min(maxIdx, idx));
      translateY.value = withSpring(-idx * ROW, { damping: 20, stiffness: 220 });
      if (idx !== centerIndex.current) {
        centerIndex.current = idx;
        runOnJS(handleManual)(idx);
      }
    });

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View
      accessibilityLabel={language === 'en' ? `${translate(slotLabel, language)} reel${locked ? ', locked' : ''}` : `Carrete ${slotLabel}${locked ? ', fijado' : ''}`}
      style={[
        styles.card,
        {
          height: H,
          backgroundColor: reelTint[tintKey],
          borderColor: locked ? colors.ink : colors.cardEdge,
          borderWidth: locked ? 1.5 : 1,
        },
      ]}
    >
      <LinearGradient
        colors={reelGradient[tintKey]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Filo superior: una línea de luz que asienta la tarjeta sobre el fondo. */}
      <View style={[styles.sheen, { backgroundColor: colors.sheen }]} />

      <GestureDetector gesture={pan}>
        <View
          style={[
            styles.window,
            {
              borderRadius: radii.card - WINDOW_INSET,
              backgroundColor: locked ? colors.sheen : 'transparent',
            },
          ]}
        >
          <View style={styles.clip}>
            {strip.length === 0 ? (
              <View style={[styles.row, { height: ROW }]}>
                <AppText variant="label" color={colors.inkSoft} style={{ marginLeft: 16 }}>
                  Sin prendas todavía
                </AppText>
              </View>
            ) : (
              <Animated.View style={[styles.strip, stripStyle]}>
                {strip.map((g, i) => (
                  <ReelRow key={`${g.id}-${i}`} garment={g} height={ROW} slotLabel={slotLabel} compact={compact} />
                ))}
              </Animated.View>
            )}
          </View>
        </View>
      </GestureDetector>

      <View style={[styles.lockWrap, { top: (H - 48) / 2 }]}>
        <LockButton locked={locked} onToggle={onToggleLock} disabled={spinning} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: REEL_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  sheen: {
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  window: {
    position: 'absolute',
    top: WINDOW_INSET,
    left: WINDOW_INSET,
    right: WINDOW_INSET,
    bottom: WINDOW_INSET,
    overflow: 'hidden',
  },
  clip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  strip: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 64,
    gap: 8,
  },
  rowArt: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 92,
    borderRadius: 12,
  },
  rowText: {
    flex: 1,
  },
  category: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  lockWrap: {
    position: 'absolute',
    right: 10,
  },
});
