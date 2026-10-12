export function shouldCloseSheet(distance: number, velocity: number): boolean {
  'worklet';
  return distance > 0 && (distance > 96 || velocity > 900);
}
