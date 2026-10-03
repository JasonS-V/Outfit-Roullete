/**
 * Catálogo de básicos vectoriales (§10.3): 80 prendas con metadatos que
 * alimentan al SpinEngine (abrigo, formalidad, etiquetas, color).
 *
 * `shape` es la clave de silueta SVG; admite variante con el formato
 * "forma:variante" (p. ej. "hoodie:zip"). Ver src/components/silhouettes.
 */

import { isNeutralColor } from '@/engine';
import type { Garment, Slot } from '@/engine';
import { colorNameFor } from './palette';

export type Audience = 'fem' | 'masc' | 'uni';

export interface BasicItem {
  key: string;
  name: string;
  slot: Slot;
  shape: string;
  colorHex: string;
  colorName: string;
  warmth: 1 | 2 | 3 | 4;
  formality: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  audience: Audience;
  hasPattern?: boolean;
}

function B(
  key: string,
  name: string,
  slot: Slot,
  shape: string,
  colorHex: string,
  warmth: 1 | 2 | 3 | 4,
  formality: 1 | 2 | 3 | 4 | 5,
  tags: string[],
  audience: Audience = 'uni',
  hasPattern = false,
): BasicItem {
  return {
    key,
    name,
    slot,
    shape,
    colorHex,
    colorName: colorNameFor(colorHex),
    warmth,
    formality,
    tags,
    audience,
    hasPattern,
  };
}

