import { Tabs } from 'expo-router'
import { BottomNav, TopBar } from '../../components/Shell'
import { C } from '../../theme'

/** Вкладки как в вебе: Путь · Задания · Лига · Профиль · Ещё (+ скрытые экраны внутри той же оболочки) */
export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <BottomNav {...props} />} screenOptions={{ header: () => <TopBar />, sceneStyle: { backgroundColor: C.white }, animation: 'none' }}>
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="quests" />
      <Tabs.Screen name="league" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="more" />
      <Tabs.Screen name="wardrobe" options={{ href: null }} />
      <Tabs.Screen name="glossary" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="help" options={{ href: null }} />
    </Tabs>
  )
}
