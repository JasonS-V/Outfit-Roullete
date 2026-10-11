/**
 * AppContext · estado global de Outfit Roulette.
 * En memoria durante el Sprint 1 (mock); la interfaz de acciones ya está
 * pensada para conectar SQLite en el Sprint 3 sin tocar las pantallas.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { BASIC_BY_KEY, garmentFromBasic, type Audience, type BasicItem } from '@/data/catalog';
import { colorNameFor } from '@/data/palette';
import { candidateKey, isNeutralColor, spin as runSpin } from '@/engine';
import type {
  Candidate,
  Garment,
  Occasion,
  ReelSlot,
  SavedLook,
  SpinResult,
  WearLog,
} from '@/engine';
import { setHapticsEnabled } from '@/services/haptics';
import { setSoundEnabled } from '@/services/sound';
import { ThemePreferencesContext } from '@/theme';
import type { ThemeColor, ThemeMode } from '@/theme/tokens';
import {
  cachedWeather,
  deviceCoordinates,
  fetchWeatherAt,
  WeatherError,
  type CityResult,
  type WeatherData,
} from '@/services/weather';

export interface SpinSettingsState {
  themeColor: ThemeColor;
  themeMode: ThemeMode;
  soundOn: boolean;
  hapticsOn: boolean;
  /** -2 caluroso/a · 0 neutro · +2 friolento/a */
  personalOffsetC: number;
  chaosMode: boolean;
  /** Cuarto carrete manual en clima templado. */
  layerEnabled: boolean;
}

export interface WeatherState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  data?: WeatherData;
  error?: string;
}

const WEATHER_FALLBACK_C = 20;

interface AppContextType {
  // Onboarding
  hasOnboarded: boolean;
  audience: Audience;
  setAudience: (a: Audience) => void;
  completeOnboarding: (audience: Audience, garmentKeys: string[]) => void;
  // Armario
  garments: Garment[];
  garmentById: (id: string) => Garment | undefined;
  addGarment: (basicKey: string, colorHex?: string) => Garment | null;
  removeGarment: (id: string) => void;
  toggleLaundry: (id: string) => void;
  toggleFavoriteGarment: (id: string) => void;
  // Ruleta
  occasion: Occasion;
  setOccasion: (o: Occasion) => void;
  current: Candidate | null;
  locks: Partial<Record<ReelSlot, string>>;
  toggleLock: (slot: ReelSlot) => void;
  manualPick: (slot: ReelSlot, garmentId: string) => void;
  spinNow: () => SpinResult | null;
  undo: () => void;
  canUndo: boolean;
  clearLocks: () => void;
  allReelsLocked: (activeSlots: ReelSlot[]) => boolean;
  toggleOnepieceLock: (onepieceId: string) => void;
  isOnepieceLocked: (onepieceId: string) => boolean;
  // Looks
  looks: SavedLook[];
  saveCurrentLook: () => SavedLook | null;
  deleteLook: (id: string) => void;
  applyLook: (look: SavedLook) => number;
  // Uso diario
  wearLogs: WearLog[];
  registerWear: (garmentIdsOverride?: string[]) => void;
  lastWornInfo: (garmentId: string) => { days?: number } | null;
  // Clima
  weather: WeatherState;
  refreshWeather: () => Promise<void>;
  setCity: (city: CityResult) => Promise<void>;
  temperatureForEngine: number;
  // Ajustes
  settings: SpinSettingsState;
  updateSettings: (partial: Partial<SpinSettingsState>) => void;
  // Tip de primer giro
  showLockTip: boolean;
  dismissLockTip: () => void;
  // Datos
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function todayKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [audience, setAudience] = useState<Audience>('uni');
  const [garments, setGarments] = useState<Garment[]>([]);
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [wearLogs, setWearLogs] = useState<WearLog[]>([]);
  const [recentComboKeys, setRecentComboKeys] = useState<string[]>([]);
  const [occasion, setOccasion] = useState<Occasion>('all');
  const [current, setCurrent] = useState<Candidate | null>(null);
  const [history, setHistory] = useState<Candidate[]>([]);
  const [locks, setLocks] = useState<Partial<Record<ReelSlot, string>>>({});
  const [weather, setWeather] = useState<WeatherState>(() => {
    const cached = cachedWeather();
    return cached ? { status: 'ready', data: cached } : { status: 'idle' };
  });
  const [settings, setSettings] = useState<SpinSettingsState>({
    themeColor: 'sage',
    themeMode: 'system',
    soundOn: true,
    hapticsOn: true,
    personalOffsetC: 0,
    chaosMode: false,
    layerEnabled: false,
  });
  const themePreferences = useMemo(() => ({ color: settings.themeColor, mode: settings.themeMode }), [settings.themeColor, settings.themeMode]);
  const [showLockTip, setShowLockTip] = useState(false);

