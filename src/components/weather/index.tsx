/**
 * Clima · chip del encabezado, buscador de ciudad y hoja de configuración.
 * Estados completos: cargando, listo, error y vacío (§23 caso 20).
 */

import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useApp } from '@/context/AppContext';
import { translate, useLanguage } from '@/localization';
import { searchCity, WeatherError, type CityResult } from '@/services/weather';
import { fontFamily, useTheme } from '@/theme';
import { AppText } from '@/components/ui/AppText';
import { CloudSunIcon, SnowIcon, SunIcon } from '@/components/ui/icons';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Sheet } from '@/components/ui/Sheet';

export function WeatherChip({ onPress }: { onPress: () => void }) {
  const { weather } = useApp();
  const language = useLanguage();
  const { colors, radii, spacing } = useTheme();

  let label = 'Clima';
  if (weather.status === 'ready' && weather.data) {
    const degrees = Math.round(weather.data.apparentC);
    label = `${weather.data.city} · ${degrees}°`;
  } else if (weather.status === 'loading') {
    label = 'Cargando…';
  } else if (weather.status === 'error') {
    label = 'Clima';
  }

  const temp = weather.data?.apparentC ?? null;
  const Glyph =
    temp === null
      ? CloudSunIcon
      : temp >= 24
        ? SunIcon
        : temp >= 14
          ? CloudSunIcon
          : SnowIcon;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={language === 'en' ? `Weather: ${translate(label, language)}. Tap to configure` : `Clima: ${label}. Toca para configurar`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: colors.bg,
          borderColor: colors.line,
          borderRadius: radii.md,
          paddingHorizontal: spacing.three,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {weather.status === 'loading' ? (
        <ActivityIndicator size="small" color={colors.inkSoft} />
      ) : (
        <>
          <Glyph color={colors.inkSoft} size={18} />
          <AppText variant="label" numberOfLines={1} style={{ flexShrink: 1 }}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

interface CityPickerProps {
  onPick: (city: CityResult) => void;
}

export function CityPicker({ onPick }: CityPickerProps) {
  const { colors, radii, spacing } = useTheme();
  const language = useLanguage();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'idle' | 'searching' | 'done' | 'error'>('idle');
  const [results, setResults] = useState<CityResult[]>([]);
  const [errorText, setErrorText] = useState('');

  const runSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setStatus('error');
      setErrorText('Escribe al menos 2 letras');
      return;
    }
    setStatus('searching');
    try {
      const found = await searchCity(trimmed, language);
      setResults(found);
      setStatus('done');
      setErrorText('');
    } catch (error) {
      setStatus('error');
      setErrorText(
        error instanceof WeatherError && error.kind === 'notfound'
          ? 'No encontramos esa ciudad. Prueba con otro nombre.'
          : 'No pudimos buscar la ciudad. Revisa tu conexión.',
      );
    }
  }, [query, language]);

  return (
    <View style={{ gap: spacing.three }}>
      <View style={styles.searchRow}>
        <TextInput
          accessibilityLabel={translate('Buscar ciudad', language)}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={runSearch}
          placeholder={translate('Escribe tu ciudad (ej. Lima)', language)}
          placeholderTextColor={colors.inkSoft}
          returnKeyType="search"
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.line,
              borderRadius: radii.md,
              color: colors.ink,
              paddingHorizontal: spacing.four,
            },
          ]}
        />
        <PrimaryButton compact label="Buscar" onPress={runSearch} />
      </View>
      {status === 'searching' ? <ActivityIndicator color={colors.inkSoft} /> : null}
      {status === 'error' ? (
        <AppText variant="label" color={colors.danger}>
          {errorText}
        </AppText>
      ) : null}
      {status === 'done'
        ? results.map((city) => (
            <Pressable
              key={`${city.name}-${city.lat}-${city.lon}`}
              accessibilityRole="button"
              onPress={() => onPick(city)}
              style={({ pressed }) => [
                styles.result,
                {
                  backgroundColor: pressed ? colors.surface : 'transparent',
                  borderColor: colors.line,
                  borderRadius: radii.md,
                  paddingHorizontal: spacing.four,
                },
              ]}
            >
              <AppText variant="subtitle">{city.name}</AppText>
              <AppText variant="micro" color={colors.inkSoft}>
                {[city.region, city.country].filter(Boolean).join(', ') || 'Sin región'}
              </AppText>
            </Pressable>
          ))
        : null}
    </View>
  );
}

export function WeatherSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { weather, refreshWeather, setCity } = useApp();
  const { colors, spacing } = useTheme();

  return (
    <Sheet visible={visible} onClose={onClose} title="Clima de hoy">
      <View style={{ gap: spacing.four }}>
        {weather.status === 'ready' && weather.data ? (
          <View style={{ gap: 2 }}>
            <AppText variant="subtitle">
              {weather.data.city} · {Math.round(weather.data.apparentC)}°C de sensación térmica
            </AppText>
            <AppText variant="micro" color={colors.inkSoft}>
              Adaptamos tus giros al frío o calor de tu ciudad.
            </AppText>
          </View>
        ) : (
          <AppText variant="body" color={colors.inkSoft}>
            Si activas el clima, la ruleta activa sola tu capa de abrigo cuando haga falta.
          </AppText>
        )}
        {weather.status === 'error' && weather.error ? (
          <AppText variant="label" color={colors.danger}>
            {weather.error}
          </AppText>
        ) : null}
        <PrimaryButton
          label="Usar mi ubicación"
          onPress={() => {
            void refreshWeather();
          }}
          disabled={weather.status === 'loading'}
        />
        <AppText variant="micro" color={colors.inkSoft} style={{ textAlign: 'center' }}>
          o elige tu ciudad manualmente
        </AppText>
        <CityPicker
          onPick={(city) => {
            void setCity(city);
            onClose();
          }}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    maxWidth: 160,
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    fontFamily: fontFamily.medium,
    fontSize: 15,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  result: {
    minHeight: 52,
    justifyContent: 'center',
    borderWidth: 1,
  },
});
