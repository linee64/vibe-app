import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

/** Рамка «браузера» вокруг превью */
export function BrowserFrame({ url, children, right, dark = false }: { url: string; children: ReactNode; right?: ReactNode; dark?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-[18px] border-2 ${dark ? 'border-[#1f1b30] bg-[#272239]' : 'border-line bg-white'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 ${dark ? 'bg-[#1f1b30]' : 'border-b-2 border-line bg-snow'}`}>
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-coral" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gold" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-teal" />
        <span className={`code-font ml-1 min-w-0 flex-1 truncate rounded-lg px-2.5 py-1 text-[11px] ${dark ? 'bg-white/10 text-white/70' : 'bg-white text-muted'}`}>{url}</span>
        {right}
      </div>
      {children}
    </div>
  )
}

/**
 * Рендерит содержимое на фиксированной «десктопной» ширине и масштабирует под колонку —
 * так превью честно показывает десктопную вёрстку (container queries внутри работают по этой ширине).
 */
export function Scaled({ width, children }: { width: number; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ scale: 0.4, h: 300 })
  useLayoutEffect(() => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return
    const measure = () => {
      const scale = Math.min(1, o.clientWidth / width)
      const h = Math.ceil(i.offsetHeight * scale)
      setBox((b) => (Math.abs(b.scale - scale) < 0.001 && b.h === h ? b : { scale, h }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(o)
    ro.observe(i)
    return () => ro.disconnect()
  }, [width])
  return (
    <div ref={outer} className="relative w-full overflow-hidden" style={{ height: box.h }}>
      <div ref={inner} className="@container absolute left-0 top-0" style={{ width, transform: `scale(${box.scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  )
}

/** Телефон с «чёлкой»: контент внутри имеет настоящую узкую ширину */
export function PhoneFrame({ children, warn }: { children: ReactNode; warn?: ReactNode }) {
  return (
    <div className="mx-auto w-[280px] max-w-full rounded-[38px] border-[9px] border-ink bg-ink shadow-[0_8px_0_rgba(47,42,71,.18)]">
      <div className="relative overflow-hidden rounded-[29px] bg-white">
        <div className="absolute left-1/2 top-1.5 z-10 h-[16px] w-[84px] -translate-x-1/2 rounded-full bg-ink" />
        <div className="@container no-scrollbar h-[500px] overflow-y-auto overflow-x-hidden pt-6">{children}</div>
        {warn}
      </div>
    </div>
  )
}
