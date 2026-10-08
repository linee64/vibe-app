import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

type ToastFn = (msg: string) => void
const Ctx = createContext<ToastFn>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<{ text: string; key: number } | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const show = useCallback<ToastFn>((text) => {
    window.clearTimeout(timer.current)
    setMsg({ text, key: Date.now() })
    timer.current = window.setTimeout(() => setMsg(null), 2600)
  }, [])
  return (
    <Ctx.Provider value={show}>
      {children}
      {msg && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex justify-center px-4 md:bottom-8">
          <div
            key={msg.key}
            role="status"
            className="anim-fade-up rounded-2xl bg-ink px-5 py-3.5 text-[15px] font-bold text-white shadow-[0_6px_0_rgba(0,0,0,.15)]"
          >
            {msg.text}
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(Ctx)
