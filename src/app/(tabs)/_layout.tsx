import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { HangerIcon, PersonIcon, RouletteIcon, StarIcon } from '@/components/ui/icons';
import { fontFamily, useTheme } from '@/theme';

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.line,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 66,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontFamily: fontFamily.medium, fontSize: 10, letterSpacing: 0.2, marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Ruleta', tabBarIcon: ({ color, focused }) => <RouletteIcon color={String(color)} size={24} strokeWidth={focused ? 2.2 : 1.7} /> }} />
      <Tabs.Screen name="wardrobe" options={{ title: 'Armario', tabBarIcon: ({ color, focused }) => <HangerIcon color={String(color)} size={24} strokeWidth={focused ? 2.2 : 1.7} /> }} />
      <Tabs.Screen name="lookbook" options={{ title: 'Looks', tabBarIcon: ({ color, focused }) => <StarIcon color={String(color)} size={24} strokeWidth={focused ? 2.2 : 1.7} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ color, focused }) => <PersonIcon color={String(color)} size={24} strokeWidth={focused ? 2.2 : 1.7} /> }} />
    </Tabs>
  );
}
