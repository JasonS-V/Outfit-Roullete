/**
 * Layout raíz · fuentes, proveedores y pila de navegación.
 */

import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider, useToast } from '@/components/ui/Toast';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Sheet } from '@/components/ui/Sheet';
import { AppProvider, useApp } from '@/context/AppContext';
import { KO_FI_URL } from '@/services/donation';
import { useAppFonts } from '@/theme/fonts';
import { useTheme } from '@/theme';
import { useLanguage } from '@/localization';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loaded, error } = useAppFonts();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <AppNavigation />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppNavigation() {
  const { colors, mode } = useTheme();
  const language = useLanguage();
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = language;
  }, [language]);
  const base = mode === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <ToastProvider>
      <ThemeProvider value={{ ...base, colors: { ...base.colors, background: colors.bg, card: colors.surfaceRaised, text: colors.ink, border: colors.line, primary: colors.chicle } }}>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="garment/new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack>
        <DonationPrompt />
      </ThemeProvider>
    </ToastProvider>
  );
}

function DonationPrompt() {
  const { donationPrompt, dismissDonationPrompt } = useApp();
  const { colors, spacing } = useTheme();
  const { showToast } = useToast();
  const [visiblePrompt, setVisiblePrompt] = useState(false);

  const close = () => {
    setVisiblePrompt(false);
  };

  useEffect(() => {
    if (!donationPrompt) return;
    dismissDonationPrompt();
    showToast({
      text: '¿Te gusta Outfit Roulette? Puedes apoyarlo en Ko-fi.',
      actionLabel: 'Ver más',
      onAction: () => setVisiblePrompt(true),
    });
  }, [donationPrompt, dismissDonationPrompt, showToast]);

  return (
    <Sheet visible={visiblePrompt} onClose={close} title="Apoya el proyecto">
      <View style={{ gap: spacing.four }}>
        <AppText variant="body" color={colors.inkSoft}>
          Si quieres apoyar el desarrollo de Outfit Roulette, puedes hacerlo en Ko-fi.
        </AppText>
        <AppText variant="micro" color={colors.inkSoft}>
          La donación es opcional. Puedes seguir usando todas las funciones gratis.
        </AppText>
        <PrimaryButton
          label="Apoyar en Ko-fi"
          accessibilityHint="Abre Ko-fi en tu navegador"
          onPress={async () => {
            close();
            try {
              await Linking.openURL(KO_FI_URL);
            } catch {
              showToast({ text: 'No se pudo abrir Ko-fi. Inténtalo de nuevo.' });
            }
          }}
        />
        <PrimaryButton label="Ahora no" variant="ghost" onPress={close} />
      </View>
    </Sheet>
  );
}