  // Espejo estable para acciones que necesitan el estado más reciente.
  const stateRef = useRef({ garments, current, recentComboKeys, wearLogs, locks, occasion, settings });
  stateRef.current = { garments, current, recentComboKeys, wearLogs, locks, occasion, settings };

  useEffect(() => {
    setSoundEnabled(settings.soundOn);
    setHapticsEnabled(settings.hapticsOn);
  }, [settings.soundOn, settings.hapticsOn]);

  // ── Onboarding ──────────────────────────────────────────────────────────

  const completeOnboarding = useCallback((aud: Audience, garmentKeys: string[]) => {
    const created = garmentKeys
      .map((key) => BASIC_BY_KEY[key])
      .filter((b): b is BasicItem => Boolean(b))
      .map((b) => garmentFromBasic(b));
    setAudience(aud);
    setGarments(created);
    setHasOnboarded(true);
    setShowLockTip(true);
    // Primer outfit de bienvenida: un giro semilla real con lo elegido.
    if (created.length > 0) {
      const seed = runSpin({
        garments: created,
        locks: {},
        occasion: 'all',
        temperatureC: WEATHER_FALLBACK_C,
        settings: { personalOffsetC: 0, chaosMode: false },
        history: { wearLogs: [], recentComboKeys: [] },
        layerEnabled: false,
        now: Date.now(),
        rng: Math.random,
      });
      setCurrent(seed.outfit);
      setRecentComboKeys([candidateKey(seed.outfit)]);
    }
  }, []);

  // ── Armario ─────────────────────────────────────────────────────────────

  const garmentById = useCallback(
    (id: string) => stateRef.current.garments.find((g) => g.id === id && !g.isArchived),
    [],
  );

  const addGarment = useCallback((basicKey: string, colorHex?: string) => {
    const basic = BASIC_BY_KEY[basicKey];
    if (!basic) return null;
    const override = colorHex
      ? {
          colorHex,
          colorName: colorNameFor(colorHex),
          colorFamily: (isNeutralColor(colorHex) ? 'neutral' : 'accent') as Garment['colorFamily'],
        }
      : {};
    const garment = garmentFromBasic(basic, override);
    setGarments((prev) => [...prev, garment]);
    return garment;
  }, []);

  const removeGarment = useCallback((id: string) => {
    setGarments((prev) => prev.map((g) => (g.id === id ? { ...g, isArchived: true } : g)));
    setLocks((prev) => {
      const next = { ...prev };
      for (const slot of Object.keys(next) as ReelSlot[]) {
        if (next[slot] === id) delete next[slot];
      }
      return next;
    });
  }, []);

  const toggleLaundry = useCallback((id: string) => {
    setGarments((prev) => prev.map((g) => (g.id === id ? { ...g, isLaundry: !g.isLaundry } : g)));
  }, []);

  const toggleFavoriteGarment = useCallback((id: string) => {
    setGarments((prev) => prev.map((g) => (g.id === id ? { ...g, isFavorite: !g.isFavorite } : g)));
  }, []);

  // ── Ruleta ──────────────────────────────────────────────────────────────

  const resolvedLocks = useCallback((): Partial<Record<ReelSlot, Garment>> => {
    const { garments: list, locks: lockMap } = stateRef.current;
    const out: Partial<Record<ReelSlot, Garment>> = {};
    for (const slot of Object.keys(lockMap) as ReelSlot[]) {
      const id = lockMap[slot];
      const g = list.find((x) => x.id === id && !x.isArchived && !x.isLaundry);
      if (g) out[slot] = g;
    }
    return out;
  }, []);

  const spinNow = useCallback((): SpinResult | null => {
    const s = stateRef.current;
    const lockGarments = resolvedLocks();
    const active = s.garments.filter((g) => !g.isArchived && !g.isLaundry);
    if (active.length === 0) return null;

    const recent = s.current
      ? [candidateKey(s.current), ...s.recentComboKeys].slice(0, 20)
      : s.recentComboKeys;

    const result = runSpin({
      garments: active,
      locks: lockGarments,
      occasion: s.occasion,
      temperatureC: weather.data?.apparentC ?? WEATHER_FALLBACK_C,
      settings: {
        personalOffsetC: s.settings.personalOffsetC,
        chaosMode: s.settings.chaosMode,
      },
      history: { wearLogs: s.wearLogs, recentComboKeys: recent },
      layerEnabled: s.settings.layerEnabled,
      now: Date.now(),
      rng: Math.random,
    });

    if (s.current) setHistory((prev) => [s.current as Candidate, ...prev].slice(0, 5));
    setCurrent(result.outfit);
    setRecentComboKeys((prev) => [candidateKey(result.outfit), ...prev].slice(0, 20));
    return result;
  }, [resolvedLocks, weather.data]);

