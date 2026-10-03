/**
 * HapticsService (§6.3): feedback táctil diferenciado por momento del giro.
 * En web es un no-op silencioso; en iOS/Android se apoya en expo-haptics.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let enabled = true;

export function setHapticsEnabled(value: boolean) {
  enabled = value;
}

function safe(run: () => Promise<unknown>) {
  if (!enabled || Platform.OS === 'web') return;
  try {
    run().catch(() => undefined);
  } catch {
    // Nunca interrumpir la experiencia por un fallo de vibración.
  }
}

/** Inicio del giro: impacto ligero. */
export function hapticSpinStart() {
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Crucero del carrete: micro tic suave. */
export function hapticTick() {
  safe(() => Haptics.selectionAsync());
}

/** Parada de un carrete: pulso medio. */
export function hapticReelStop() {
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

/** Finalización total del giro: confirmación de éxito. */
export function hapticSuccess() {
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

/** Bloqueo del candado: pulso rígido y seco. */
export function hapticLock() {
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid));
}

/** Toques genéricos de UI (chips, botones secundarios). */
export function hapticTap() {
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft));
}
