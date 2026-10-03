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
  const { colors, radii, spacing } = useTheme();
  const { showToast } = useToast();
  const [slot, setSlot] = useState<Slot>('top');
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [colorHex, setColorHex] = useState('#1A1A1A');

  const items = useMemo(() => ALL_BASICS.filter((b) => b.slot === slot), [slot]);
  const openBasic = openKey ? BASIC_BY_KEY[openKey] : null;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} hitSlop={8}>
          <AppText variant="title">‹</AppText>
        </Pressable>
        <AppText variant="title">Añadir prenda</AppText>
        <View style={{ width: 24 }} />
      </View>

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
        keyExtractor={(item) => item.key}
        numColumns={4}
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
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              gap: 4,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <GarmentSilhouette
              silhouette={item.shape}
              colorHex={item.colorHex}
              hasPattern={item.hasPattern}
              size={60}
            />
            <AppText variant="micro" numberOfLines={2} style={{ textAlign: 'center' }}>
              {item.name}
            </AppText>
          </Pressable>
        )}
      />

      <AppText variant="micro" color={colors.inkSoft} style={{ textAlign: 'center', paddingVertical: 8 }}>
        Subir fotos de tu ropa real llegará en una próxima actualización.
      </AppText>

      <Sheet visible={openBasic !== null} onClose={() => setOpenKey(null)} title={openBasic?.name}>
        {openBasic ? (
          <View style={{ gap: spacing.four }}>
            <View style={{ alignItems: 'center' }}>
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
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  chips: {
    gap: 8,
    paddingBottom: 12,
  },
  grid: {
    gap: 14,
    paddingBottom: 12,
  },
  rowGap: {
    gap: 8,
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
