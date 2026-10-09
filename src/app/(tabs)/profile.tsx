/**
 * Pantalla 4 · Yo (§12.3): ajustes de experiencia, preferencia térmica,
 * estadísticas reales del ropero y borrado total de datos.
 */

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useToast } from '@/components/ui/Toast';
import { WeatherSheet } from '@/components/weather';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/theme';
import { confirmDestructive } from '@/utils/confirm';

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { colors, radii, spacing } = useTheme();
  return (
    <View style={{ gap: spacing.two }}>
      <AppText variant="label" color={colors.inkSoft} style={styles.sectionTitle}>
        {title.toUpperCase()}
      </AppText>
      <View
        style={{
          backgroundColor: colors.surfaceRaised,
          borderColor: colors.cardEdge,
          borderWidth: 1,
          borderRadius: radii.card,
          padding: spacing.four,
          gap: spacing.three,
        }}
      >
        {children}
      </View>
    </View>
  );
}

/** Filo interior: separa filas dentro de una misma tarjeta. */
function RowDivider() {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ height: 1, backgroundColor: colors.line, marginVertical: -spacing.one }} />
  );
}

/** Tile de estadística: el número manda y la etiqueta lo explica. */
function StatTile({ value, label }: { value: number; label: string }) {
  const { colors, radii } = useTheme();
  return (
    <View
      style={[
        styles.statTile,
        { backgroundColor: colors.surfaceRaised, borderColor: colors.cardEdge, borderRadius: radii.md },
      ]}
    >
      <AppText variant="title" style={styles.statValue}>
        {value}
      </AppText>
      <AppText variant="micro" color={colors.inkSoft} style={{ textAlign: 'center' }}>
        {label}
      </AppText>
    </View>
  );
}

function SwitchRow({
  label,
  hint,
  value,
  onChange,
  divider,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  divider?: boolean;
}) {
  const { colors, spacing } = useTheme();
  return (
    <>
      {divider ? <RowDivider /> : null}
      <View style={[styles.row, { gap: spacing.three }]}>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="subtitle">{label}</AppText>
          {hint ? (
            <AppText variant="micro" color={colors.inkSoft}>
              {hint}
            </AppText>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel={label}
          accessibilityState={{ checked: value }}
          aria-checked={value}
          onPress={() => onChange(!value)}
          style={styles.switchTouch}
        >
          <View style={[styles.switchTrack, { backgroundColor: value ? colors.candado : colors.line }]}>
            <View style={[styles.switchThumb, { backgroundColor: value ? colors.onCandado : colors.bg, marginLeft: value ? 23 : 3 }]} />
          </View>
        </Pressable>
      </View>
    </>
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
      <ScrollView contentContainerStyle={{ gap: spacing.six, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="micro" color={colors.inkSoft} style={styles.eyebrow}>TU ESPACIO  /  04</AppText>
          <AppText variant="title">Perfil.</AppText>
          <AppText variant="body" color={colors.inkSoft}>
            Tu estilo también está en los detalles.
          </AppText>
        </View>

        <Section title="Experiencia">
          <SwitchRow
            label="Sonido"
            hint="Tics del carrete, golpes de parada y chime final"
            value={app.settings.soundOn}
            onChange={(v) => app.updateSettings({ soundOn: v })}
          />
          <SwitchRow
            divider
            label="Vibración"
            hint="Feedback táctil en el giro y los candados"
            value={app.settings.hapticsOn}
            onChange={(v) => app.updateSettings({ hapticsOn: v })}
          />
          <SwitchRow
            divider
            label="Modo caos"
            hint="Sin reglas de color ni formalidad: ideal para retos"
            value={app.settings.chaosMode}
            onChange={(v) => app.updateSettings({ chaosMode: v })}
          />
          <SwitchRow
            divider
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
          <RowDivider />
          <View style={{ gap: spacing.two }}>
            <AppText variant="subtitle">
              {app.weather.status === 'ready' && app.weather.data
                ? `${app.weather.data.city} · ${Math.round(app.weather.data.apparentC)}°C ahora`
                : 'Clima sin configurar'}
            </AppText>
            <PrimaryButton label="Configurar clima" variant="ghost" onPress={() => setWeatherOpen(true)} />
          </View>
        </Section>

        <Section title="Tu ropero">
          <View style={styles.statsRow}>
            <StatTile value={active.length} label="Prendas" />
            <StatTile value={app.looks.length} label="Looks" />
            <StatTile value={wearsThisWeek} label="Usos esta semana" />
          </View>
          <RowDivider />
          <AppText variant="body" color={colors.inkSoft}>
            {favoriteGarment
              ? `Tu prenda más usada: ${favoriteGarment.name} (${favoriteGarment.count} ${favoriteGarment.count === 1 ? 'uso' : 'usos'})`
              : 'Aún no registras usos: toca Me lo pongo después de girar'}
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
    paddingHorizontal: 20,
  },
  header: {
    gap: 6,
    paddingTop: 12,
  },
  eyebrow: {
    letterSpacing: 1.3,
  },
  sectionTitle: {
    letterSpacing: 1.4,
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderWidth: 1,
  },
  statValue: {
    lineHeight: 26,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchTouch: {
    width: 54,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
