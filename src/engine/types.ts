/**
 * Tipos del dominio Outfit Roulette.
 * Modelo de prendas, looks, usos y giros guardados localmente.
 */

export type Slot = 'top' | 'bottom' | 'layer' | 'shoes' | 'onepiece';

/** Carretes visibles (una pieza ocupa la fusión top+bottom en la UI). */
export type ReelSlot = Exclude<Slot, 'onepiece'>;

export type Occasion = 'all' | 'classes' | 'date' | 'party' | 'gym';

export type ColorFamily = 'neutral' | 'warm' | 'cool' | 'accent';

export type Source = 'basic' | 'camera' | 'gallery';

export interface Garment {
  id: string;
  slot: Slot;
  name: string;
  /** Clave de silueta SVG para básicos vectoriales. */
  silhouette: string;
  source: Source;
  colorHex: string;
  colorName: string;
  colorFamily: ColorFamily;
  hasPattern: boolean;
  /** 1 (verano) a 4 (térmico pesado). */
  warmth: 1 | 2 | 3 | 4;
  /** 1 (sport) a 5 (etiqueta). */
  formality: 1 | 2 | 3 | 4 | 5;
  /** Etiquetas libres: 'sport', 'night', 'summer', 'thermal', 'home', 'gala'. */
  tags: string[];
  isFavorite: boolean;
  /** Borrado lógico: nunca se destruye un look existente. */
  isArchived: boolean;
  /** En cesto de lavandería: excluida de todos los giros. */
  isLaundry: boolean;
  createdAt: number;
  /** Clave del básico original cuando source = 'basic'. */
  basicKey?: string;
}

export interface WearLog {
  id: string;
  /** 'YYYY-MM-DD' */
  wornOn: string;
  dateMs: number;
  garmentIds: string[];
  lookId?: string;
}

export interface SavedLook {
  id: string;
  name: string | null;
  occasion: Occasion;
  garmentIds: string[];
  temperatureAtSave: number | null;
  isFavorite: boolean;
  createdAt: number;
}

export type ThermalMode = 'summer' | 'temperate' | 'cold' | 'heavyCold';

export interface ScoreBreakdown {
  color: number;
  formality: number;
  warmth: number;
  freshness: number;
  subuse: number;
  patternPenalty: number;
  total: number;
}

export interface Candidate {
  top?: Garment;
  bottom?: Garment;
  layer?: Garment;
  shoes?: Garment;
  onepiece?: Garment;
  breakdown: ScoreBreakdown;
}

export interface SpinResult {
  outfit: Candidate;
  /** 40 candidatos generados, útil para depuración y pruebas. */
  candidateCount: number;
  /** Estrategia de relajación aplicada (0 = ninguna). */
  relaxationLevel: 0 | 1 | 2 | 3;
  thermalMode: ThermalMode;
}

export interface SpinSettings {
  /** -2 si es caluroso/a, +2 si es friolento/a. */
  personalOffsetC: number;
  chaosMode: boolean;
}

export interface SpinHistory {
  wearLogs: WearLog[];
  /** Claves de combinación de los últimos 20 giros de la sesión. */
  recentComboKeys: string[];
}

export interface SpinInput {
  garments: Garment[];
  /** Candados del usuario: NUNCA se relajan ni se filtran por clima/ocasión. */
  locks: Partial<Record<ReelSlot, Garment>>;
  occasion: Occasion;
  temperatureC: number;
  settings: SpinSettings;
  history: SpinHistory;
  /** Interruptor manual del carrete Capa en clima templado. */
  layerEnabled: boolean;
  now: number;
  rng: () => number;
  /** Calculado por el motor a partir de temperatureC; el llamador no lo pasa. */
  thermalMode: ThermalMode;
}

/** Clave estable de una combinación (para deduplicar giros y registros de uso). */
export function comboKey(garmentIds: string[]): string {
  return [...garmentIds].sort().join('|');
}
