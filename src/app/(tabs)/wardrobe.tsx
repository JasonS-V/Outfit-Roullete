/**
 * Pantalla 2 · Armario (§5.3): parrilla por categorías, búsqueda,
 * hoja de detalle con favoritos, lavandería y borrado con confirmación.
 */

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GarmentSilhouette, patternFor } from '@/components/silhouettes';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
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
  const { colors, radii, spacing } = useTheme();
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
          backgroundColor: colors.surface,
          borderRadius: radii.card,
          opacity: pressed ? 0.85 : garment.isLaundry ? 0.55 : 1,
        },
      ]}
    >
      <View style={styles.cardArt}>
        <GarmentSilhouette
          silhouette={garment.silhouette}
          colorHex={garment.colorHex}
          hasPattern={garment.hasPattern}
          pattern={patternFor(garment.basicKey)}
          size={72}
        />
      </View>
      <AppText variant="micro" numberOfLines={2} style={styles.cardName}>
        {garment.name}
      </AppText>
      <AppText variant="micro" color={colors.inkSoft} numberOfLines={1}>
        {garment.colorName}
      </AppText>
      {garment.isFavorite ? (
        <AppText variant="micro" style={styles.badgeStar}>
          ⭐
        </AppText>
      ) : null}
      {garment.isLaundry ? (
        <View
          style={[
            styles.laundry,
            { backgroundColor: colors.ink, borderRadius: radii.sm, left: 4, right: 4 },
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
        <AppText variant="title">Mi armario ({active.length} prendas)</AppText>
        <TextInput
          accessibilityLabel="Buscar en el armario"
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar…"
          placeholderTextColor={colors.inkSoft}
          style={[
            styles.search,
            {
              backgroundColor: colors.surface,
              borderColor: colors.line,
              borderRadius: radii.pill,
              color: colors.ink,
            },
          ]}
        />
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
          <AppText variant="subtitle" style={{ textAlign: 'center' }}>
            Tu armario está vacío
          </AppText>
          <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
            Agrega ropa con una foto o elige de los básicos.
          </AppText>
          <PrimaryButton label="＋ Añadir prenda" onPress={() => router.push('/garment/new')} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
            No hay prendas que coincidan con ese filtro.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(g) => g.id}
          numColumns={3}
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
            backgroundColor: colors.chicle,
            borderRadius: radii.pill,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <AppText variant="hero">＋</AppText>
      </Pressable>

      <Sheet visible={detail !== null} onClose={() => setDetailId(null)} title={detail?.name}>
        {detail ? (
          <View style={{ gap: spacing.four }}>
            <View style={{ alignItems: 'center' }}>
              <GarmentSilhouette
                silhouette={detail.silhouette}
                colorHex={detail.colorHex}
                hasPattern={detail.hasPattern}
                pattern={patternFor(detail.basicKey)}
                size={168}
              />
            </View>
            <AppText variant="label" color={colors.inkSoft} style={{ textAlign: 'center' }}>
              {SLOT_NAMES[detail.slot]} · {detail.colorName}
            </AppText>
            <AppText variant="micro" color={colors.inkSoft} style={{ textAlign: 'center' }}>
              Abrigo {detail.warmth}/4 · Formalidad {detail.formality}/5
              {detail.tags.length > 0 ? ` · ${detail.tags.join(', ')}` : ''}
            </AppText>
            <AppText variant="micro" color={colors.inkSoft} style={{ textAlign: 'center' }}>
              {(() => {
                const info = app.lastWornInfo(detail.id);
                if (!info) return 'Sin usos registrados todavía';
                if (info.days === 0) return 'Te la pusiste hoy';
                return `Última vez hace ${info.days} ${info.days === 1 ? 'día' : 'días'}`;
              })()}
            </AppText>
            <PrimaryButton
              label={detail.isFavorite ? '⭐ Quitar de favoritas' : '⭐ Marcar como favorita'}
              variant="ghost"
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
    paddingHorizontal: 16,
  },
  header: {
    gap: 10,
    paddingTop: 8,
    paddingBottom: 12,
  },
  search: {
    minHeight: 44,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontFamily: 'Figtree_500Medium',
    fontSize: 15,
  },
  chips: {
    gap: 8,
    paddingBottom: 12,
  },
  grid: {
    gap: 10,
    paddingBottom: 96,
  },
  rowGap: {
    gap: 10,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 2,
  },
  cardArt: {
    height: 76,
    justifyContent: 'center',
  },
  cardName: {
    textAlign: 'center',
  },
  badgeStar: {
    position: 'absolute',
    top: 6,
    left: 8,
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1B1630',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
