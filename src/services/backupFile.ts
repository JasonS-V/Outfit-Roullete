import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export async function exportBackupFile(json: string): Promise<void> {
  const name = `outfit-roulette-${new Date().toISOString().slice(0, 10)}.json`;
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  if (!await Sharing.isAvailableAsync()) throw new Error('No se puede compartir en este dispositivo.');
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(json);
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Guardar respaldo' });
}

export async function pickBackupFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (asset.size && asset.size > 10_000_000) throw new Error('El archivo es demasiado grande.');
  const json = Platform.OS === 'web' && asset.file ? await asset.file.text() : await new File(asset.uri).text();
  if (json.length > 10_000_000) throw new Error('El archivo es demasiado grande.');
  return json;
}
