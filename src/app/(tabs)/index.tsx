/**
 * Pantalla 1 · La Ruleta (Hero Screen §5.1 y §6).
 * Orquesta: cabecera de clima, chips de ocasión, carretes con candado,
 * acciones secundarias y el botón GIRAR con su coreografía escalonada.
 */

import { Redirect, router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { REEL_HEIGHT, RouletteReel } from '@/components/roulette/RouletteReel';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useToast } from '@/components/ui/Toast';
import { WeatherChip, WeatherSheet } from '@/components/weather';
import { candidateItems, useApp } from '@/context/AppContext';
import {
  fitsOccasion,
  modeForTemperature,
  OCCASION_LABELS,
  passesWeather,
  reelConfigFor,
  type Garment,
  type Occasion,
  type ReelSlot,
} from '@/engine';
import { hapticReelStop, hapticSpinStart, hapticSuccess } from '@/services/haptics';
import { playChime, playTunc } from '@/services/sound';
import { useTheme } from '@/theme';
import { shareOutfit } from '@/utils/share';

const OCCASION_ORDER: Occasion[] = ['all', 'classes', 'date', 'party', 'gym'];
const OCCASION_PREFIX: Record<Occasion, string> = {
  all: '',
  classes: '🎒 ',
  date: '☕ ',
  party: '🌙 ',
  gym: '🏃 ',
};
const MERGED_HEIGHT = REEL_HEIGHT * 2 + 8;

function settleMsFor(slot: ReelSlot, isMergedCard: boolean): number {
  if (slot === 'top') return isMergedCard ? 1250 : 900;
  if (slot === 'bottom') return 1250;
  if (slot === 'layer') return 1600;
  return 1800;
}

function slotLabel(slot: ReelSlot, isMergedCard: boolean): string {
  if (isMergedCard) return 'Una pieza';
  switch (slot) {
    case 'top':
      return 'Superior';
    case 'bottom':
      return 'Inferior';
    case 'layer':
      return 'Capa';
    default:
      return 'Calzado';
  }
}

function ActionButton({
  glyph,
  label,
  onPress,
  disabled,
}: {
  glyph: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.action, { opacity: disabled ? 0.35 : pressed ? 0.65 : 1 }]}
    >
      <AppText variant="subtitle">{glyph}</AppText>
      <AppText variant="micro" color={colors.inkSoft}>
        {label}
      </AppText>
    </Pressable>
  );
}

