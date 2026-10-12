import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Sheet } from '@/components/ui/Sheet';
import { useLanguage } from '@/localization';
import { fontFamily, useTheme } from '@/theme';

interface SaveLookModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
  isEditing?: boolean;
}

const SUGGESTIONS_ES = ['Casual', 'Oficina', 'Cita', 'Fin de semana', 'Cena'];
const SUGGESTIONS_EN = ['Casual', 'Work', 'Date', 'Weekend', 'Dinner'];

function SaveLookForm({
  initialName = '',
  isEditing = false,
  onSave,
  onClose,
}: {
  initialName?: string;
  isEditing?: boolean;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const { colors, radii, spacing } = useTheme();
  const language = useLanguage();
  const [name, setName] = useState(initialName);

  const suggestions = language === 'en' ? SUGGESTIONS_EN : SUGGESTIONS_ES;

  const handleConfirm = () => {
    onSave(name.trim());
    onClose();
  };

  return (
    <View style={{ gap: spacing.four }}>
      <AppText variant="body" color={colors.inkSoft}>
        {language === 'en'
          ? 'Give this combination a name to easily recognize it in your Lookbook.'
          : 'Ponle un nombre a esta combinación para reconocerla fácilmente en tu Lookbook.'}
      </AppText>

      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: colors.surface,
            borderColor: colors.line,
            borderRadius: radii.md,
          },
        ]}
      >
        <TextInput
          accessibilityLabel={language === 'en' ? 'Outfit name' : 'Nombre del look'}
          value={name}
          onChangeText={setName}
          placeholder={language === 'en' ? 'e.g. Friday Casual, Date Night...' : 'Ej: Casual viernes, Cita, Oficina...'}
          placeholderTextColor={colors.inkSoft}
          maxLength={40}
          autoFocus
          style={[styles.input, { color: colors.ink }]}
        />
      </View>

      <View style={{ gap: spacing.two }}>
        <AppText variant="micro" color={colors.inkSoft}>
          {language === 'en' ? 'Quick suggestions:' : 'Sugerencias rápidas:'}
        </AppText>
        <View style={styles.suggestionsRow}>
          {suggestions.map((sug) => (
            <Chip
              key={sug}
              label={sug}
              selected={name.trim().toLowerCase() === sug.toLowerCase()}
              onPress={() => setName(sug)}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.two, marginTop: spacing.two }}>
        <PrimaryButton
          label={isEditing ? (language === 'en' ? 'Save name' : 'Guardar nombre') : (language === 'en' ? 'Save outfit' : 'Guardar look')}
          onPress={handleConfirm}
        />
        <PrimaryButton
          label={language === 'en' ? 'Cancel' : 'Cancelar'}
          variant="ghost"
          onPress={onClose}
        />
      </View>
    </View>
  );
}

export function SaveLookModal({
  visible,
  onClose,
  onSave,
  initialName = '',
  isEditing = false,
}: SaveLookModalProps) {
  const language = useLanguage();

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={isEditing ? (language === 'en' ? 'Rename outfit' : 'Renombrar look') : (language === 'en' ? 'Name your outfit' : 'Nombrar este look')}
    >
      {visible ? (
        <SaveLookForm
          initialName={initialName}
          isEditing={isEditing}
          onSave={onSave}
          onClose={onClose}
        />
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 48,
    justifyContent: 'center',
  },
  input: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    padding: 0,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
