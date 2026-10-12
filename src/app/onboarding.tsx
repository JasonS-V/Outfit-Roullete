/**
 * Onboarding guiado (§9).
 * Bienvenida y 4 pasos en una sola ruta: personalización, estilo, básicos y clima.
 * El "primer giro guiado" es la propia pantalla de la ruleta.
 */

import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GarmentSilhouette } from '@/components/silhouettes';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import {
  CheckIcon,
  ChevronRightIcon,
  CloudSunIcon,
  SnowIcon,
  SunIcon,
} from '@/components/ui/icons';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { CityPicker } from '@/components/weather';
import { useApp } from '@/context/AppContext';
import { translate, useLanguage } from '@/localization';
import type { Audience } from '@/data/catalog';
import { STARTER_RECOMMENDED_COUNT, starterRows, starterSetFor } from '@/data/starter';
import { themeColorOptions, useTheme, type ThemeMode } from '@/theme';

const AUDIENCE_OPTIONS: { key: Audience; label: string; note: string }[] = [
  { key: 'fem', label: 'Ropa femenina', note: 'Vestidos, faldas y básicos femeninos primero' },
  { key: 'masc', label: 'Ropa masculina', note: 'Los básicos de siempre primero' },
  { key: 'uni', label: 'Ambas / Neutro', note: 'Una biblioteca sin etiquetas' },
];
const MODE_OPTIONS: { key: ThemeMode; label: string }[] = [
  { key: 'system', label: 'Sistema' },
  { key: 'light', label: 'Claro' },
  { key: 'dark', label: 'Oscuro' },
];

