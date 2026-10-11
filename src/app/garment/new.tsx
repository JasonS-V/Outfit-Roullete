/**
 * Añadir prenda · elección desde la biblioteca de básicos con teñido (§11).
 * El flujo de cámara/recorte local llega en el Sprint 3.
 */

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GarmentSilhouette, patternFor } from '@/components/silhouettes';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { useApp } from '@/context/AppContext';
import { ALL_BASICS, BASIC_BY_KEY } from '@/data/catalog';
import { COLOR_PALETTE, colorNameFor } from '@/data/palette';
import type { Slot } from '@/engine';
import { useTheme } from '@/theme';

const SLOT_TABS: { key: Slot; label: string }[] = [
  { key: 'top', label: 'Arriba' },
  { key: 'bottom', label: 'Abajo' },
  { key: 'shoes', label: 'Calzado' },
  { key: 'layer', label: 'Capas' },
  { key: 'onepiece', label: 'Una pieza' },
];

export default function NewGarmentScreen() {
  const app = useApp();
  const { colors, reelTint, radii, spacing } = useTheme();
  const { showToast } = useToast();
  const [slot, setSlot] = useState<Slot>('top');
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [colorHex, setColorHex] = useState('#1A1A1A');

  const items = useMemo(() => ALL_BASICS.filter((b) => b.slot === slot), [slot]);
  const openBasic = openKey ? BASIC_BY_KEY[openKey] : null;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver al armario" onPress={() => router.back()} style={styles.backButton}>
          <AppText variant="title">‹</AppText>
        </Pressable>
        <AppText variant="title" style={styles.headerTitle}>Añadir prenda</AppText>
      </View>

      <AppText variant="body" color={colors.inkSoft} style={styles.intro}>Elige la prenda que más se parezca a la tuya y luego su color.</AppText>
      <View>
        <FlatList
          horizontal
          data={SLOT_TABS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => (
            <Chip label={item.label} selected={slot === item.key} onPress={() => setSlot(item.key)} />
          )}
        />
      </View>

      <FlatList
        data={items}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        numColumns={2}
        columnWrapperStyle={styles.rowGap}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.name}
            onPress={() => {
              setOpenKey(item.key);
              setColorHex(item.colorHex);
            }}
            style={({ pressed }) => [styles.basicCard, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={[styles.basicArt, { backgroundColor: reelTint[slot], borderRadius: radii.md }]}>
              <GarmentSilhouette
                silhouette={item.shape}
                colorHex={item.colorHex}
                hasPattern={item.hasPattern}
                size={104}
              />
            </View>
            <AppText variant="label" numberOfLines={2}>
              {item.name}
            </AppText>
          </Pressable>
        )}
      />

      <Sheet visible={openBasic !== null} onClose={() => setOpenKey(null)} title={openBasic?.name}>
        {openBasic ? (
          <View style={{ gap: spacing.four }}>
            <View style={[styles.detailArt, { backgroundColor: reelTint[slot], borderRadius: radii.card }]}>
              <GarmentSilhouette
                silhouette={openBasic.shape}
                colorHex={colorHex}
                hasPattern={openBasic.hasPattern}
                pattern={patternFor(openBasic.key)}
                size={168}
              />
            </View>
            <AppText variant="label" color={colors.inkSoft} style={{ textAlign: 'center' }}>
              {colorNameFor(colorHex)}
            </AppText>
            <View style={styles.swatches}>
              {COLOR_PALETTE.map((option) => {
                const isOn = option.hex === colorHex;
                return (
                  <Pressable
                    key={option.hex}
                    accessibilityRole="button"
                    accessibilityLabel={option.name}
                    accessibilityState={{ selected: isOn }}
                    onPress={() => setColorHex(option.hex)}
                    style={[
                      styles.swatch,
                      {
                        backgroundColor: option.hex,
                        borderColor: isOn ? colors.chicle : colors.line,
                        borderWidth: isOn ? 3 : 1,
                      },
                    ]}
                  />
                );
              })}
            </View>
            <PrimaryButton
              label="Añadir a mi armario"
              onPress={() => {
                app.addGarment(openBasic.key, colorHex);
                setOpenKey(null);
                showToast({ text: `Añadida: ${openBasic.name}` });
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
  },
  intro: {
    paddingBottom: 18,
  },
  chips: {
    gap: 8,
    paddingBottom: 18,
  },
  grid: {
    gap: 18,
    paddingBottom: 12,
  },
  rowGap: {
    justifyContent: 'space-between',
  },
  basicCard: {
    width: '48%',
    alignItems: 'stretch',
    gap: 8,
  },
  basicArt: {
    height: 144,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailArt: {
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
