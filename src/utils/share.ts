/**
 * Compartir un outfit (§14.2, versión texto del Sprint 1).
 * El video vertical 9:16 llega en el Sprint 4; aquí se usa la hoja nativa
 * de compartir y, en web, el portapapeles con Web Share API cuando exista.
 */

import { Platform, Share } from 'react-native';

import type { Garment } from '@/engine';

export function outfitShareText(items: Garment[]): string {
  const parts = items.map((g) => `${g.name} (${g.colorName.toLowerCase()})`);
  return `Hoy la ruleta eligió: ${parts.join(' + ')}. ¿Te atreves a girar? #OutfitRoulette`;
}

export async function shareOutfit(items: Garment[]): Promise<'shared' | 'copied' | 'failed'> {
  const message = outfitShareText(items);
  if (Platform.OS === 'web') {
    try {
      const nav = globalThis.navigator as Navigator & {
        share?: (data: { text: string }) => Promise<void>;
      };
      if (typeof nav.share === 'function') {
        await nav.share({ text: message });
        return 'shared';
      }
      if (nav.clipboard) {
        await nav.clipboard.writeText(message);
        return 'copied';
      }
      return 'failed';
    } catch {
      return 'failed';
    }
  }
  try {
    await Share.share({ message });
    return 'shared';
  } catch {
    return 'failed';
  }
}
