import { describe, expect, it } from 'vitest';

import { shouldCloseSheet } from '@/components/ui/sheetGesture';

describe('arrastre de la hoja', () => {
  it('cierra al arrastrar lejos o soltar rápido hacia abajo', () => {
    expect(shouldCloseSheet(97, 0)).toBe(true);
    expect(shouldCloseSheet(20, 901)).toBe(true);
  });

  it('vuelve a su sitio tras un movimiento corto o hacia arriba', () => {
    expect(shouldCloseSheet(96, 900)).toBe(false);
    expect(shouldCloseSheet(-20, 1200)).toBe(false);
  });
});
