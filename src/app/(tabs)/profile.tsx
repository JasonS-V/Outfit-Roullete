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
import { ChevronRightIcon } from '@/components/ui/icons';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useToast } from '@/components/ui/Toast';
import { WeatherSheet } from '@/components/weather';
import { useApp } from '@/context/AppContext';
import { themeColorOptions, useTheme, type ThemeMode } from '@/theme';
import { parseBackup } from '@/services/backup';
import { exportBackupFile, pickBackupFile } from '@/services/backupFile';
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

const modeOptions: { key: ThemeMode; label: string }[] = [
  { key: 'system', label: 'Sistema' },
  { key: 'light', label: 'Claro' },
  { key: 'dark', label: 'Oscuro' },
];

function AppearanceDropdown<T extends string>({
  label,
  options,
  value,
  expanded,
  onToggle,
  onSelect,
}: {
  label: string;
  options: { key: T; label: string; swatch?: string }[];
  value: T;
  expanded: boolean;
  onToggle: () => void;
  onSelect: (key: T) => void;
}) {
  const { colors, radii, spacing } = useTheme();
  const selected = options.find((option) => option.key === value)!;

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected.label}`}
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={[styles.appearanceTrigger, { borderColor: colors.line, borderRadius: radii.md, paddingHorizontal: spacing.four }]}
      >
        <AppText variant="subtitle" style={{ flex: 1 }}>{label}</AppText>
        {selected.swatch ? <View style={[styles.themeSwatch, { backgroundColor: selected.swatch, borderColor: colors.line }]} /> : null}
        <AppText variant="body" color={colors.inkSoft}>{selected.label}</AppText>
        <View style={{ transform: [{ rotate: expanded ? '-90deg' : '90deg' }] }}>
          <ChevronRightIcon size={18} color={colors.inkSoft} />
        </View>
      </Pressable>
      {expanded ? (
        <View style={{ paddingTop: spacing.one }}>
          {options.map((option) => (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${option.label}`}
              accessibilityState={{ selected: value === option.key }}
              onPress={() => onSelect(option.key)}
              style={[styles.appearanceOption, { borderBottomColor: colors.lineSoft, paddingHorizontal: spacing.four }]}
            >
              {option.swatch ? <View style={[styles.themeSwatch, { backgroundColor: option.swatch, borderColor: colors.line }]} /> : null}
              <AppText variant="body" style={{ flex: 1 }}>{option.label}</AppText>
              {value === option.key ? <AppText variant="label" color={colors.inkSoft}>✓</AppText> : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function ProfileScreen() {
  const app = useApp();
  const { colors, spacing } = useTheme();
  const { showToast } = useToast();
  const [weatherOpen, setWeatherOpen] = useState(false);
  const [transferBusy, setTransferBusy] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState<'mode' | 'color' | null>(null);

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
          <AppText variant="title">Ajustes</AppText>
          <AppText variant="body" color={colors.inkSoft}>
            Haz que los looks se adapten a ti.
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

        <Section title="Apariencia">
          <AppearanceDropdown
            label="Modo"
            options={modeOptions}
            value={app.settings.themeMode}
            expanded={appearanceOpen === 'mode'}
            onToggle={() => setAppearanceOpen(appearanceOpen === 'mode' ? null : 'mode')}
            onSelect={(themeMode) => { app.updateSettings({ themeMode }); setAppearanceOpen(null); }}
          />
          <AppearanceDropdown
            label="Color"
            options={themeColorOptions}
            value={app.settings.themeColor}
            expanded={appearanceOpen === 'color'}
            onToggle={() => setAppearanceOpen(appearanceOpen === 'color' ? null : 'color')}
            onSelect={(themeColor) => { app.updateSettings({ themeColor }); setAppearanceOpen(null); }}
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
            label="Exportar respaldo"
            variant="ghost"
            disabled={transferBusy || !app.ready}
            onPress={async () => {
              setTransferBusy(true);
              try {
                await exportBackupFile(app.exportData());
              } catch {
                showToast({ text: 'No se pudo exportar el respaldo.' });
              } finally {
                setTransferBusy(false);
              }
            }}
          />
          <PrimaryButton
            label="Importar respaldo"
            variant="ghost"
            disabled={transferBusy || !app.ready}
            onPress={async () => {
              setTransferBusy(true);
              try {
                const json = await pickBackupFile();
                if (!json) return;
                const backup = parseBackup(json);
                const ok = await confirmDestructive(
                  'Importar respaldo',
                  `Este archivo contiene ${backup.garments.length} prendas, ${backup.looks.length} looks y ${backup.wearLogs.length} usos. Reemplazará todos los datos actuales de este dispositivo.`,
                  'Importar',
                );
                if (!ok) return;
                await app.importData(json);
                showToast({ text: 'Respaldo importado.' });
                router.replace(backup.hasOnboarded ? '/' : '/onboarding');
              } catch {
                showToast({ text: 'No se pudo importar. Comprueba que sea un respaldo válido.' });
              } finally {
                setTransferBusy(false);
              }
            }}
          />
          <AppText variant="micro" color={colors.inkSoft}>
            El respaldo incluye armario, looks, historial, preferencias y ciudad elegida.
          </AppText>
          <RowDivider />
          <PrimaryButton
            label="Eliminar todos mis datos"
            variant="danger"
            disabled={transferBusy || !app.ready}
            onPress={async () => {
              const ok = await confirmDestructive(
                'Eliminar todos mis datos',
                'Se borran armario, looks e historial de este dispositivo. Esta acción no se puede deshacer.',
                'Eliminar todo',
              );
              if (ok) {
                try {
                  await app.resetAllData();
                  showToast({ text: 'Datos eliminados. Vuelves al inicio.' });
                  router.replace('/onboarding');
                } catch {
                  showToast({ text: 'No se pudieron eliminar los datos. Intenta de nuevo.' });
                }
              }
            }}
          />
          <AppText variant="micro" color={colors.inkSoft}>
            Tus datos se guardan en este dispositivo, sin cuenta. Exporta un respaldo para llevarlos a otro.
          </AppText>
          {app.storageError ? <AppText variant="micro" color={colors.danger}>{app.storageError}</AppText> : null}
        </Section>

        <AppText variant="micro" color={colors.inkSoft} style={{ textAlign: 'center' }}>
          Outfit Roulette · Tu ropa, nuevas combinaciones.
        </AppText>
      </ScrollView>
      <WeatherSheet visible={weatherOpen} onClose={() => setWeatherOpen(false)} />
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
    gap: 6,
    paddingTop: 18,
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
  appearanceTrigger: {
    minHeight: 52,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appearanceOption: {
    minHeight: 48,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
});
