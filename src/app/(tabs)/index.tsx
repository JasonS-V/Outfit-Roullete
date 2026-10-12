/**
 * Pantalla 1 · La Ruleta (Hero Screen §5.1 y §6).
 * Orquesta: cabecera de clima, chips de ocasión, carretes con candado,
 * acciones secundarias y el botón GIRAR con su coreografía escalonada.
 */

import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { REEL_HEIGHT, RouletteReel } from '@/components/roulette/RouletteReel';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import {
  CheckIcon,
  DottedBoxIcon,
  LockIcon,
  PlusIcon,
  ShareIcon,
  SlotMachineIcon,
  StarIcon,
  UndoIcon,
} from '@/components/ui/icons';
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
import { useTheme, type ReelKey } from '@/theme';
import { shareOutfit } from '@/utils/share';

const OCCASION_ORDER: Occasion[] = ['all', 'classes', 'date', 'party', 'gym'];
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
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: React.ReactNode;
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
      style={({ pressed }) => [styles.action, { opacity: disabled ? 0.35 : pressed ? 0.6 : 1 }]}
    >
      <View style={styles.actionDisc}>
        {icon}
      </View>
      <AppText variant="micro" color={disabled ? colors.inkSoft : colors.ink} style={styles.actionLabel}>
        {label}
      </AppText>
    </Pressable>
  );
}

