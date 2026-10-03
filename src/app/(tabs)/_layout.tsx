/**
 * Pestañas inferiores (4 destinos reales, §4).
 * Íconos dibujados en el mismo lenguaje de trazo que las siluetas.
 */

import { Tabs } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

type TabName = 'roulette' | 'hanger' | 'looks' | 'me';

function TabIcon({ name, color }: { name: TabName; color: string }) {
  const stroke = { stroke: color, strokeWidth: 2, fill: 'none' as const, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      {name === 'roulette' ? (
        <>
          <Circle cx={12} cy={12} r={8.6} {...stroke} />
          <Path d="M12 12 L12 3.4 M12 12 L20.6 12 M12 12 L5.9 18.6 M12 12 L18.1 18.6" {...stroke} strokeWidth={1.7} />
          <Circle cx={12} cy={12} r={1.9} fill={color} />
        </>
      ) : null}
      {name === 'hanger' ? (
        <>
          <Path d="M12.4 6.6 a2.3 2.3 0 1 1 2.3 2.3 L12 11" {...stroke} />
          <Path d="M12 11 L4.4 16.8 Q3.2 17.9 4.7 18.7 L19.3 18.7 Q20.8 17.9 19.6 16.8 Z" {...stroke} />
        </>
      ) : null}
      {name === 'looks' ? (
        <Path
          d="M12 3.8 l2.4 5 5.5 0.8 -4 3.9 1 5.5 -4.9 -2.6 -4.9 2.6 1 -5.5 -4 -3.9 5.5 -0.8 Z"
          {...stroke}
        />
      ) : null}
      {name === 'me' ? (
        <>
          <Circle cx={12} cy={8.3} r={3.5} {...stroke} />
          <Path d="M5.2 20 Q12 14.4 18.8 20" {...stroke} />
        </>
      ) : null}
    </Svg>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.chicle,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.line,
          height: 62,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Figtree_600SemiBold',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ruleta',
          tabBarIcon: ({ color }) => <TabIcon name="roulette" color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: 'Armario',
          tabBarIcon: ({ color }) => <TabIcon name="hanger" color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="lookbook"
        options={{
          title: 'Looks',
          tabBarIcon: ({ color }) => <TabIcon name="looks" color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Yo',
          tabBarIcon: ({ color }) => <TabIcon name="me" color={String(color)} />,
        }}
      />
    </Tabs>
  );
}