  const toggleLock = useCallback((slot: ReelSlot) => {
    setLocks((prev) => {
      const next = { ...prev };
      if (next[slot]) {
        delete next[slot];
        return next;
      }
      const s = stateRef.current;
      const garment = s.current?.[slot] as Garment | undefined;
      if (garment && !garment.isArchived && !garment.isLaundry) {
        next[slot] = garment.id;
      }
      return next;
    });
  }, []);

  const manualPick = useCallback((slot: ReelSlot, garmentId: string) => {
    const s = stateRef.current;
    const garment = s.garments.find((g) => g.id === garmentId && !g.isArchived && !g.isLaundry);
    if (!garment) return;
    setCurrent((prev) => {
      if (!prev) return { [slot]: garment, breakdown: zeroBreakdown() } as Candidate;
      return { ...prev, [slot]: garment };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const [last, ...rest] = prev;
      setCurrent(last);
      return rest;
    });
  }, []);

  const clearLocks = useCallback(() => setLocks({}), []);

  /** Candado de pieza única: fija el vestido/enterizo en ambos carretes fusionados. */
  const toggleOnepieceLock = useCallback((onepieceId: string) => {
    setLocks((prev) => {
      const next = { ...prev };
      if (prev.top === onepieceId && prev.bottom === onepieceId) {
        delete next.top;
        delete next.bottom;
      } else {
        next.top = onepieceId;
        next.bottom = onepieceId;
      }
      return next;
    });
  }, []);

  const isOnepieceLocked = useCallback((onepieceId: string) => {
    const l = stateRef.current.locks;
    return l.top === onepieceId && l.bottom === onepieceId;
  }, []);

  const allReelsLocked = useCallback(
    (activeSlots: ReelSlot[]) => activeSlots.every((slot) => Boolean(stateRef.current.locks[slot])),
    [],
  );

  // ── Looks ───────────────────────────────────────────────────────────────

  const saveCurrentLook = useCallback((): SavedLook | null => {
    const s = stateRef.current;
    if (!s.current) return null;
    const garmentIds = candidateItems(s.current).map((g) => g.id);
    if (garmentIds.length === 0) return null;
    const look: SavedLook = {
      id: makeId('look'),
      name: null,
      occasion: s.occasion,
      garmentIds,
      temperatureAtSave: weather.data?.apparentC ?? null,
      isFavorite: false,
      createdAt: Date.now(),
    };
    setLooks((prev) => [look, ...prev]);
    return look;
  }, [weather.data]);

