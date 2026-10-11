/**
 * Ruta interna de control de arte: galería de siluetas y swatches.
 * No está enlazada desde la navegación; sirve para QA visual (abrir /dev/silhouettes).
 */

import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GarmentSilhouette, patternFor } from '@/components/silhouettes';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { ALL_BASICS } from '@/data/catalog';
import type { Slot } from '@/engine';
import { useTheme } from '@/theme';

const FILTERS: { key: 'all' | Slot; label: string }[] = [
  { key: 'all', label: 'Todo' },
  { key: 'top', label: 'Arriba' },
  { key: 'bottom', label: 'Abajo' },
  { key: 'shoes', label: 'Calzado' },
  { key: 'layer', label: 'Capas' },
  { key: 'onepiece', label: 'Una pieza' },
];

export default function DevSilhouettesScreen() {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<'all' | Slot>('all');
  const items = useMemo(
    () => (filter === 'all' ? ALL_BASICS : ALL_BASICS.filter((b) => b.slot === filter)),
    [filter],
  );
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppText variant="title" style={{ paddingVertical: 8 }}>
        Galería de siluetas ({items.length})
      </AppText>
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 10 }}
        renderItem={({ item }) => (
          <Chip label={item.label} selected={filter === item.key} onPress={() => setFilter(item.key)} />
        )}
      />
      <FlatList
        data={items}
        keyExtractor={(b) => b.key}
        numColumns={4}
        columnWrapperStyle={{ gap: 8 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <GarmentSilhouette
              silhouette={item.shape}
              colorHex={item.colorHex}
              hasPattern={item.hasPattern}
              pattern={patternFor(item.key)}
              size={72}
            />
            <AppText variant="micro" numberOfLines={2} style={{ textAlign: 'center' }}>
              {item.name}
            </AppText>
          </View>
        )}
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
    paddingHorizontal: 12,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
});
