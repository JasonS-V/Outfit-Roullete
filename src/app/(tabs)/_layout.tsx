import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HangerIcon, RouletteIcon, SlidersIcon, StarIcon } from '@/components/ui/icons';
import { translate, useLanguage } from '@/localization';
import { fontFamily, useTheme } from '@/theme';

export default function TabLayout() {
  const { colors } = useTheme();
  const language = useLanguage();
  const { bottom } = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: reducedMotion ? 'none' : 'shift',
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarActiveBackgroundColor: colors.surface,
        tabBarItemStyle: { borderRadius: 12, overflow: 'hidden', marginHorizontal: 4 },
        tabBarStyle: {
          backgroundColor: colors.surfaceRaised,
          width: '100%',
          maxWidth: 720,
          alignSelf: 'center',
          borderTopColor: colors.line,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 68 + bottom,
          paddingTop: 4,
          paddingBottom: 4 + bottom,
        },
        tabBarLabelStyle: { fontFamily: fontFamily.semiBold, fontSize: 11, lineHeight: 15 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: translate('Hoy', language), tabBarIcon: ({ color, focused }) => <RouletteIcon color={String(color)} size={24} strokeWidth={focused ? 2.2 : 1.7} /> }} />
      <Tabs.Screen name="wardrobe" options={{ title: translate('Armario', language), tabBarIcon: ({ color, focused }) => <HangerIcon color={String(color)} size={24} strokeWidth={focused ? 2.2 : 1.7} /> }} />
      <Tabs.Screen name="lookbook" options={{ title: translate('Guardados', language), tabBarIcon: ({ color, focused }) => <StarIcon color={String(color)} size={24} strokeWidth={focused ? 2.2 : 1.7} /> }} />
      <Tabs.Screen name="profile" options={{ title: translate('Ajustes', language), tabBarIcon: ({ color, focused }) => <SlidersIcon color={String(color)} size={24} strokeWidth={focused ? 2.2 : 1.7} /> }} />
    </Tabs>
  );
}
