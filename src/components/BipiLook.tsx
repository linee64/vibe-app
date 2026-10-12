import { useMemo, type ReactNode } from 'react'
import { lookOf } from '../data/skins'
import { useStore } from '../store'
import { MascotLookContext } from './mascotLook'

/** Передаёт надетые вещи всем <Mascot /> и <MascotHead /> приложения */
export function BipiLookProvider({ children }: { children: ReactNode }) {
  const { progress } = useStore()
  const skins = progress.skins
  const look = useMemo(() => lookOf(skins), [skins])
  return <MascotLookContext.Provider value={look}>{children}</MascotLookContext.Provider>
}
