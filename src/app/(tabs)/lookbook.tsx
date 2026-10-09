/**
 * Pantalla 3 · Looks (§12): colección guardada, filtro "Para hoy",
 * detalle con cargar-en-ruleta, registrar uso, compartir y eliminar.
 */

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GarmentSilhouette, patternFor } from '@/components/silhouettes';
import { AppText } from '@/components/ui/AppText';
import { CheckIcon, ShareIcon, SlotMachineIcon, StarIcon } from '@/components/ui/icons';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { useApp } from '@/context/AppContext';
import { OCCASION_LABELS, type Garment, type SavedLook } from '@/engine';
import { useTheme } from '@/theme';
import { confirmDestructive } from '@/utils/confirm';
import { shareOutfit } from '@/utils/share';

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

function tempDiff(a: number, b: number): number {
  return Math.abs(a - b);
}

export default function LookbookScreen() {
  const app = useApp();
  const { colors, radii, spacing } = useTheme();
  const { showToast } = useToast();
  const [openId, setOpenId] = useState<string | null>(null);

  const looks = useMemo(() => [...app.looks].sort((a, b) => b.createdAt - a.createdAt), [app.looks]);

  const todayLooks = useMemo(() => {
    if (app.weather.status !== 'ready' || !app.weather.data) return [];
    const temp = app.weather.data.apparentC;
    return looks.filter(
      (l) => l.temperatureAtSave !== null && tempDiff(l.temperatureAtSave, temp) <= 3,
    );
  }, [looks, app.weather]);

  const openLook = openId ? looks.find((l) => l.id === openId) ?? null : null;

  const itemsOf = (look: SavedLook): Garment[] =>
    look.garmentIds
      .map((id) => app.garmentById(id))
      .filter((g): g is Garment => Boolean(g));

  const renderCollage = (look: SavedLook, size: number) => {
    const items = itemsOf(look).slice(0, 3);
    return (
      <View style={styles.collage}>
        {items.map((g) => (
          <GarmentSilhouette
            key={g.id}
            silhouette={g.silhouette}
            colorHex={g.colorHex}
            hasPattern={g.hasPattern}
            pattern={patternFor(g.basicKey)}
            size={size}
          />
        ))}
      </View>
    );
  };

  const lookCard = (look: SavedLook, compactCard: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Look de ${OCCASION_LABELS[look.occasion]} del ${formatDate(look.createdAt)}`}
      onPress={() => setOpenId(look.id)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.bg,
          borderRadius: radii.card,
          opacity: pressed ? 0.85 : 1,
          width: compactCard ? 168 : '48%',
        },
      ]}
    >
      <View style={[styles.collageWrap, { backgroundColor: colors.reelTop, borderRadius: radii.md }]}>
        {renderCollage(look, compactCard ? 42 : 48)}
      </View>
      <View style={styles.cardFooter}>
        <AppText variant="label" numberOfLines={1}>Look guardado</AppText>
        <AppText variant="micro" color={colors.inkSoft} numberOfLines={1}>
          {OCCASION_LABELS[look.occasion]} · {formatDate(look.createdAt)}
        </AppText>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppText variant="micro" color={colors.inkSoft} style={styles.eyebrow}>TUS FAVORITOS  /  03</AppText>
      <View style={styles.titleRow}>
        <AppText variant="title" style={styles.title}>Mis looks.</AppText>
        <AppText variant="micro" color={colors.inkSoft}>{looks.length} guardados</AppText>
      </View>

      {looks.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyArt, { borderColor: colors.line, backgroundColor: colors.surface }]}>
            <StarIcon color={colors.inkSoft} size={42} strokeWidth={1.6} />
          </View>
          <AppText variant="subtitle" style={{ textAlign: 'center' }}>
            Aún no guardas looks
          </AppText>
          <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
            Cuando la ruleta te dé un outfit que te encante, toca Guardar y aparecerá aquí.
          </AppText>
          <PrimaryButton label="Girar ahora" onPress={() => router.push('/')} leading={<SlotMachineIcon color={colors.onChicle} size={22} />} />
        </View>
      ) : (
        <FlatList
          data={looks}
          keyExtractor={(l) => l.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.rowGap}
          contentContainerStyle={styles.grid}
          ListHeaderComponent={
            todayLooks.length > 0 ? (
              <View style={{ gap: 8, marginBottom: 12 }}>
                <AppText variant="subtitle">Para hoy</AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {todayLooks.map((look) => (
                    <View key={look.id}>{lookCard(look, true)}</View>
                  ))}
                </ScrollView>
              </View>
            ) : null
          }
          renderItem={({ item }) => lookCard(item, false)}
        />
      )}

      <Sheet visible={openLook !== null} onClose={() => setOpenId(null)} title="Look guardado">
        {openLook ? (
          <View style={{ gap: spacing.four }}>
            <View style={{ alignItems: 'center' }}>{renderCollage(openLook, 64)}</View>
            <AppText variant="label" color={colors.inkSoft} style={{ textAlign: 'center' }}>
              {OCCASION_LABELS[openLook.occasion]}
              {openLook.temperatureAtSave !== null
                ? ` · guardado con ${Math.round(openLook.temperatureAtSave)}°C`
                : ''}
            </AppText>
            <View style={{ gap: 6 }}>
              {itemsOf(openLook).map((g) => (
                <View key={g.id} style={styles.itemRow}>
                  <GarmentSilhouette silhouette={g.silhouette} colorHex={g.colorHex} size={40} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="label" numberOfLines={1}>
                      {g.name}
                    </AppText>
                    <AppText variant="micro" color={colors.inkSoft}>
                      {g.colorName}
                    </AppText>
                  </View>
                </View>
              ))}
              {itemsOf(openLook).length < openLook.garmentIds.length ? (
                <AppText variant="micro" color={colors.danger}>
                  Una o más prendas de este look ya no están en tu armario.
                </AppText>
              ) : null}
            </View>
            <PrimaryButton
              label="Cargar en la ruleta"
              onPress={() => {
                const missing = app.applyLook(openLook);
                setOpenId(null);
                router.push('/');
                showToast({
                  text:
                    missing > 0
                      ? `Look cargado con candados (faltan ${missing} prenda${missing === 1 ? '' : 's'})`
                      : 'Look cargado con candados en la ruleta',
                });
              }}
            />
            <PrimaryButton
              label="Me lo pongo hoy"
              variant="ghost"
              leading={<CheckIcon size={18} color={colors.ink} />}
              onPress={() => {
                app.registerWear(openLook.garmentIds);
                showToast({ text: 'Registrado. No te sugeriremos este look los próximos días' });
              }}
            />
            <PrimaryButton
              label="Compartir"
              variant="ghost"
              leading={<ShareIcon size={18} color={colors.ink} />}
              onPress={async () => {
                const outcome = await shareOutfit(itemsOf(openLook));
                if (outcome === 'copied') showToast({ text: 'Look copiado, pégalo donde quieras' });
                if (outcome === 'failed') showToast({ text: 'No se pudo compartir en este dispositivo' });
              }}
            />
            <PrimaryButton
              label="Eliminar look"
              variant="danger"
              onPress={async () => {
                const ok = await confirmDestructive('Eliminar look', 'Se quitará del Lookbook para siempre.');
                if (ok) {
                  app.deleteLook(openLook.id);
                  setOpenId(null);
                  showToast({ text: 'Look eliminado' });
                }
              }}
            />
          </View>
        ) : null}
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eyebrow: {
    paddingTop: 12,
    letterSpacing: 1.3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: {
    paddingTop: 10,
    paddingBottom: 18,
  },
  grid: {
    gap: 20,
    paddingBottom: 24,
  },
  rowGap: {
    justifyContent: 'space-between',
  },
  card: {
    alignItems: 'stretch',
    gap: 8,
  },
  collageWrap: {
    height: 144,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    gap: 2,
  },
  collage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  empty: {
    flex: 1,
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
});
