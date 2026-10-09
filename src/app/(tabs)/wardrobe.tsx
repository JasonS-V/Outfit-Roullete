/**
 * Pantalla 2 · Armario (§5.3): parrilla por categorías, búsqueda,
 * hoja de detalle con favoritos, lavandería y borrado con confirmación.
 */

import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GarmentSilhouette, patternFor } from '@/components/silhouettes';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import {
  HangerIcon,
  HeartFilledIcon,
  HeartIcon,
  PlusIcon,
  SearchIcon,
  SlidersIcon,
} from '@/components/ui/icons';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { useApp } from '@/context/AppContext';
import type { Garment, Slot } from '@/engine';
import { useTheme } from '@/theme';
import { confirmDestructive } from '@/utils/confirm';

type SlotFilter = 'all' | Slot;

const CATEGORIES: { key: SlotFilter; label: string }[] = [
  { key: 'all', label: 'Todo' },
  { key: 'top', label: 'Arriba' },
  { key: 'bottom', label: 'Abajo' },
  { key: 'shoes', label: 'Calzado' },
  { key: 'layer', label: 'Capas' },
  { key: 'onepiece', label: 'Una pieza' },
];

const SLOT_NAMES: Record<Slot, string> = {
  top: 'Parte superior',
  bottom: 'Parte inferior',
  shoes: 'Calzado',
  layer: 'Capa',
  onepiece: 'Una pieza',
};

