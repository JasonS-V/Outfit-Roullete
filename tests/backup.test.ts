import { describe, expect, it } from 'vitest';
import { parseBackup } from '../src/services/backup';

const valid = {
  version: 1,
  hasOnboarded: true,
  audience: 'uni',
  garments: [],
  looks: [],
  wearLogs: [],
  recentComboKeys: [],
  occasion: 'all',
  currentIds: {},
  locks: {},
  settings: {
    themeColor: 'sage', themeMode: 'system', soundOn: true, hapticsOn: true,
    personalOffsetC: 0, chaosMode: false, layerEnabled: false,
  },
  showLockTip: false,
  weatherPlace: { name: 'Lima', lat: -12.05, lon: -77.04 },
};

describe('app backup', () => {
  it('accepts an exported snapshot', () => {
    expect(parseBackup(JSON.stringify(valid))).toEqual(valid);
  });

  it('keeps wardrobe and look references in a backup', () => {
    const garment = {
      id: 'g1', slot: 'top', name: 'Camiseta', silhouette: 'tee', source: 'basic',
      colorHex: '#FFFFFF', colorName: 'Blanco', colorFamily: 'neutral', hasPattern: false,
      warmth: 1, formality: 2, tags: [], isFavorite: true, isArchived: false,
      isLaundry: false, createdAt: 100, basicKey: 'tee',
    };
    const backup = {
      ...valid,
      garments: [garment],
      looks: [{ id: 'l1', name: null, occasion: 'all', garmentIds: ['g1'], temperatureAtSave: 21, isFavorite: false, createdAt: 101 }],
      wearLogs: [{ id: 'w1', wornOn: '2026-10-11', dateMs: 102, garmentIds: ['g1'] }],
      currentIds: { top: 'g1' },
    };
    expect(parseBackup(JSON.stringify(backup))).toEqual(backup);
  });

  it('rejects malformed or incompatible backups without touching app data', () => {
    expect(() => parseBackup('{')).toThrow();
    expect(() => parseBackup(JSON.stringify({ ...valid, version: 2 }))).toThrow();
    expect(() => parseBackup(JSON.stringify({ ...valid, looks: [{ id: 'x' }] }))).toThrow();
    expect(() => parseBackup(JSON.stringify({ ...valid, weatherPlace: { name: 'X', lat: 1000, lon: 0 } }))).toThrow();
    expect(() => parseBackup(JSON.stringify({ ...valid, settings: { ...valid.settings, personalOffsetC: '2' } }))).toThrow();
  });
});
