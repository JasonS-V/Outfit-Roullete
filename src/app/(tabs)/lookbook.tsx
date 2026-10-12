/**
 * Pantalla 3 · Looks (§12): colección guardada, filtro "Para hoy",
 * detalle con cargar-en-ruleta, registrar uso, compartir y eliminar.
 */

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GarmentSilhouette, patternFor } from '@/components/silhouettes';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { CheckIcon, ShareIcon, SlotMachineIcon, StarIcon } from '@/components/ui/icons';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Sheet } from '@/components/ui/Sheet';
import { SaveLookModal } from '@/components/looks/SaveLookModal';
import { useToast } from '@/components/ui/Toast';
import { useApp } from '@/context/AppContext';
import { translate, useLanguage } from '@/localization';
import { OCCASION_LABELS, type Garment, type SavedLook } from '@/engine';
import { useTheme } from '@/theme';
import { confirmDestructive } from '@/utils/confirm';
import { shareOutfit } from '@/utils/share';

function formatDate(ms: number, language: 'es' | 'en'): string {
  try {
    return new Date(ms).toLocaleDateString(language === 'en' ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

function tempDiff(a: number, b: number): number {
  return Math.abs(a - b);
}

export default function LookbookScreen() {
  const app = useApp();
  const language = useLanguage();
  const { colors, radii, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const { showToast } = useToast();
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [onlyToday, setOnlyToday] = useState(false);

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

  const lookCard = (look: SavedLook) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={look.name?.trim() || (language === 'en' ? `${translate(OCCASION_LABELS[look.occasion], language)} outfit from ${formatDate(look.createdAt, language)}` : `Look de ${OCCASION_LABELS[look.occasion]} del ${formatDate(look.createdAt, language)}`)}
      onPress={() => setOpenId(look.id)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surfaceRaised,
          borderColor: colors.line,
          borderRadius: radii.card,
          opacity: pressed ? 0.85 : 1,
          width: '48%',
        },
      ]}
    >
      <View style={[styles.collageWrap, { backgroundColor: colors.reelTop, borderRadius: radii.md }]}>
        {renderCollage(look, width >= 600 ? 64 : 34)}
      </View>
      <View style={styles.cardFooter}>
        <AppText variant="label" numberOfLines={1}>
          {look.name?.trim() || OCCASION_LABELS[look.occasion]}
        </AppText>
        <AppText variant="micro" color={colors.inkSoft} numberOfLines={1}>
          {language === 'en' ? 'Saved on' : 'Guardado el'} {formatDate(look.createdAt, language)}
        </AppText>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <AppText variant="title">Looks guardados</AppText>
          <AppText variant="label" color={colors.inkSoft}>{looks.length} {looks.length === 1 ? 'combinación' : 'combinaciones'} que te gustaron</AppText>
        </View>
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
            Crea un look en Hoy y toca Guardar para tenerlo siempre a mano.
          </AppText>
          <PrimaryButton
            label="Girar ahora"
            onPress={() => router.navigate({ pathname: '/', params: { scrollToActions: String(Date.now()) } })}
            leading={<SlotMachineIcon color={colors.onChicle} size={22} />}
          />
        </View>
      ) : (
        <FlatList
          data={onlyToday && app.weather.status === 'ready' ? todayLooks : looks}
          keyExtractor={(l) => l.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.rowGap}
          contentContainerStyle={styles.grid}
          ListHeaderComponent={app.weather.status === 'ready' ? (
            <View style={styles.filters}>
              <Chip label="Todos" selected={!onlyToday} onPress={() => setOnlyToday(false)} />
              <Chip label={`Para hoy · ${todayLooks.length}`} selected={onlyToday} onPress={() => setOnlyToday(true)} />
            </View>
          ) : null}
          ListEmptyComponent={
            <View style={styles.emptyFilter}>
              <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
                Ningún look guardado coincide con el clima de hoy.
              </AppText>
              <PrimaryButton label="Ver todos" variant="ghost" onPress={() => setOnlyToday(false)} />
            </View>
          }
          renderItem={({ item }) => lookCard(item)}
        />
      )}

      <Sheet
        visible={openLook !== null}
        onClose={() => {
          setOpenId(null);
          setEditingName(false);
        }}
        title={openLook?.name?.trim() || (language === 'en' ? 'Saved outfit' : 'Look guardado')}
      >
        {openLook ? (
          <View style={{ gap: spacing.four }}>
            <View style={{ alignItems: 'center' }}>{renderCollage(openLook, 64)}</View>
            <View style={{ gap: 2, alignItems: 'center' }}>
              {openLook.name ? (
                <AppText variant="subtitle" style={{ textAlign: 'center' }}>
                  {openLook.name}
                </AppText>
              ) : null}
              <AppText variant="label" color={colors.inkSoft} style={{ textAlign: 'center' }}>
                {OCCASION_LABELS[openLook.occasion]}
                {openLook.temperatureAtSave !== null
                  ? ` · guardado con ${Math.round(openLook.temperatureAtSave)}°C`
                  : ''}
              </AppText>
            </View>
            <PrimaryButton
              label={openLook.name ? (language === 'en' ? 'Change name' : 'Cambiar nombre') : (language === 'en' ? 'Name outfit' : 'Poner nombre al look')}
              variant="ghost"
              onPress={() => setEditingName(true)}
            />
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
                const outcome = await shareOutfit(itemsOf(openLook), language);
                if (outcome === 'copied') showToast({ text: 'Look copiado, pégalo donde quieras' });
                if (outcome === 'failed') showToast({ text: 'No se pudo compartir en este dispositivo' });
              }}
            />
            <PrimaryButton
              label="Eliminar look"
              variant="danger"
              onPress={async () => {
                const ok = await confirmDestructive('Eliminar look', 'Se quitará del Lookbook para siempre.', 'Eliminar', language);
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
      <SaveLookModal
        visible={editingName && openLook !== null}
        initialName={openLook?.name ?? ''}
        isEditing
        onClose={() => setEditingName(false)}
        onSave={(newName) => {
          if (openLook) {
            app.updateLookName(openLook.id, newName);
            showToast({ text: language === 'en' ? 'Name updated' : 'Nombre actualizado' });
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  titleRow: {
    paddingTop: 18,
    paddingBottom: 18,
  },
  titleCopy: {
    gap: 4,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  emptyFilter: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 48,
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
    padding: 8,
    borderWidth: 1,
  },
  collageWrap: {
    height: 132,
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
