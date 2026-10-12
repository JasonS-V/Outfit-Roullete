/**
 * Confirmación destructiva compatible con web.
 * En nativo usa Alert; en web usa window.confirm (Alert no existe en RN Web).
 */

import { Alert, Platform } from 'react-native';
import { translate, type Language } from '@/localization';

export function confirmDestructive(title: string, message: string, confirmLabel = 'Eliminar', language: Language = 'es'): Promise<boolean> {
  title = translate(title, language);
  message = translate(message, language);
  confirmLabel = translate(confirmLabel, language);
  if (Platform.OS === 'web') {
    const ok = globalThis.confirm ? globalThis.confirm(`${title}\n\n${message}`) : false;
    return Promise.resolve(ok);
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: translate('Cancelar', language), style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
