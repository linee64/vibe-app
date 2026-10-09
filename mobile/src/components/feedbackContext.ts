import { createContext, useContext } from 'react'

/** Открыть лист «Отзыв» из любого экрана: useFeedback().open('profile') */
export const FeedbackCtx = createContext<{ open: (entry?: string) => void }>({ open: () => {} })
export const useFeedback = () => useContext(FeedbackCtx)
