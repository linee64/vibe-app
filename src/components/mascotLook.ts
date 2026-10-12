import { createContext, useContext } from 'react'
import type { SkinLook } from '../data/skins'

/** Что сейчас надето на Бипи (из прогресса). Без провайдера — Бипи без вещей (лендинг, экран ошибки). */
export const MascotLookContext = createContext<SkinLook>({})
export const useMascotLook = () => useContext(MascotLookContext)

/** Головные уборы, под которыми антенна Бипи прячется (у наушников и шлема она остаётся) */
export const HIDES_ANTENNA = new Set(['cap', 'top-hat', 'wizard-hat', 'crown', 'hacker-hood'])