export default function OnboardingScreen() {
  const app = useApp();
  const language = useLanguage();
  const { colors, radii, spacing, reelGradient } = useTheme();
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
    setStep(3);
  };

  const finish = () => {
    const keys = rows.flatMap((row) => row.items.filter((i) => selected.has(i.key)).map((i) => i.key));
    app.completeOnboarding(audience, keys);
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        {step > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={app.settings.language === 'en' ? 'Back to previous step' : 'Volver al paso anterior'}
            onPress={() => setStep(step - 1)}
            style={styles.backButton}
          >
            <AppText variant="title">‹</AppText>
          </Pressable>
        ) : null}
        <AppText variant="micro" color={colors.ink} style={styles.brand}>
          {step === 0 ? 'OUTFIT ROULETTE' : app.settings.language === 'en' ? `STEP ${step} OF 4` : `PASO ${step} DE 4`}
        </AppText>
      </View>

      {step === 0 ? (
        <ScrollView contentContainerStyle={styles.hero} showsVerticalScrollIndicator={false}>
          <View style={[styles.heroImage, { borderRadius: radii.card, backgroundColor: colors.surface }]}>
            <Image
              source={require('../../assets/images/editorial-blazer.jpg')}
              resizeMode="cover"
              style={styles.image}
              accessibilityLabel={translate('Blazer lavanda en un estudio editorial', language)}
            />
            <View style={[styles.imageTag, { backgroundColor: colors.bg }]}>
              <AppText variant="micro" style={styles.imageTagText}>EL EDITORIAL  /  01</AppText>
            </View>
          </View>
          <View style={styles.heroCopy}>
            <AppText variant="micro" color={colors.inkSoft} style={styles.eyebrow}>
              TU ARMARIO, REINVENTADO
            </AppText>
            <AppText variant="display">
              Tu ropa.{ '\n' }Más posibilidades.
            </AppText>
            <AppText variant="body" color={colors.inkSoft}>
              Looks para cada día, creados con la ropa que ya tienes.
            </AppText>
            <AppText variant="body" color={colors.inkSoft}>
              Personaliza el tema, el color y el idioma antes de empezar.
            </AppText>
          </View>
          <PrimaryButton
            label="Empezar"
            onPress={() => setStep(1)}
          />
        </ScrollView>
      ) : null}

      {step === 1 ? (
        <ScrollView contentContainerStyle={styles.bodyScroll} showsVerticalScrollIndicator={false}>
          <AppText variant="title">Hazla tuya</AppText>
          <AppText variant="body" color={colors.inkSoft}>
            Elige cómo quieres ver la app. Puedes cambiarlo después en Ajustes.
          </AppText>
          <View style={{ gap: spacing.three, marginTop: spacing.four }}>
            <AppText variant="subtitle">Idioma</AppText>
            <View style={styles.choiceRow}>
              <Chip label="Español" selected={app.settings.language === 'es'} onPress={() => app.updateSettings({ language: 'es' })} />
              <Chip label="English" selected={app.settings.language === 'en'} onPress={() => app.updateSettings({ language: 'en' })} />
            </View>
            <AppText variant="subtitle">Tema</AppText>
            <View style={styles.choiceRow}>
              {MODE_OPTIONS.map((option) => (
                <Chip key={option.key} label={option.label} selected={app.settings.themeMode === option.key} onPress={() => app.updateSettings({ themeMode: option.key })} />
              ))}
            </View>
            <AppText variant="subtitle">Color</AppText>
            <View style={styles.choiceRow}>
              {themeColorOptions.map((option) => (
                <Chip
                  key={option.key}
                  label={option.label}
                  selected={app.settings.themeColor === option.key}
                  onPress={() => app.updateSettings({ themeColor: option.key })}
                  icon={<View style={[styles.colorDot, { backgroundColor: option.swatch }]} />}
                />
              ))}
            </View>
          </View>
          <View style={{ marginTop: 'auto', paddingTop: spacing.four }}>
            <PrimaryButton label="Continuar" onPress={() => setStep(2)} />
          </View>
        </ScrollView>
      ) : null}

      {step === 2 ? (
        <View style={styles.body}>
          <AppText variant="title">¿Qué tipo de prendas prefieres ver primero?</AppText>
          <View style={{ gap: spacing.three, marginTop: spacing.four }}>
            {AUDIENCE_OPTIONS.map((option) => (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityLabel={`${translate(option.label, language)}. ${translate(option.note, language)}`}
                onPress={() => pickAudience(option.key)}
                style={({ pressed }) => [
                  styles.option,
                  {
                    borderColor: colors.cardEdge,
                    borderRadius: radii.card,
                    backgroundColor: pressed ? colors.surfaceRaised : colors.surface,
                  },
                ]}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="subtitle">{option.label}</AppText>
                  <AppText variant="micro" color={colors.inkSoft}>
                    {option.note}
                  </AppText>
                </View>
                <ChevronRightIcon color={colors.inkSoft} size={20} />
              </Pressable>
            ))}
          </View>
          <AppText variant="micro" color={colors.inkSoft} style={{ marginTop: 'auto', textAlign: 'center' }}>
            Solo sirve para ordenar la biblioteca de básicos. Puedes cambiarlo luego.
          </AppText>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.body}>
          <AppText variant="title">Arma tu armario inicial</AppText>
          <AppText variant="body" color={colors.inkSoft}>
            Toca las prendas que se parecen a las tuyas. Llevas {chosenCount} de {STARTER_RECOMMENDED_COUNT} recomendadas.
          </AppText>
          <ScrollView contentContainerStyle={{ gap: spacing.five, paddingVertical: spacing.four }} showsVerticalScrollIndicator={false}>
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
                            borderColor: isOn ? colors.chicle : colors.cardEdge,
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
                            <CheckIcon size={12} color={colors.onChicle} strokeWidth={2.8} />
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
            onPress={() => setStep(4)}
            disabled={!readyToSpin}
            accessibilityHint="Necesitas al menos una prenda por categoría"
          />
        </View>
      ) : null}

      {step === 4 ? (
        <ScrollView contentContainerStyle={styles.bodyScroll} showsVerticalScrollIndicator={false}>
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
          <View style={styles.weatherArtWrap}>
            <View
              style={[
                styles.weatherArt,
                { backgroundColor: colors.surface, borderColor: colors.cardEdge },
              ]}
            >
              <LinearGradient
                colors={reelGradient.shoes}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <SunIcon color={colors.ink} size={46} strokeWidth={1.7} />
              <CloudSunIcon color={colors.ink} size={40} strokeWidth={1.6} />
              <SnowIcon color={colors.ink} size={34} strokeWidth={1.6} />
            </View>
            <AppText variant="micro" color={colors.inkSoft} style={{ textAlign: 'center' }}>
              Con clima activo, tus giros cambian solos con la temperatura.
            </AppText>
          </View>
          <View style={{ gap: spacing.three, marginTop: 'auto' }}>
            <PrimaryButton
              label={app.weather.status === 'loading' ? 'Leyendo clima…' : 'Usar mi ubicación'}
              onPress={async () => {
                await app.refreshWeather();
              }}
              disabled={app.weather.status === 'loading'}
            />
            <PrimaryButton label="Elegir mi ciudad" variant="ghost" onPress={() => setShowCityPicker(true)} />
            <PrimaryButton label={app.weather.status === 'ready' ? 'Continuar con este clima' : 'Ahora no'} variant="ghost" onPress={finish} />
          </View>
        </ScrollView>
      ) : null}
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
  topBar: {
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
  brand: {
    letterSpacing: 2,
  },
  hero: {
    flexGrow: 1,
    gap: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  heroImage: {
    flex: 1,
    minHeight: 210,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageTag: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  imageTagText: {
    letterSpacing: 1.1,
  },
  heroCopy: {
    gap: 8,
  },
  eyebrow: {
    letterSpacing: 1.6,
  },
  body: {
    flex: 1,
    gap: 8,
    paddingTop: 8,
    paddingBottom: 16,
  },
  bodyScroll: {
    flexGrow: 1,
    gap: 8,
    paddingTop: 8,
    paddingBottom: 16,
  },
  option: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  weatherArtWrap: {
    pointerEvents: 'none',
    gap: 10,
    marginTop: 20,
  },
  weatherArt: {
    height: 132,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00000022',
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