export const ALL_BASICS: BasicItem[] = [
  // ── A. Parte superior (25) ────────────────────────────────────────────────
  B('polo_basico', 'Polo básico cuello redondo', 'top', 'tee', '#FFFFFF', 2, 2, ['casual']),
  B('polo_oversize', 'Polo oversize manga corta', 'top', 'tee_oversize', '#1A1A1A', 2, 2, ['casual']),
  B('polo_boxy', 'Polo boxy fit', 'top', 'tee_oversize', '#8E8E93', 2, 2, ['casual']),
  B('polo_v', 'Polo cuello V', 'top', 'tee:v', '#5D8AA8', 2, 2, ['casual']),
  B('tank', 'Polo sin mangas', 'top', 'tank', '#F4C2C2', 1, 2, ['casual', 'summer']),
  B('polo_pique', 'Polo piqué', 'top', 'polo', '#D4A017', 2, 3, ['smart']),
  B('camisa_blanca', 'Camisa blanca de vestir', 'top', 'shirt', '#FFFFFF', 2, 3, ['smart', 'formal']),
  B('camisa_lino_ml', 'Camisa de lino manga larga', 'top', 'shirt', '#D8C4B6', 1, 3, ['smart', 'summer']),
  B('camisa_lino_mc', 'Camisa de lino manga corta', 'top', 'shirt:short', '#FFFFFF', 1, 3, ['smart', 'summer']),
  B('camisa_cuadros', 'Camisa de cuadros franela', 'top', 'shirt', '#6B1724', 3, 2, ['casual'], 'uni', true),
  B('camisa_denim', 'Camisa de jean', 'top', 'shirt', '#5D8AA8', 2, 2, ['casual']),
  B('blusa_seda', 'Blusa de seda ligera', 'top', 'blouse', '#BDB0D0', 1, 3, ['smart', 'summer'], 'fem'),
  B('crop_basico', 'Top corto básico', 'top', 'crop', '#1A1A1A', 1, 2, ['summer'], 'fem'),
  B('top_halter', 'Top cuello halter', 'top', 'tank', '#B22222', 1, 2, ['summer', 'night'], 'fem'),
  B('polera_crew', 'Polera cuello redondo', 'top', 'crewneck', '#3A3A3C', 2, 2, ['casual']),
  B('hoodie_oversize', 'Hoodie con capucha oversize', 'top', 'hoodie', '#8E8E93', 3, 2, ['casual']),
  B('hoodie_zip', 'Hoodie con cierre frontal', 'top', 'hoodie:zip', '#1A1A1A', 3, 2, ['casual']),
  B('chompa_trenzada', 'Chompa de lana trenzada', 'top', 'crewneck', '#D8C4B6', 3, 2, ['casual']),
  B('sueter_tortuga', 'Suéter fino cuello tortuga', 'top', 'turtleneck', '#1A1A1A', 3, 3, ['smart']),
  B('cardigan_botones', 'Cardigan de botones', 'top', 'cardigan', '#D8C4B6', 3, 3, ['smart']),
  B('polo_ml', 'Polo manga larga básica', 'top', 'longsleeve', '#FFFFFF', 2, 2, ['casual']),
  B('polo_grafico', 'Polo gráfico urbano', 'top', 'tee', '#1A1A1A', 2, 2, ['casual'], 'uni', true),
  B('top_deportivo', 'Top deportivo transpirable', 'top', 'tank:sport', '#1A1A1A', 1, 1, ['sport'], 'fem'),
  B('termica', 'Camiseta térmica manga larga', 'top', 'longsleeve', '#3A3A3C', 3, 1, ['thermal', 'sport']),
  B('chaleco_lana', 'Chaleco de lana escote V', 'top', 'vest_knit', '#4B5320', 3, 3, ['smart']),

  // ── B. Parte inferior (20) ───────────────────────────────────────────────
  B('jean_recto', 'Jean azul recto clásico', 'bottom', 'jeans', '#1F4E79', 2, 2, ['casual']),
  B('jean_claro', 'Jean azul claro desgastado', 'bottom', 'jeans', '#5D8AA8', 2, 2, ['casual']),
  B('jean_negro', 'Jean negro slim', 'bottom', 'jeans', '#1A1A1A', 2, 2, ['casual']),
  B('jean_baggy', 'Jean baggy', 'bottom', 'pants_wide', '#1F4E79', 2, 2, ['casual']),
  B('jean_wide', 'Jean wide leg acampanado', 'bottom', 'pants_wide', '#5D8AA8', 2, 2, ['casual']),
  B('cargo', 'Pantalón cargo con bolsillos', 'bottom', 'cargo', '#4B5320', 2, 2, ['casual']),
  B('jogger', 'Jogger de algodón con puño', 'bottom', 'jogger', '#8E8E93', 2, 1, ['sport']),
  B('chino_beige', 'Pantalón chino beige', 'bottom', 'chino', '#D8C4B6', 2, 3, ['smart']),
  B('sastre', 'Pantalón sastre pinzado', 'bottom', 'chino:suit', '#1A1A1A', 2, 4, ['formal', 'smart']),
  B('lino', 'Pantalón de lino relajado', 'bottom', 'chino', '#FFFFFF', 1, 3, ['smart', 'summer']),
  B('short_jean', 'Short de jean clásico', 'bottom', 'shorts', '#5D8AA8', 1, 2, ['summer']),
  B('short_cargo', 'Short cargo de gabardina', 'bottom', 'shorts:cargo', '#4B5320', 1, 2, ['summer']),
  B('short_run', 'Short deportivo de running', 'bottom', 'shorts_sport', '#1A1A1A', 1, 1, ['sport', 'summer']),
  B('biker', 'Biker short de licra', 'bottom', 'shorts:tight', '#1A1A1A', 1, 1, ['sport', 'summer'], 'fem'),
  B('bermuda', 'Bermuda de lino veraniega', 'bottom', 'shorts', '#D8C4B6', 1, 3, ['summer']),
  B('falda_tablas', 'Falda corta de tablas', 'bottom', 'skirt', '#3A3A3C', 1, 2, ['summer'], 'fem'),
  B('falda_denim', 'Falda vaquera midi', 'bottom', 'skirt:midi', '#5D8AA8', 1, 2, ['summer'], 'fem'),
  B('falda_satin', 'Falda satinada larga', 'bottom', 'skirt_long', '#6B1724', 1, 3, ['night'], 'fem'),
  B('leggings', 'Leggings deportivas', 'bottom', 'leggings', '#1A1A1A', 1, 1, ['sport'], 'fem'),
  B('parachute', 'Pantalón parachute urbano', 'bottom', 'cargo', '#4B5320', 2, 2, ['casual']),

  // ── C. Capa / abrigo (12) ────────────────────────────────────────────────
  B('casaca_denim', 'Casaca de jean oversize', 'layer', 'denim_jacket', '#5D8AA8', 2, 2, ['casual']),
  B('bomber', 'Casaca bomber', 'layer', 'bomber', '#4B5320', 3, 2, ['casual']),
  B('cuero', 'Casaca de cuero biker', 'layer', 'leather_jacket', '#1A1A1A', 3, 3, ['night']),
  B('cortaviento', 'Cortaviento impermeable', 'layer', 'bomber:wind', '#B22222', 2, 1, ['sport']),
  B('puffer', 'Casaca acolchada puffer', 'layer', 'puffer', '#1A1A1A', 4, 2, ['thermal']),
  B('abrigo_pano', 'Abrigo largo de paño', 'layer', 'coat', '#3A3A3C', 4, 4, ['thermal', 'formal']),
  B('blazer', 'Blazer casual estructurado', 'layer', 'blazer', '#1A1A1A', 3, 4, ['smart']),
  B('gabardina', 'Gabardina clásica', 'layer', 'coat:trench', '#D8C4B6', 3, 4, ['smart']),
  B('cardigan_largo', 'Cardigan largo sin botones', 'layer', 'cardigan:long', '#8E8E93', 3, 2, ['casual']),
  B('parka', 'Parka con capucha', 'layer', 'puffer:parka', '#4B5320', 4, 2, ['thermal']),
  B('chaleco_puffer', 'Chaleco acolchado puffer', 'layer', 'puffer:vest', '#1A1A1A', 3, 2, ['thermal']),
  B('sobrecamisa', 'Sobrecamisa gruesa de pana', 'layer', 'shirt:overshirt', '#4A2E18', 3, 2, ['casual']),

  // ── D. Calzado (15) ──────────────────────────────────────────────────────
  B('zapas_blancas', 'Zapatillas blancas urbanas', 'shoes', 'sneaker', '#FFFFFF', 1, 2, ['casual']),
  B('converse', 'Zapatillas de lona altas', 'shoes', 'high_top', '#1A1A1A', 1, 2, ['casual']),
  B('chunky', 'Zapatillas chunky', 'shoes', 'sneaker:chunky', '#8E8E93', 2, 2, ['casual']),
  B('running', 'Zapatillas de running', 'shoes', 'runner', '#1F4E79', 2, 1, ['sport']),
  B('skate', 'Zapatillas de skate planas', 'shoes', 'sneaker:skate', '#4A2E18', 2, 2, ['casual']),
  B('chelsea', 'Botines Chelsea de cuero', 'shoes', 'boot_chelsea', '#1A1A1A', 2, 3, ['smart']),
  B('combat', 'Botas altas estilo militar', 'shoes', 'boot_combat', '#4A2E18', 3, 2, ['casual']),
  B('western', 'Botas vaqueras de caña media', 'shoes', 'boot_western', '#4A2E18', 3, 2, ['casual']),
  B('mocasines', 'Mocasines clásicos de cuero', 'shoes', 'loafer', '#4A2E18', 2, 3, ['smart']),
  B('oxford', 'Zapatos de vestir Oxford', 'shoes', 'loafer:oxford', '#1A1A1A', 2, 4, ['formal']),
  B('sandalias', 'Sandalias planas', 'shoes', 'sandal', '#D8C4B6', 1, 2, ['summer']),
  B('sandalias_plataforma', 'Sandalias de plataforma', 'shoes', 'sandal:platform', '#1A1A1A', 1, 3, ['summer', 'night'], 'fem'),
  B('chancletas', 'Chancletas de goma', 'shoes', 'sandal:slide', '#F4C2C2', 1, 1, ['summer', 'home', 'beach']),
  B('tacones', 'Zapatos de tacón medio', 'shoes', 'heel', '#1A1A1A', 1, 4, ['night', 'gala'], 'fem'),
  B('alpargatas', 'Alpargatas de esparto', 'shoes', 'espadrille', '#D8C4B6', 1, 2, ['summer']),

  // ── E. Una pieza (8) ─────────────────────────────────────────────────────
  B('vestido_tirantes', 'Vestido corto de verano', 'onepiece', 'dress_short', '#F4C2C2', 1, 3, ['summer', 'date'], 'fem'),
  B('vestido_camisero', 'Vestido camisero casual', 'onepiece', 'dress_shirt', '#D8C4B6', 2, 3, ['date', 'smart'], 'fem'),
  B('vestido_floreado', 'Vestido midi floreado', 'onepiece', 'dress_midi', '#BDB0D0', 1, 3, ['summer', 'date'], 'fem', true),
  B('vestido_negro', 'Vestido negro de noche', 'onepiece', 'dress_night', '#1A1A1A', 1, 4, ['night', 'gala'], 'fem'),
  B('vestido_canal', 'Vestido ajustado canalé', 'onepiece', 'dress_night:rib', '#6B1724', 2, 3, ['date', 'night'], 'fem'),
  B('enterizo_largo', 'Enterizo largo con lazo', 'onepiece', 'jumpsuit_long', '#1B4332', 2, 3, ['date'], 'fem'),
  B('enterizo_corto', 'Enterizo corto playero', 'onepiece', 'jumpsuit_short', '#D4A017', 1, 2, ['summer', 'beach'], 'fem'),
  B('mono_utility', 'Mono utilitario de gabardina', 'onepiece', 'jumpsuit_long:utility', '#4B5320', 2, 2, ['casual']),
];

/** Índice por clave para accesos O(1). */
export const BASIC_BY_KEY: Record<string, BasicItem> = Object.fromEntries(
  ALL_BASICS.map((b) => [b.key, b]),
);

let idCounter = 0;

/** Construye una prenda del armario a partir de un básico del catálogo. */
export function garmentFromBasic(
  basic: BasicItem,
  overrides: Partial<Garment> = {},
  createdAt = Date.now(),
): Garment {
  idCounter += 1;
  return {
    id: overrides.id ?? `g-${basic.key}-${idCounter}`,
    slot: basic.slot,
    name: basic.name,
    silhouette: basic.shape,
    source: 'basic',
    colorHex: basic.colorHex,
    colorName: basic.colorName,
    colorFamily: isNeutralColor(basic.colorHex) ? 'neutral' : 'accent',
    hasPattern: basic.hasPattern ?? false,
    warmth: basic.warmth,
    formality: basic.formality,
    tags: [...basic.tags],
    isFavorite: false,
    isArchived: false,
    isLaundry: false,
    createdAt,
    basicKey: basic.key,
    ...overrides,
  };
}