export default function RouletteScreen() {
  const app = useApp();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [spinId, setSpinId] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [settled, setSettled] = useState(0);
  const [weatherOpen, setWeatherOpen] = useState(false);
  const expectedRef = useRef(0);
  const scrollRef = useRef<ScrollView>(null);
  const reelsYRef = useRef(0);
  const scrollAfterSpinRef = useRef(false);
  const handledScrollRef = useRef<string | undefined>(undefined);
  const { scrollToActions } = useLocalSearchParams<{ scrollToActions?: string }>();

  useFocusEffect(useCallback(() => {
    if (!scrollToActions || handledScrollRef.current === scrollToActions) return;
    handledScrollRef.current = scrollToActions;
    const frame = requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    return () => cancelAnimationFrame(frame);
  }, [scrollToActions]));

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
      if (scrollAfterSpinRef.current) {
        scrollAfterSpinRef.current = false;
        requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
      }
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
    scrollAfterSpinRef.current = true;
    setSettled(0);
    setSpinning(true);
    setSpinId((id) => id + 1);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: Math.max(0, reelsYRef.current - 12), animated: true }));
  }, [app, config.showLayer, dismissTip, mode, showToast, spinning]);

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

  if (!app.ready) return null;

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
      : 'Sin clima: usaremos una temperatura templada';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView ref={scrollRef} style={styles.reelsScroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <AppText variant="micro" style={styles.eyebrow}>OUTFIT ROULETTE</AppText>
            <WeatherChip onPress={() => setWeatherOpen(true)} />
          </View>
          <AppText variant="title" style={styles.headline}>¿Qué te pones hoy?</AppText>
          <AppText variant="body" color={colors.inkSoft} style={styles.weatherHint}>
            {app.settings.chaosMode ? 'Modo caos: sin reglas de color ni formalidad' : weatherHint}
          </AppText>
        </View>

        <AppText variant="label" style={styles.sectionLabel}>
          ¿Cuál es tu plan?
        </AppText>
        <View style={styles.chips}>
          {OCCASION_ORDER.map((occasion) => {
            const isSelected = app.occasion === occasion;
            return (
              <Chip
                key={occasion}
                label={OCCASION_LABELS[occasion]}
                selected={isSelected}
                onPress={() => app.setOccasion(occasion)}
              />
            );
          })}
        </View>

        {app.showLockTip && activeGarments.length > 0 ? (
          <View
            style={[
              styles.hintBar,
              { backgroundColor: colors.surface, borderColor: colors.cardEdge },
            ]}
          >
            <LockIcon color={colors.inkSoft} size={16} />
            <AppText variant="micro" color={colors.inkSoft} style={{ flex: 1 }}>
              Toca el candado para fijar una prenda y girar solo el resto
            </AppText>
          </View>
        ) : null}

        <View style={styles.sectionHead}>
          <AppText variant="subtitle">Tu combinación</AppText>
          <AppText variant="micro" color={colors.inkSoft}>Desliza para cambiar</AppText>
        </View>

        <View style={styles.reels} onLayout={(event) => { reelsYRef.current = event.nativeEvent.layout.y; }}>
          {activeGarments.length === 0 ? (
            <View style={styles.empty}>
              <View
                style={[
                  styles.emptyArt,
                  { borderColor: colors.line, backgroundColor: colors.surface },
                ]}
              >
                <DottedBoxIcon color={colors.inkSoft} size={44} strokeWidth={1.6} />
              </View>
              <AppText variant="subtitle" style={{ textAlign: 'center' }}>
                Tu armario está vacío
              </AppText>
              <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
                Añade algunas prendas para crear tu primer look.
              </AppText>
            </View>
          ) : displaySlots.map((slot) => {
            const isMergedCard = merged && slot === 'top';
            return (
              <RouletteReel
                key={isMergedCard ? 'merged-top' : slot}
                slot={slot}
                slotLabel={slotLabel(slot, isMergedCard)}
                tintKey={(isMergedCard ? 'onepiece' : slot) as ReelKey}
                pool={poolFor(slot)}
                winner={winnerFor(slot)}
                spinId={spinId}
                settleMs={settleMsFor(slot, isMergedCard)}
                locked={isLocked(slot)}
                spinning={spinning}
                onSettled={handleReelSettled}
                onToggleLock={() => handleToggleLock(slot)}
                onManualPick={handleManualPick}
                height={isMergedCard ? MERGED_HEIGHT : REEL_HEIGHT}
              />
            );
          })}

        </View>
        {current && activeGarments.length > 0 && !spinning ? <View style={[styles.actionsRow, { borderColor: colors.line }]}>
          <ActionButton
            icon={<CheckIcon color={!spinning ? colors.ink : colors.inkSoft} size={22} />}
            label="Me lo pongo"
            onPress={handleWear}
            disabled={spinning}
          />
          <ActionButton
            icon={<StarIcon color={!spinning ? colors.ink : colors.inkSoft} size={22} />}
            label="Guardar"
            onPress={handleSave}
            disabled={spinning}
          />
          <ActionButton
            icon={<UndoIcon color={app.canUndo && !spinning ? colors.ink : colors.inkSoft} size={22} />}
            label="Deshacer"
            onPress={app.undo}
            disabled={!app.canUndo || spinning}
          />
          <ActionButton
            icon={<ShareIcon color={!spinning ? colors.ink : colors.inkSoft} size={22} />}
            label="Compartir"
            onPress={() => void handleShare()}
            disabled={spinning}
          />
        </View> : null}
      </ScrollView>

      <View style={[styles.spinDock, { backgroundColor: colors.surfaceRaised, borderTopColor: colors.line }]}>
        <PrimaryButton
          label={activeGarments.length === 0 ? 'Añadir prendas' : spinning ? 'Girando…' : allLocked ? 'Desbloquea una prenda' : current ? 'Girar otro look' : 'Crear mi look'}
          leading={activeGarments.length === 0 ? <PlusIcon color={colors.onChicle} size={22} /> : allLocked ? undefined : <SlotMachineIcon color={colors.onChicle} size={22} />}
          onPress={activeGarments.length === 0 ? () => router.push('/garment/new') : handleSpin}
          disabled={spinning || (activeGarments.length > 0 && allLocked)}
          accessibilityHint="Crea una combinación con tu ropa"
        />
      </View>

      <WeatherSheet visible={weatherOpen} onClose={() => setWeatherOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  header: {
    gap: 5,
    paddingTop: 14,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  eyebrow: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.3,
    flexShrink: 1,
  },
  headline: {
    marginTop: 18,
  },
  weatherHint: {
    marginTop: 4,
  },
  sectionLabel: {
    marginBottom: 2,
  },
  sectionHead: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
    paddingTop: 22,
    paddingBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 10,
    paddingBottom: 4,
  },
  reelsScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  reels: {
    gap: 8,
    paddingTop: 4,
  },
  hintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  empty: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  emptyArt: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 8,
    borderTopWidth: 1,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 48,
  },
  actionLabel: {
    textAlign: 'center',
  },
  actionDisc: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinDock: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
});
