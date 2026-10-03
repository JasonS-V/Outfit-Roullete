/**
 * Onboarding de 90 segundos (§9).
 * 4 pasos en una sola ruta: bienvenida, estilo, básicos y clima.
 * El "primer giro guiado" es la propia pantalla de la ruleta.
 */

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GarmentSilhouette } from '@/components/silhouettes';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { CityPicker } from '@/components/weather';
import { useApp } from '@/context/AppContext';
import type { Audience } from '@/data/catalog';
import { BASIC_BY_KEY } from '@/data/catalog';
import { STARTER_RECOMMENDED_COUNT, starterRows, starterSetFor } from '@/data/starter';
import { useTheme } from '@/theme';

const AUDIENCE_OPTIONS: { key: Audience; label: string; note: string }[] = [
  { key: 'fem', label: 'Ropa femenina', note: 'Vestidos, faldas y básicos femeninos primero' },
  { key: 'masc', label: 'Ropa masculina', note: 'Los básicos de siempre primero' },
  { key: 'uni', label: 'Ambas / Neutro', note: 'Una biblioteca sin etiquetas' },
];

export default function OnboardingScreen() {
  const app = useApp();
  const { colors, radii, spacing } = useTheme();
  const [step, setStep] = useState(0);
  const [audience, setLocalAudience] = useState<Audience>('uni');
  const [selected, setSelected] = useState<Set<string>>(() => new Set(starterSetFor('uni').checked));
  const [showCityPicker, setShowCityPicker] = useState(false);

  const rows = useMemo(() => starterRows(audience), [audience]);

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const chosenCount = useMemo(
    () =>
      rows.reduce(
        (acc, row) => acc + row.items.filter((item) => selected.has(item.key)).length,
        0,
      ),
    [rows, selected],
  );

  const readyToSpin = rows.every((row) => row.items.some((item) => selected.has(item.key)));

  const pickAudience = (value: Audience) => {
    setLocalAudience(value);
    setSelected(new Set(starterSetFor(value).checked));
    setStep(2);
  };

  const finish = () => {
    const keys = rows.flatMap((row) => row.items.filter((i) => selected.has(i.key)).map((i) => i.key));
    app.completeOnboarding(audience, keys);
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <AppText variant="micro" color={colors.inkSoft}>
          {step === 0 ? 'OUTFIT ROULETTE' : `Paso ${step}/3`}
        </AppText>
      </View>

      {step === 0 ? (
        <View style={styles.hero}>
          <View style={styles.miniReels}>
            {(['top', 'bottom', 'shoes'] as const).map((slot, index) => {
              const key = ['polo_basico', 'jean_claro', 'zapas_blancas'][index];
              const basic = BASIC_BY_KEY[key];
              return (
                <View
                  key={slot}
                  style={[styles.miniReel, { backgroundColor: colors.surface, borderRadius: radii.card }]}
                >
                  <GarmentSilhouette
                    silhouette={basic.shape}
                    colorHex={basic.colorHex}
                    size={64}
                  />
                  <AppText variant="label" numberOfLines={1} style={{ flex: 1 }}>
                    {basic.name}
                  </AppText>
                </View>
              );
            })}
          </View>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <AppText variant="display" style={{ textAlign: 'center' }}>
              Outfit Roulette
            </AppText>
            <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
              Tu armario, en modo juego. Gira la ruleta y sale tu look del día en menos de 5 segundos.
            </AppText>
          </View>
          <PrimaryButton label="Empezar" onPress={() => setStep(1)} />
        </View>
      ) : null}

      {step === 1 ? (
        <View style={styles.body}>
          <AppText variant="title">¿Qué tipo de prendas prefieres ver primero?</AppText>
          <View style={{ gap: spacing.three, marginTop: spacing.four }}>
            {AUDIENCE_OPTIONS.map((option) => (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                onPress={() => pickAudience(option.key)}
                style={({ pressed }) => [
                  styles.option,
                  {
                    borderColor: colors.line,
                    borderRadius: radii.card,
                    backgroundColor: pressed ? colors.surface : colors.bg,
                  },
                ]}
              >
                <AppText variant="subtitle">{option.label}</AppText>
                <AppText variant="micro" color={colors.inkSoft}>
                  {option.note}
                </AppText>
              </Pressable>
            ))}
          </View>
          <AppText variant="micro" color={colors.inkSoft} style={{ marginTop: 'auto', textAlign: 'center' }}>
            Solo sirve para ordenar la biblioteca de básicos. Puedes cambiarlo luego.
          </AppText>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.body}>
          <AppText variant="title">Arma tu armario inicial</AppText>
          <AppText variant="body" color={colors.inkSoft}>
            Toca las prendas que tienes en tu ropero. Llevas {chosenCount} de {STARTER_RECOMMENDED_COUNT} recomendadas.
          </AppText>
          <ScrollView contentContainerStyle={{ gap: spacing.five, paddingVertical: spacing.four }}>
            {rows.map((row) => (
              <View key={row.label} style={{ gap: spacing.two }}>
                <AppText variant="label" color={colors.inkSoft}>
                  {row.label.toUpperCase()}
                </AppText>
                <View style={styles.grid}>
                  {row.items.map((item) => {
                    const isOn = selected.has(item.key);
                    return (
                      <Pressable
                        key={item.key}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isOn }}
                        onPress={() => toggle(item.key)}
                        style={({ pressed }) => [
                          styles.item,
                          {
                            borderColor: isOn ? colors.chicle : colors.line,
                            borderWidth: isOn ? 2 : 1,
                            backgroundColor: colors.surface,
                            borderRadius: radii.md,
                            opacity: pressed ? 0.85 : 1,
                          },
                        ]}
                      >
                        <GarmentSilhouette
                          silhouette={item.shape}
                          colorHex={item.colorHex}
                          hasPattern={item.hasPattern}
                          size={72}
                        />
                        <AppText variant="micro" numberOfLines={2} style={{ textAlign: 'center' }}>
                          {item.name}
                        </AppText>
                        <View
                          style={[
                            styles.check,
                            {
                              backgroundColor: isOn ? colors.chicle : colors.bg,
                              borderColor: isOn ? colors.chicle : colors.line,
                            },
                          ]}
                        >
                          {isOn ? (
                            <AppText variant="micro" color={colors.onChicle}>
                              ✓
                            </AppText>
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
          <PrimaryButton
            label={`¡Listo, a girar! (${chosenCount})`}
            onPress={() => setStep(3)}
            disabled={!readyToSpin}
            accessibilityHint="Necesitas al menos una prenda por categoría"
          />
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.body}>
          <AppText variant="title">¿Adaptamos tus outfits al clima de hoy?</AppText>
          <AppText variant="body" color={colors.inkSoft}>
            Con el clima activo, la ruleta enciende sola tu capa de abrigo cuando haga frío.
          </AppText>
          {app.weather.status === 'error' && app.weather.error ? (
            <AppText variant="label" color={colors.danger}>
              {app.weather.error}
            </AppText>
          ) : null}
          {app.weather.status === 'ready' && app.weather.data ? (
            <AppText variant="subtitle">
              {app.weather.data.city}: {Math.round(app.weather.data.apparentC)}°C
            </AppText>
          ) : null}
          {showCityPicker ? <CityPicker onPick={(city) => { void app.setCity(city); finish(); }} /> : null}
          <View style={{ gap: spacing.three, marginTop: 'auto' }}>
            <PrimaryButton
              label={app.weather.status === 'loading' ? 'Leyendo clima…' : 'Usar mi ubicación'}
              onPress={async () => {
                await app.refreshWeather();
              }}
              disabled={app.weather.status === 'loading'}
            />
            <PrimaryButton label="Elegir mi ciudad" variant="ghost" onPress={() => setShowCityPicker(true)} />
            <PrimaryButton label="Ahora no" variant="ghost" onPress={finish} />
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topBar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: 28,
  },
  miniReels: {
    gap: 8,
  },
  miniReel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    height: 72,
  },
  body: {
    flex: 1,
    gap: 8,
    paddingTop: 8,
    paddingBottom: 16,
  },
  option: {
    minHeight: 64,
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 16,
    gap: 2,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
