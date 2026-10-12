import { describe, expect, it } from 'vitest';
import { ALL_BASICS } from '../src/data/catalog';
import { COLOR_PALETTE } from '../src/data/palette';
import { translate, translateChildren } from '../src/localization';

describe('English UI', () => {
  it('translates all catalog item and color names without changing stored data', () => {
    for (const item of ALL_BASICS) expect(translate(item.name, 'en')).not.toBe(item.name);
    for (const color of COLOR_PALETTE) expect(translate(color.name, 'en')).not.toBe(color.name);
    expect(translate(ALL_BASICS[0].name, 'es')).toBe(ALL_BASICS[0].name);
  });

  it('translates live counts and leaves unknown user names untouched', () => {
    expect(translateChildren(['Toca las prendas que se parecen a las tuyas. Llevas ', 3, ' de ', 9, ' recomendadas.'], 'en'))
      .toBe('Tap items like yours. You’ve chosen 3 of 9 recommended.');
    expect(translate('2 prendas para combinar', 'en')).toBe('2 items to combine');
    expect(translate('3 combinaciones que te gustaron', 'en')).toBe('3 outfits you liked');
    expect(translate('Tu prenda más usada: Polo básico cuello redondo (2 usos)', 'en'))
      .toBe('Most worn item: Basic crew-neck T-shirt (2 wears)');
    expect(translate('SUPERIOR', 'en')).toBe('TOPS');
    expect(translate('Mi camiseta favorita', 'en')).toBe('Mi camiseta favorita');
    expect(translate('toString', 'en')).toBe('toString');
  });

  it('explains the optional donation in English', () => {
    expect(translate('La donación es opcional. Puedes seguir usando todas las funciones gratis.', 'en'))
      .toBe('Donating is optional. You can keep using every feature for free.');
    expect(translate('Apoyar en Ko-fi', 'en')).toBe('Support on Ko-fi');
  });
});
