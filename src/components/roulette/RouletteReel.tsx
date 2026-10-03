/**
 * RouletteReel · carrete animado (§6).
 *
 * Física: aceleración instantánea, desaceleración bezier larga y un
 * rebote corto al aterrizar (withSpring). Tics de sonido/vibración al
 * cruzar cada fila. Arrastre manual con imán (snap) que el padre convierte
 * en selección + candado automático (§7.2).
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { hapticTick } from '@/services/haptics';
import { playTick } from '@/services/sound';
import { useTheme } from '@/theme';
import { LockButton } from './LockButton';

export const REEL_HEIGHT = 116;

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
}

const ReelRow = memo(function ReelRow({ garment, height }: ReelRowProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { height }]}>
      <View style={[styles.rowArt, { width: Math.min(112, height - 4) }]}>
        <GarmentSilhouette
          silhouette={garment.silhouette}
          colorHex={garment.colorHex}
          hasPattern={garment.hasPattern}
          pattern={patternFor(garment.basicKey)}
          size={Math.min(104, height - 12)}
        />
      </View>
      <View style={styles.rowText}>
        <AppText variant="subtitle" numberOfLines={1}>
          {garment.name}
        </AppText>
        <AppText variant="micro" color={colors.inkSoft} numberOfLines={1}>
          {garment.colorName}
        </AppText>
      </View>
    </View>
  );
});

interface ReelProps {
  slot: ReelSlot;
  slotLabel: string;
  tint: string;
  pool: Garment[];
  winner: Garment | null;
  spinId: number;
  settleMs: number;
  locked: boolean;
  spinning: boolean;
  onSettled: (slot: ReelSlot) => void;
  onToggleLock: () => void;
  onManualPick: (slot: ReelSlot, garment: Garment) => void;
  showLockTip?: boolean;
  /** Altura de la tarjeta; las piezas únicas usan doble altura (§6.1). */
  height?: number;
}

export function RouletteReel({
  slot,
  slotLabel,
  tint,
  pool,
  winner,
  spinId,
  settleMs,
  locked,
  spinning,
  onSettled,
  onToggleLock,
  onManualPick,
  showLockTip,
  height = REEL_HEIGHT,
}: ReelProps) {
  const H = height;
  const { colors } = useTheme();
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
      translateY.value = -next.index * H;
      onSettled(slot);
    },
    [onSettled, slot, translateY, H],
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
    const target = -(rows.length - 1) * H;
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
    translateY.value = -next.index * H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, spinning]);

  // ── Tics al cruzar filas ─────────────────────────────────────────────────
  useAnimatedReaction(
    () => Math.floor(-translateY.value / H + 0.5),
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
      const min = -(strip.length - 1) * H;
      let next = startY.value + event.translationY;
      if (next > 20) next = 20;
      if (next < min - 20) next = min - 20;
      translateY.value = next;
    })
    .onEnd(() => {
      const minIdx = 0;
      const maxIdx = strip.length - 1;
      let idx = Math.round(-translateY.value / H);
      idx = Math.max(minIdx, Math.min(maxIdx, idx));
      translateY.value = withSpring(-idx * H, { damping: 20, stiffness: 220 });
      if (idx !== centerIndex.current) {
        centerIndex.current = idx;
        runOnJS(handleManual)(idx);
      }
    });

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View
        accessibilityLabel={`Carrete ${slotLabel}${locked ? ', fijado' : ''}`}
        style={[
          styles.card,
          {
            height: H,
            backgroundColor: tint,
            borderColor: locked ? colors.inkSoft : 'transparent',
            borderWidth: locked ? 1.5 : 0,
            borderStyle: locked ? 'dashed' : 'solid',
            opacity: locked ? 0.94 : 1,
          },
        ]}
      >
        <View style={styles.clip}>
          {strip.length === 0 ? (
            <View style={[styles.row, { height: H }]}>
              <AppText variant="label" color={colors.inkSoft} style={{ marginLeft: 16 }}>
                Sin prendas todavía
              </AppText>
            </View>
          ) : (
            <Animated.View style={[styles.strip, stripStyle]}>
              {strip.map((g, i) => (
                <ReelRow key={`${g.id}-${i}`} garment={g} height={H} />
              ))}
            </Animated.View>
          )}
        </View>
        <View style={[styles.lockWrap, { top: (H - 48) / 2 }]}>
          <LockButton locked={locked} onToggle={onToggleLock} disabled={spinning} />
        </View>
        {showLockTip ? (
          <View style={[styles.tip, { backgroundColor: colors.ink }]}>
            <AppText variant="micro" color={colors.bg}>
              Toca aquí si quieres fijar una prenda específica
            </AppText>
          </View>
        ) : null}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    height: REEL_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  clip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
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
    paddingLeft: 10,
    paddingRight: 64,
    gap: 8,
  },
  rowArt: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  lockWrap: {
    position: 'absolute',
    right: 12,
  },
  tip: {
    position: 'absolute',
    right: 66,
    top: 10,
    maxWidth: 190,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
