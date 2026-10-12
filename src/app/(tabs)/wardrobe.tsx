/**
 * Pantalla 2 · Armario (§5.3): parrilla por categorías, búsqueda,
 * hoja de detalle con favoritos, lavandería y borrado con confirmación.
 */

import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
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
} from '@/components/ui/icons';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { useApp } from '@/context/AppContext';
import type { Garment, Slot } from '@/engine';
import { translate, useLanguage } from '@/localization';
import { fontFamily, useTheme } from '@/theme';
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
  const language = useLanguage();
  const { colors, reelTint, radii, spacing } = useTheme();
  const { showToast } = useToast();
  const [category, setCategory] = useState<SlotFilter>('all');
  const [query, setQuery] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const addScale = useSharedValue(1);
  const filterProgress = useSharedValue(1);
  const addStyle = useAnimatedStyle(() => ({ transform: [{ scale: addScale.value }] }));
  const filterStyle = useAnimatedStyle(() => ({
    opacity: filterProgress.value,
    transform: [{ translateY: (1 - filterProgress.value) * 12 }],
  }));

  useEffect(() => {
    if (reducedMotion) return;
    filterProgress.set(0.55);
    filterProgress.set(withTiming(1, { duration: 180 }));
  }, [category, query, filterProgress, reducedMotion]);

  const active = useMemo(() => app.garments.filter((g) => !g.isArchived), [app.garments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return active
      .filter((g) => (category === 'all' ? true : g.slot === category))
      .filter((g) => (q.length === 0 ? true : `${g.name} ${g.colorName} ${translate(g.name, language)} ${translate(g.colorName, language)}`.toLowerCase().includes(q)))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [active, category, query, language]);

  const detail = detailId ? active.find((g) => g.id === detailId) ?? null : null;

  const renderCard = (garment: Garment) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${translate(garment.name, language)}, ${translate(garment.colorName, language)}`}
      onPress={() => setDetailId(garment.id)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surfaceRaised,
          borderColor: colors.line,
          borderRadius: radii.card,
          opacity: pressed ? 0.85 : garment.isLaundry ? 0.55 : 1,
        },
      ]}
    >
      <View style={[styles.cardArt, { backgroundColor: reelTint[garment.slot], borderRadius: radii.md }]}>
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
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <AppText variant="title">Tu armario</AppText>
            <AppText variant="label" color={colors.inkSoft}>
              {active.length} {active.length === 1 ? 'prenda' : 'prendas'} para combinar
            </AppText>
          </View>
          <Animated.View style={addStyle}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={translate('Añadir prenda', language)}
              onPressIn={() => { if (!reducedMotion) addScale.set(withSpring(0.88)); }}
              onPressOut={() => { addScale.set(withSpring(1)); }}
              onPress={() => router.push('/garment/new')}
              style={({ pressed }) => [styles.addButton, { backgroundColor: colors.chicle, borderRadius: radii.md, opacity: pressed ? 0.8 : 1 }]}
            >
              <PlusIcon color={colors.onChicle} size={25} />
            </Pressable>
          </Animated.View>
        </View>
        <View
          style={[
            styles.searchWrap,
            { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radii.md },
          ]}
        >
          <SearchIcon color={colors.inkSoft} size={18} />
          <TextInput
            accessibilityLabel={translate('Buscar en el armario', language)}
            value={query}
            onChangeText={setQuery}
            placeholder={translate('Buscar por prenda o color', language)}
            placeholderTextColor={colors.inkSoft}
            style={[styles.search, { color: colors.ink }]}
          />
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

      <Animated.View style={[styles.results, filterStyle]}>
      {active.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyArt, { borderColor: colors.line, backgroundColor: colors.surface }]}>
            <HangerIcon color={colors.inkSoft} size={44} strokeWidth={1.6} />
          </View>
          <AppText variant="subtitle" style={{ textAlign: 'center' }}>
            Tu armario está vacío
          </AppText>
          <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
            Elige prendas de la biblioteca para empezar a combinar.
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
          <PrimaryButton
            label="Limpiar filtros"
            variant="ghost"
            onPress={() => { setCategory('all'); setQuery(''); }}
          />
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
      </Animated.View>

      <Sheet visible={detail !== null} onClose={() => setDetailId(null)} title={detail?.name}>
        {detail ? (
          <View style={{ gap: spacing.four }}>
            <View style={[styles.detailArt, { backgroundColor: reelTint[detail.slot], borderRadius: radii.card }]}>
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
                  'Eliminar',
                  language,
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
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  header: {
    gap: 18,
    paddingTop: 18,
    paddingBottom: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleCopy: {
    flex: 1,
    gap: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontFamily: fontFamily.medium,
    fontSize: 15,
  },
  chips: {
    gap: 8,
    paddingBottom: 18,
  },
  grid: {
    gap: 20,
    paddingBottom: 24,
  },
  results: {
    flex: 1,
  },
  rowGap: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    alignItems: 'flex-start',
    gap: 3,
    padding: 8,
    borderWidth: 1,
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
});
