import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { Text, View } from 'react-native'
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { C, font } from '../theme'

const Ctx = createContext<(msg: string) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<{ id: number; text: string } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const insets = useSafeAreaInsets()
  const show = useCallback((text: string) => {
    if (timer.current) clearTimeout(timer.current)
    setMsg({ id: Date.now(), text })
    timer.current = setTimeout(() => setMsg(null), 2400)
  }, [])
  return (
    <Ctx.Provider value={show}>
      {children}
      {msg && (
        <View pointerEvents="none" style={{ position: 'absolute', left: 16, right: 16, top: insets.top + 10, alignItems: 'center' }}>
          <Animated.View key={msg.id} entering={FadeInDown.springify()} exiting={FadeOutUp} style={{ backgroundColor: C.ink, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 11 }}>
            <Text style={font(800, 14, C.white)}>{msg.text}</Text>
          </Animated.View>
        </View>
      )}
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
