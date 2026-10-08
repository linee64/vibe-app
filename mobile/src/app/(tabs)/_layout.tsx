import { Tabs } from 'expo-router'
import { Text } from 'react-native'
import { C, font } from '../../theme'

const Icon = ({ emoji, focused }: { emoji: string; focused: boolean }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: C.brand, tabBarInactiveTintColor: C.muted, tabBarStyle: { backgroundColor: C.white, borderTopColor: C.line, borderTopWidth: 2, height: 64, paddingBottom: 8, paddingTop: 6 }, tabBarLabelStyle: font(800, 11), tabBarPosition: 'bottom' }}>
      <Tabs.Screen name="learn" options={{ title: 'Путь', tabBarIcon: ({ focused }) => <Icon emoji="🗺️" focused={focused} /> }} />
      <Tabs.Screen name="league" options={{ title: 'Лига', tabBarIcon: ({ focused }) => <Icon emoji="🏆" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Профиль', tabBarIcon: ({ focused }) => <Icon emoji="👾" focused={focused} /> }} />
    </Tabs>
  )
}
