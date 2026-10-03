/**
 * Pantalla 4 · Yo (§12.3): ajustes de experiencia, preferencia térmica,
 * estadísticas reales del ropero y borrado total de datos.
 */

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useToast } from '@/components/ui/Toast';
import { WeatherSheet } from '@/components/weather';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/theme';
import { confirmDestructive } from '@/utils/confirm';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, radii, spacing } = useTheme();
  return (
    <View style={{ gap: spacing.two }}>
      <AppText variant="label" color={colors.inkSoft}>
        {title.toUpperCase()}
      </AppText>
      <View style={{ backgroundColor: colors.surface, borderRadius: radii.card, padding: spacing.four, gap: spacing.three }}>
        {children}
      </View>
    </View>
  );
}

function SwitchRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { colors, spacing } = useTheme();
  return (
    <View style={[styles.row, { gap: spacing.three }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="subtitle">{label}</AppText>
        {hint ? (
          <AppText variant="micro" color={colors.inkSoft}>
            {hint}
          </AppText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.line, true: colors.chicle }}
        thumbColor={colors.bg}
        accessibilityLabel={label}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const app = useApp();
  const { colors, spacing } = useTheme();
  const { showToast } = useToast();
  const [weatherOpen, setWeatherOpen] = useState(false);

  const active = useMemo(() => app.garments.filter((g) => !g.isArchived), [app.garments]);

  const wearsThisWeek = useMemo(
    () => app.wearLogs.filter((l) => Date.now() - l.dateMs < 7 * 24 * 60 * 60 * 1000).length,
    [app.wearLogs],
  );

  const usageCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const log of app.wearLogs) {
      for (const id of log.garmentIds) {
        map.set(id, (map.get(id) ?? 0) + 1);
      }
    }
    return map;
  }, [app.wearLogs]);

  const favoriteGarment = useMemo(() => {
    let best: { name: string; count: number } | null = null;
    for (const g of active) {
      const count = usageCount.get(g.id) ?? 0;
      if (count > 0 && (!best || count > best.count)) best = { name: g.name, count };
    }
    return best;
  }, [active, usageCount]);

  const dormant = useMemo(() => {
    return active.filter((g) => {
      const info = app.lastWornInfo(g.id);
      return info !== null && (info.days ?? 0) > 45;
    });
  }, [active, app]);

  const offsetOptions: { label: string; value: number }[] = [
    { label: 'Soy caluroso/a', value: -2 },
    { label: 'Neutro', value: 0 },
    { label: 'Soy friolento/a', value: 2 },
  ];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={{ gap: spacing.six, paddingBottom: 32 }}>
        <AppText variant="title" style={{ paddingTop: 8 }}>
          Yo
        </AppText>

        <Section title="Experiencia">
          <SwitchRow
            label="Sonido"
            hint="Tics del carrete, golpes de parada y chime final"
            value={app.settings.soundOn}
            onChange={(v) => app.updateSettings({ soundOn: v })}
          />
          <SwitchRow
            label="Vibración"
            hint="Feedback táctil en el giro y los candados"
            value={app.settings.hapticsOn}
            onChange={(v) => app.updateSettings({ hapticsOn: v })}
          />
          <SwitchRow
            label="Modo caos"
            hint="Sin reglas de color ni formalidad: ideal para retos"
            value={app.settings.chaosMode}
            onChange={(v) => app.updateSettings({ chaosMode: v })}
          />
          <SwitchRow
            label="Capa en clima templado"
            hint="Muestra el carrete de capa aunque no haga frío"
            value={app.settings.layerEnabled}
            onChange={(v) => app.updateSettings({ layerEnabled: v })}
          />
        </Section>

        <Section title="Tú y el clima">
          <View style={{ gap: spacing.two }}>
            <AppText variant="subtitle">¿Cómo sientes el frío?</AppText>
            <View style={styles.chipRow}>
              {offsetOptions.map((option) => (
                <Chip
                  key={option.label}
                  label={option.label}
                  selected={app.settings.personalOffsetC === option.value}
                  onPress={() => app.updateSettings({ personalOffsetC: option.value })}
                />
              ))}
            </View>
          </View>
          <View style={{ gap: spacing.two }}>
            <AppText variant="subtitle">
              {app.weather.status === 'ready' && app.weather.data
                ? `Clima activo: ${app.weather.data.city} · ${Math.round(app.weather.data.apparentC)}°C`
                : 'Clima sin configurar'}
            </AppText>
            <PrimaryButton label="Configurar clima" variant="ghost" onPress={() => setWeatherOpen(true)} />
          </View>
        </Section>

        <Section title="Tu ropero">
          <AppText variant="body">Prendas en el armario: {active.length}</AppText>
          <AppText variant="body">Looks guardados: {app.looks.length}</AppText>
          <AppText variant="body">Usos registrados esta semana: {wearsThisWeek}</AppText>
          <AppText variant="body" color={colors.inkSoft}>
            {favoriteGarment
              ? `Tu prenda más usada: ${favoriteGarment.name} (${favoriteGarment.count} ${favoriteGarment.count === 1 ? 'uso' : 'usos'})`
              : 'Aún no registras usos: toca ✅ Me lo pongo después de girar'}
          </AppText>
          <AppText variant="body" color={colors.inkSoft}>
            {dormant.length > 0
              ? `Armario dormido: ${dormant.length} ${dormant.length === 1 ? 'prenda lleva' : 'prendas llevan'} más de 45 días sin usarse`
              : 'Sin prendas dormidas por ahora: todo tu ropero está en rotación'}
          </AppText>
        </Section>

        <Section title="Datos">
          <PrimaryButton
            label="Eliminar todos mis datos"
            variant="danger"
            onPress={async () => {
              const ok = await confirmDestructive(
                'Eliminar todos mis datos',
                'Se borran armario, looks e historial de este dispositivo. Esta acción no se puede deshacer.',
                'Eliminar todo',
              );
              if (ok) {
                app.resetAllData();
                showToast({ text: 'Datos eliminados. Vuelves al inicio.' });
                router.replace('/onboarding');
              }
            }}
          />
          <AppText variant="micro" color={colors.inkSoft}>
            Versión de desarrollo: en este sprint tu armario vive en memoria. La base de datos local
            (SQLite) llega en el siguiente sprint contigo: nada viaja a internet.
          </AppText>
        </Section>

        <AppText variant="micro" color={colors.inkSoft} style={{ textAlign: 'center' }}>
          Outfit Roulette · versión 1.0.0 (Sprint 1) · Gira. Bloquea. Vístete.
        </AppText>
      </ScrollView>
      <WeatherSheet visible={weatherOpen} onClose={() => setWeatherOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
