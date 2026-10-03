/**
 * Paleta de teñido de 16 colores estándar (§10.2).
 * Los nombres se usan en la UI ("Hoodie oversize gris melange").
 */

export interface ColorOption {
  hex: string;
  name: string;
}

export const COLOR_PALETTE: ColorOption[] = [
  { hex: '#FFFFFF', name: 'Blanco puro' },
  { hex: '#1A1A1A', name: 'Negro azabache' },
  { hex: '#8E8E93', name: 'Gris melange' },
  { hex: '#3A3A3C', name: 'Gris marengo' },
  { hex: '#5D8AA8', name: 'Azul denim claro' },
  { hex: '#1F4E79', name: 'Azul denim clásico' },
  { hex: '#0B1B3D', name: 'Azul marino' },
  { hex: '#D8C4B6', name: 'Beige arena' },
  { hex: '#4A2E18', name: 'Marrón chocolate' },
  { hex: '#4B5320', name: 'Verde militar' },
  { hex: '#1B4332', name: 'Verde botella' },
  { hex: '#6B1724', name: 'Rojo borgoña' },
  { hex: '#B22222', name: 'Rojo carmín' },
  { hex: '#F4C2C2', name: 'Rosa pastel' },
  { hex: '#D4A017', name: 'Amarillo mostaza' },
  { hex: '#BDB0D0', name: 'Lavanda suave' },
];

export function colorNameFor(hex: string): string {
  const found = COLOR_PALETTE.find((c) => c.hex.toUpperCase() === hex.toUpperCase());
  return found ? found.name : 'Color personalizado';
}