export default function WardrobeScreen() {
  const app = useApp();
  const { colors, actionGradient, radii, spacing } = useTheme();
  const { showToast } = useToast();
  const [category, setCategory] = useState<SlotFilter>('all');
  const [query, setQuery] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);

  const active = useMemo(() => app.garments.filter((g) => !g.isArchived), [app.garments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return active
      .filter((g) => (category === 'all' ? true : g.slot === category))
      .filter((g) => (q.length === 0 ? true : `${g.name} ${g.colorName}`.toLowerCase().includes(q)))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [active, category, query]);

  const detail = detailId ? active.find((g) => g.id === detailId) ?? null : null;

  const renderCard = (garment: Garment) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${garment.name}, ${garment.colorName}`}
      onPress={() => setDetailId(garment.id)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.bg,
          borderRadius: radii.card,
          opacity: pressed ? 0.85 : garment.isLaundry ? 0.55 : 1,
        },
      ]}
    >
      <View style={[styles.cardArt, { backgroundColor: colors.reelTop, borderRadius: radii.md }]}>
        <GarmentSilhouette
          silhouette={garment.silhouette}
          colorHex={garment.colorHex}
          hasPattern={garment.hasPattern}
          pattern={patternFor(garment.basicKey)}
          size={112}
        />
      </View>
      <AppText variant="label" numberOfLines={2} style={styles.cardName}>
        {garment.name}
      </AppText>
      <AppText variant="micro" color={colors.inkSoft} numberOfLines={1}>
        {garment.colorName}
      </AppText>
      {garment.isFavorite ? (
        <View style={styles.badgeStar}>
          <HeartFilledIcon color={colors.chicle} size={15} />
        </View>
      ) : null}
      {garment.isLaundry ? (
        <View
          style={[
            styles.laundry,
            { backgroundColor: colors.ink, borderRadius: radii.sm, left: 6, right: 6 },
          ]}
        >
          <AppText variant="micro" color={colors.bg} style={{ fontSize: 10, textAlign: 'center' }}>
            En lavandería
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.header}>
        <AppText variant="micro" color={colors.inkSoft} style={styles.eyebrow}>TU COLECCIÓN  /  02</AppText>
        <View style={styles.titleRow}>
          <AppText variant="title">Mi armario.</AppText>
          <View
            style={[styles.countBadge, { backgroundColor: colors.surface, borderColor: colors.cardEdge }]}
          >
            <AppText variant="micro" color={colors.inkSoft}>
              {active.length} {active.length === 1 ? 'prenda' : 'prendas'}
            </AppText>
          </View>
        </View>
        <View
          style={[
            styles.searchWrap,
            { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radii.md },
          ]}
        >
          <SearchIcon color={colors.inkSoft} size={18} />
          <TextInput
            accessibilityLabel="Buscar en el armario"
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por prenda o color"
            placeholderTextColor={colors.inkSoft}
            style={[styles.search, { color: colors.ink }]}
          />
          <SlidersIcon color={colors.inkSoft} size={18} />
        </View>
      </View>

      <View>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => (
            <Chip label={item.label} selected={category === item.key} onPress={() => setCategory(item.key)} />
          )}
        />
      </View>

      {active.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyArt, { borderColor: colors.line, backgroundColor: colors.surface }]}>
            <HangerIcon color={colors.inkSoft} size={44} strokeWidth={1.6} />
          </View>
          <AppText variant="subtitle" style={{ textAlign: 'center' }}>
            Tu armario está vacío
          </AppText>
          <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
            Agrega ropa con una foto o elige de los básicos.
          </AppText>
          <PrimaryButton
            label="Añadir prenda"
            leading={<PlusIcon size={18} color={colors.onChicle} />}
            onPress={() => router.push('/garment/new')}
          />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyArt, { borderColor: colors.line, backgroundColor: colors.surface }]}>
            <SearchIcon color={colors.inkSoft} size={38} strokeWidth={1.7} />
          </View>
          <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
            No hay prendas que coincidan con ese filtro.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(g) => g.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.rowGap}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => renderCard(item)}
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Añadir prenda"
        onPress={() => router.push('/garment/new')}
        style={({ pressed }) => [
          styles.fab,
          {
            borderRadius: radii.pill,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={actionGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.fabIcon}>
          <PlusIcon color={colors.onChicle} size={26} />
        </View>
      </Pressable>

      <Sheet visible={detail !== null} onClose={() => setDetailId(null)} title={detail?.name}>
        {detail ? (
          <View style={{ gap: spacing.four }}>
            <View style={[styles.detailArt, { backgroundColor: colors.reelTop, borderRadius: radii.card }]}>
              <GarmentSilhouette
                silhouette={detail.silhouette}
                colorHex={detail.colorHex}
                hasPattern={detail.hasPattern}
                pattern={patternFor(detail.basicKey)}
                size={168}
              />
            </View>
            <AppText variant="label" color={colors.inkSoft}>
              {SLOT_NAMES[detail.slot]} · {detail.colorName}
            </AppText>
            <AppText variant="micro" color={colors.inkSoft}>
              Abrigo {detail.warmth}/4 · Formalidad {detail.formality}/5
              {detail.tags.length > 0 ? ` · ${detail.tags.join(', ')}` : ''}
            </AppText>
            <AppText variant="micro" color={colors.inkSoft}>
              {(() => {
                const info = app.lastWornInfo(detail.id);
                if (!info) return 'Sin usos registrados todavía';
                if (info.days === 0) return 'Te la pusiste hoy';
                return `Última vez hace ${info.days} ${info.days === 1 ? 'día' : 'días'}`;
              })()}
            </AppText>
            <PrimaryButton
              label={detail.isFavorite ? 'Quitar de favoritas' : 'Marcar como favorita'}
              variant="ghost"
              leading={
                detail.isFavorite ? (
                  <HeartFilledIcon size={18} color={colors.chicle} />
                ) : (
                  <HeartIcon size={18} color={colors.ink} />
                )
              }
              onPress={() => app.toggleFavoriteGarment(detail.id)}
            />
            <PrimaryButton
              label={detail.isLaundry ? 'Sacar de lavandería' : 'No usar hoy (a lavandería)'}
              variant="ghost"
              onPress={() => app.toggleLaundry(detail.id)}
            />
            <PrimaryButton
              label="Eliminar del armario"
              variant="danger"
              onPress={async () => {
                const ok = await confirmDestructive(
                  'Eliminar prenda',
                  `Se quitará "${detail.name}" de tu armario. Los looks guardados que la usen se conservan sin ella.`,
                );
                if (ok) {
                  app.removeGarment(detail.id);
                  setDetailId(null);
                  showToast({ text: 'Prenda eliminada de tu armario' });
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
  header: {
    gap: 12,
    paddingTop: 12,
    paddingBottom: 14,
  },
  eyebrow: {
    letterSpacing: 1.3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 46,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  search: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: 'Figtree_500Medium',
    fontSize: 15,
  },
  chips: {
    gap: 8,
    paddingBottom: 18,
  },
  grid: {
    gap: 20,
    paddingBottom: 96,
  },
  rowGap: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    alignItems: 'flex-start',
    gap: 3,
  },
  cardArt: {
    width: '100%',
    height: 154,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  detailArt: {
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: {
    paddingHorizontal: 2,
  },
  badgeStar: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  laundry: {
    position: 'absolute',
    bottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#24182F',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
  },
  fabIcon: {
    zIndex: 1,
  },
});