  const deleteLook = useCallback((id: string) => {
    setLooks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  /** Carga un look en la ruleta y fija candados. Devuelve cuántas prendas faltan. */
  const applyLook = useCallback((look: SavedLook): number => {
    const s = stateRef.current;
    const found: Partial<Record<ReelSlot, Garment>> = {};
    let onepiece: Garment | undefined;
    let missing = 0;
    for (const id of look.garmentIds) {
      const g = s.garments.find((x) => x.id === id && !x.isArchived);
      if (g) {
        if (g.slot === 'onepiece') onepiece = g;
        else found[g.slot as ReelSlot] = g;
      } else {
        missing += 1;
      }
    }
    const nextLocks: Partial<Record<ReelSlot, string>> = {};
    for (const slot of Object.keys(found) as ReelSlot[]) {
      const g = found[slot];
      if (g) nextLocks[slot] = g.id;
    }
    if (onepiece) {
      nextLocks.top = onepiece.id;
      nextLocks.bottom = onepiece.id;
    }
    setLocks(nextLocks);
    setCurrent({ ...found, onepiece, breakdown: zeroBreakdown() } as Candidate);
    setOccasion(look.occasion);
    return missing;
  }, []);

  // ── Uso diario ──────────────────────────────────────────────────────────

  const registerWear = useCallback((garmentIdsOverride?: string[]) => {
    const s = stateRef.current;
    const garmentIds = garmentIdsOverride ?? (s.current ? candidateItems(s.current).map((g) => g.id) : []);
    if (garmentIds.length === 0) return;
    const now = new Date();
    const log: WearLog = {
      id: makeId('wear'),
      wornOn: todayKey(now),
      dateMs: now.getTime(),
      garmentIds,
    };
    setWearLogs((prev) => [...prev, log]);
  }, []);

  const lastWornInfo = useCallback(
    (garmentId: string) => {
      const logs = stateRef.current.wearLogs;
      let last: WearLog | null = null;
      for (const log of logs) {
        if (log.garmentIds.includes(garmentId)) {
          if (!last || log.dateMs > last.dateMs) last = log;
        }
      }
      if (!last) return null;
      const days = Math.floor((Date.now() - last.dateMs) / (24 * 60 * 60 * 1000));
      return { days };
    },
    [],
  );

  // ── Clima ───────────────────────────────────────────────────────────────

  const setCity = useCallback(async (city: CityResult) => {
    setWeather({ status: 'loading' });
    try {
      const data = await fetchWeatherAt(city.lat, city.lon, city.name);
      setWeather({ status: 'ready', data });
    } catch (error) {
      const message =
        error instanceof WeatherError && error.kind === 'offline'
          ? 'Sin conexión. Puedes seguir girando sin clima.'
          : 'No pudimos leer el clima. Intenta de nuevo.';
      setWeather({ status: 'error', error: message });
    }
  }, []);

  const refreshWeather = useCallback(async () => {
    const cached = cachedWeather();
    if (cached) {
      setWeather({ status: 'ready', data: cached });
      return;
    }
    setWeather({ status: 'loading' });
    const coords = await deviceCoordinates();
    if (!coords) {
      setWeather({
        status: 'error',
        error: 'Ubicación no disponible. Elige tu ciudad manualmente.',
      });
      return;
    }
    try {
      const data = await fetchWeatherAt(coords.lat, coords.lon, 'Tu ubicación');
      setWeather({ status: 'ready', data });
    } catch (error) {
      const message =
        error instanceof WeatherError && error.kind === 'offline'
          ? 'Sin conexión. Puedes seguir girando sin clima.'
          : 'No pudimos leer el clima. Intenta de nuevo.';
      setWeather({ status: 'error', error: message });
    }
  }, []);

  const temperatureForEngine = weather.data?.apparentC ?? WEATHER_FALLBACK_C;

  // ── Ajustes y datos ─────────────────────────────────────────────────────

  const updateSettings = useCallback((partial: Partial<SpinSettingsState>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const dismissLockTip = useCallback(() => setShowLockTip(false), []);

  const resetAllData = useCallback(() => {
    setGarments([]);
    setLooks([]);
    setWearLogs([]);
    setRecentComboKeys([]);
    setCurrent(null);
    setHistory([]);
    setLocks({});
    setOccasion('all');
    setHasOnboarded(false);
    setShowLockTip(false);
  }, []);

  const value = useMemo<AppContextType>(
    () => ({
      hasOnboarded,
      audience,
      setAudience,
      completeOnboarding,
      garments,
      garmentById,
      addGarment,
      removeGarment,
      toggleLaundry,
      toggleFavoriteGarment,
      occasion,
      setOccasion,
      current,
      locks,
      toggleLock,
      manualPick,
      spinNow,
      undo,
      canUndo: history.length > 0,
      clearLocks,
      allReelsLocked,
      toggleOnepieceLock,
      isOnepieceLocked,
      looks,
      saveCurrentLook,
      deleteLook,
      applyLook,
      wearLogs,
      registerWear,
      lastWornInfo,
      weather,
      refreshWeather,
      setCity,
      temperatureForEngine,
      settings,
      updateSettings,
      showLockTip,
      dismissLockTip,
      resetAllData,
    }),
    [
      hasOnboarded,
      audience,
      completeOnboarding,
      garments,
      garmentById,
      addGarment,
      removeGarment,
      toggleLaundry,
      toggleFavoriteGarment,
      occasion,
      current,
      locks,
      toggleLock,
      manualPick,
      spinNow,
      undo,
      history.length,
      clearLocks,
      allReelsLocked,
      toggleOnepieceLock,
      isOnepieceLocked,
      looks,
      saveCurrentLook,
      deleteLook,
      applyLook,
      wearLogs,
      registerWear,
      lastWornInfo,
      weather,
      refreshWeather,
      setCity,
      temperatureForEngine,
      settings,
      updateSettings,
      showLockTip,
      dismissLockTip,
      resetAllData,
    ],
  );

  return (
    <ThemePreferencesContext.Provider value={themePreferences}>
      <AppContext.Provider value={value}>{children}</AppContext.Provider>
    </ThemePreferencesContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
}

// ── utilidades internas ───────────────────────────────────────────────────

export function candidateItems(candidate: Candidate): Garment[] {
  return [candidate.top, candidate.bottom, candidate.layer, candidate.shoes, candidate.onepiece].filter(
    (g): g is Garment => Boolean(g),
  );
}

function zeroBreakdown(): Candidate['breakdown'] {
  return { color: 0, formality: 0, warmth: 0, freshness: 0, subuse: 0, patternPenalty: 0, total: 0 };
}