export default function RouletteScreen() {
  const app = useApp();
  const { colors, reelTint } = useTheme();
  const { showToast } = useToast();

  const [spinId, setSpinId] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [settled, setSettled] = useState(0);
  const [weatherOpen, setWeatherOpen] = useState(false);
  const expectedRef = useRef(0);

  const mode = modeForTemperature(app.temperatureForEngine, app.settings.personalOffsetC);
  const config = reelConfigFor(mode, app.settings.layerEnabled);
  const current = app.current;
  const merged = Boolean(current?.onepiece && !current?.top && !current?.bottom);
  const onepieceId = merged && current?.onepiece ? current.onepiece.id : null;

  const activeGarments = useMemo(
    () => app.garments.filter((g) => !g.isArchived && !g.isLaundry),
    [app.garments],
  );

  const displaySlots: ReelSlot[] = useMemo(() => {
    const slots: ReelSlot[] = merged ? ['top'] : ['top', 'bottom'];
    if (config.showLayer) slots.push('layer');
    slots.push('shoes');
    return slots;
  }, [merged, config.showLayer]);

  const poolFor = useCallback(
    (slot: ReelSlot): Garment[] => {
      const pool = merged && slot === 'top'
        ? activeGarments.filter((g) => g.slot === 'onepiece')
        : activeGarments.filter((g) => g.slot === slot);
      const filtered = pool.filter((g) => fitsOccasion(g, app.occasion) && passesWeather(g, mode));
      return filtered.length > 0 ? filtered : pool;
    },
    [activeGarments, app.occasion, merged, mode],
  );

  const winnerFor = useCallback(
    (slot: ReelSlot): Garment | null => {
      if (!current) return null;
      if (merged && slot === 'top') return current.onepiece ?? null;
      return (current[slot] as Garment | undefined) ?? null;
    },
    [current, merged],
  );

  const isLocked = useCallback(
    (slot: ReelSlot): boolean => {
      if (merged && slot === 'top' && onepieceId) return app.isOnepieceLocked(onepieceId);
      return Boolean(app.locks[slot]);
    },
    [app, merged, onepieceId],
  );

  const allLocked = useMemo(
    () => displaySlots.every((slot) => isLocked(slot)),
    [displaySlots, isLocked],
  );

  const dismissTip = app.dismissLockTip;

  // El tip del primer giro se retira solo a los 12 segundos.
  useEffect(() => {
    if (!app.showLockTip) return;
    const timer = setTimeout(dismissTip, 12000);
    return () => clearTimeout(timer);
  }, [app.showLockTip, dismissTip]);

  const handleReelSettled = useCallback(() => {
    hapticReelStop();
    playTunc();
    setSettled((count) => count + 1);
  }, []);

  useEffect(() => {
    if (spinning && settled >= expectedRef.current) {
      setSpinning(false);
      hapticSuccess();
      playChime();
    }
  }, [spinning, settled]);

  const handleSpin = useCallback(() => {
    if (spinning) return;
    const result = app.spinNow();
    if (!result || result.candidateCount === 0) {
      // Mensajes honestos por caso: gym sin ropa sport, frío sin capas, o genérico.
      const hasSport = app.garments.some((g) => !g.isArchived && g.tags.includes('sport'));
      const hasLayer = app.garments.some((g) => !g.isArchived && g.slot === 'layer');
      if (app.occasion === 'gym' && !hasSport) {
        showToast({
          text: 'Tu armario aún no tiene ropa deportiva. Suma prendas con etiqueta sport.',
          actionLabel: 'Añadir prenda',
          onAction: () => router.push('/garment/new'),
        });
        return;
      }
      if (mode === 'heavyCold' && !hasLayer) {
        showToast({
          text: 'Hace frío y tu armario aún no tiene capas: suma una casaca o chompa.',
          actionLabel: 'Añadir capa',
          onAction: () => router.push('/garment/new'),
        });
        return;
      }
      showToast({ text: 'No hay combinaciones posibles con esos filtros. Prueba otra ocasión.' });
      return;
    }
    dismissTip();
    hapticSpinStart();
    const postMerged = Boolean(result.outfit.onepiece && !result.outfit.top && !result.outfit.bottom);
    const postSlots: ReelSlot[] = postMerged ? ['top'] : ['top', 'bottom'];
    if (config.showLayer) postSlots.push('layer');
    postSlots.push('shoes');
    const locksNow = app.locks;
    const expected = postSlots.filter((s) => {
      if (postMerged && s === 'top' && result.outfit.onepiece) {
        const id = result.outfit.onepiece.id;
        return !(locksNow.top === id && locksNow.bottom === id);
      }
      return !locksNow[s];
    }).length;
    expectedRef.current = expected;
    setSettled(0);
    setSpinning(true);
    setSpinId((id) => id + 1);
  }, [app, config.showLayer, dismissTip, showToast, spinning]);

  const handleToggleLock = useCallback(
    (slot: ReelSlot) => {
      dismissTip();
      if (merged && slot === 'top' && onepieceId) {
        app.toggleOnepieceLock(onepieceId);
      } else {
        app.toggleLock(slot);
      }
    },
    [app, dismissTip, merged, onepieceId],
  );

  const handleManualPick = useCallback(
    (slot: ReelSlot, garment: Garment) => {
      dismissTip();
      app.manualPick(slot, garment.id);
    },
    [app, dismissTip],
  );

  const handleSave = useCallback(() => {
    const look = app.saveCurrentLook();
    if (look) {
      showToast({
        text: 'Look guardado en tu Lookbook',
        actionLabel: 'Deshacer',
        onAction: () => app.deleteLook(look.id),
      });
    }
  }, [app, showToast]);

  const handleWear = useCallback(() => {
    app.registerWear();
    showToast({ text: '¡Registrado! No te sugeriremos este look los próximos días' });
  }, [app, showToast]);

  const handleShare = useCallback(async () => {
    if (!current) return;
    const outcome = await shareOutfit(candidateItems(current));
    if (outcome === 'copied') {
      showToast({ text: 'Look copiado, pégalo donde quieras' });
    } else if (outcome === 'failed') {
      showToast({ text: 'No se pudo compartir en este dispositivo' });
    }
  }, [current, showToast]);

  if (!app.hasOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  const weatherHint =
    app.weather.status === 'ready'
      ? mode === 'summer'
        ? 'Hace calor: hoy giramos sin capa'
        : mode === 'temperate'
          ? 'Clima templado'
          : mode === 'cold'
            ? 'Hace fresco: capa activada'
            : 'Frío de hoy: capa obligatoria'
      : 'Sin clima configurado: giros con 20° por defecto';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexShrink: 1 }}>
          <AppText variant="title">¿Qué me pongo hoy?</AppText>
          <AppText variant="micro" color={colors.inkSoft} numberOfLines={1}>
            {app.settings.chaosMode ? 'Modo caos: sin reglas de color ni formalidad' : weatherHint}
          </AppText>
        </View>
        <WeatherChip onPress={() => setWeatherOpen(true)} />
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {OCCASION_ORDER.map((occasion) => (
            <Chip
              key={occasion}
              label={`${OCCASION_PREFIX[occasion]}${OCCASION_LABELS[occasion]}`}
              selected={app.occasion === occasion}
              onPress={() => app.setOccasion(occasion)}
            />
          ))}
        </ScrollView>
      </View>

      {activeGarments.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="subtitle" style={{ textAlign: 'center' }}>
            Tu armario está vacío
          </AppText>
          <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
            Agrega ropa con una foto o elige de los básicos. (Mientras tanto no hay nada que girar.)
          </AppText>
          <PrimaryButton label="＋ Añadir prenda" onPress={() => router.push('/garment/new')} />
        </View>
      ) : (
        <ScrollView style={styles.reelsScroll} contentContainerStyle={styles.reels}>
          {displaySlots.map((slot) => {
            const isMergedCard = merged && slot === 'top';
            return (
              <RouletteReel
                key={isMergedCard ? 'merged-top' : slot}
                slot={slot}
                slotLabel={slotLabel(slot, isMergedCard)}
                tint={isMergedCard ? reelTint.onepiece : reelTint[slot]}
                pool={poolFor(slot)}
                winner={winnerFor(slot)}
                spinId={spinId}
                settleMs={settleMsFor(slot, isMergedCard)}
                locked={isLocked(slot)}
                spinning={spinning}
                onSettled={handleReelSettled}
                onToggleLock={() => handleToggleLock(slot)}
                onManualPick={handleManualPick}
                showLockTip={slot === 'top' && app.showLockTip}
                height={isMergedCard ? MERGED_HEIGHT : REEL_HEIGHT}
              />
            );
          })}
        </ScrollView>
      )}

      <View style={styles.actionsRow}>
        <ActionButton glyph="⭐" label="Guardar" onPress={handleSave} disabled={!current || spinning} />
        <ActionButton glyph="✅" label="Me lo pongo" onPress={handleWear} disabled={!current || spinning} />
        <ActionButton glyph="↩" label="Deshacer" onPress={app.undo} disabled={!app.canUndo || spinning} />
        <ActionButton glyph="↗" label="Compartir" onPress={() => void handleShare()} disabled={!current || spinning} />
      </View>

      <View style={styles.spinWrap}>
        <PrimaryButton
          label={allLocked ? 'Desbloquea al menos un carrete' : '🎰 GIRAR'}
          onPress={handleSpin}
          disabled={spinning || allLocked || activeGarments.length === 0}
          accessibilityHint="Gira la ruleta y arma un outfit con tu ropa"
        />
      </View>

      <WeatherSheet visible={weatherOpen} onClose={() => setWeatherOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  chips: {
    gap: 8,
    paddingBottom: 12,
  },
  reelsScroll: {
    flex: 1,
  },
  reels: {
    gap: 8,
    paddingBottom: 8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 64,
    minHeight: 48,
  },
  spinWrap: {
    paddingBottom: 12,
  },
});
