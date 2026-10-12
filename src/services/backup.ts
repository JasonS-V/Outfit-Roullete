import type { SpinSettingsState } from '../context/AppContext';
import type { Audience } from '../data/catalog';
import type { Garment, Occasion, ReelSlot, SavedLook, Slot, WearLog } from '../engine/types';
import type { CityResult } from './weather';

export interface AppBackup {
  version: 1;
  hasOnboarded: boolean;
  audience: Audience;
  garments: Garment[];
  looks: SavedLook[];
  wearLogs: WearLog[];
  recentComboKeys: string[];
  occasion: Occasion;
  currentIds: Partial<Record<Slot, string>>;
  locks: Partial<Record<ReelSlot, string>>;
  settings: SpinSettingsState;
  showLockTip: boolean;
  weatherPlace: CityResult | 'device' | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === 'string';
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const stringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);
const oneOf = (value: unknown, choices: readonly string[]) => isString(value) && choices.includes(value);
const slots = ['top', 'bottom', 'layer', 'shoes', 'onepiece'] as const;
const occasions = ['all', 'classes', 'date', 'party', 'gym'] as const;

function idMap(value: unknown, keys: readonly string[]): boolean {
  return isRecord(value) && Object.entries(value).every(([key, id]) => keys.includes(key) && isString(id));
}

function garment(value: unknown): value is Garment {
  return isRecord(value) && isString(value.id) && oneOf(value.slot, slots) &&
    isString(value.name) && isString(value.silhouette) && oneOf(value.source, ['basic', 'camera', 'gallery']) &&
    typeof value.colorHex === 'string' && /^#[0-9a-fA-F]{6}$/.test(value.colorHex) &&
    isString(value.colorName) && oneOf(value.colorFamily, ['neutral', 'warm', 'cool', 'accent']) &&
    isBoolean(value.hasPattern) && isNumber(value.warmth) && [1, 2, 3, 4].includes(value.warmth) &&
    isNumber(value.formality) && [1, 2, 3, 4, 5].includes(value.formality) &&
    stringArray(value.tags) && isBoolean(value.isFavorite) && isBoolean(value.isArchived) &&
    isBoolean(value.isLaundry) && isNumber(value.createdAt) &&
    (value.basicKey === undefined || isString(value.basicKey));
}

function look(value: unknown): value is SavedLook {
  return isRecord(value) && isString(value.id) && (value.name === null || isString(value.name)) &&
    oneOf(value.occasion, occasions) && stringArray(value.garmentIds) &&
    (value.temperatureAtSave === null || isNumber(value.temperatureAtSave)) &&
    isBoolean(value.isFavorite) && isNumber(value.createdAt);
}

function wearLog(value: unknown): value is WearLog {
  return isRecord(value) && isString(value.id) && isString(value.wornOn) &&
    isNumber(value.dateMs) && stringArray(value.garmentIds) &&
    (value.lookId === undefined || isString(value.lookId));
}

function settings(value: unknown): value is SpinSettingsState {
  return isRecord(value) && oneOf(value.themeColor, ['sage', 'blue', 'rose', 'black']) &&
    oneOf(value.themeMode, ['system', 'light', 'dark']) && isBoolean(value.soundOn) &&
    isBoolean(value.hapticsOn) && isNumber(value.personalOffsetC) && [-2, 0, 2].includes(value.personalOffsetC) &&
    isBoolean(value.chaosMode) && isBoolean(value.layerEnabled);
}

function place(value: unknown): value is AppBackup['weatherPlace'] {
  return value === null || value === 'device' || (isRecord(value) && isString(value.name) &&
    isNumber(value.lat) && Math.abs(value.lat) <= 90 && isNumber(value.lon) && Math.abs(value.lon) <= 180 &&
    (value.region === undefined || isString(value.region)) &&
    (value.country === undefined || isString(value.country)));
}

export function parseBackup(json: string): AppBackup {
  const value: unknown = JSON.parse(json);
  if (!isRecord(value) || value.version !== 1 || !isBoolean(value.hasOnboarded) ||
    !oneOf(value.audience, ['fem', 'masc', 'uni']) ||
    !Array.isArray(value.garments) || !value.garments.every(garment) ||
    !Array.isArray(value.looks) || !value.looks.every(look) ||
    !Array.isArray(value.wearLogs) || !value.wearLogs.every(wearLog) ||
    !stringArray(value.recentComboKeys) || !oneOf(value.occasion, occasions) ||
    !idMap(value.currentIds, slots) || !idMap(value.locks, slots.slice(0, 4)) ||
    !settings(value.settings) || !isBoolean(value.showLockTip) || !place(value.weatherPlace)) {
    throw new Error('El archivo no es un respaldo válido de Outfit Roulette.');
  }
  return value as unknown as AppBackup;
}
