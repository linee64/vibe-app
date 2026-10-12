import { useEffect } from 'react'
import { useStore } from '../store'
import { t } from '../i18n/core'
import { REMIND_SHOWN_KEY, shouldRemind, useRemindersOn } from './prefs'

const localDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Вечернее напоминание: раз в день, если включено, разрешено браузером и сегодня ещё не занимались */
export function useDailyReminder() {
  const { progress } = useStore()
  const on = useRemindersOn()
  const todayXp = progress.todayXp
  useEffect(() => {
    if (!on || typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const check = () => {
      const now = new Date()
      const day = localDay(now)
      let last: string | null = null
      try {
        last = localStorage.getItem(REMIND_SHOWN_KEY)
      } catch {
        /* нет хранилища */
      }
      if (!shouldRemind({ on, todayXp, now, lastShown: last, day })) return
      try {
        localStorage.setItem(REMIND_SHOWN_KEY, day)
        new Notification(t('settings.remindTitle'), { body: t('settings.remindBody'), icon: '/favicon.svg', tag: 'vaibik-reminder' })
      } catch {
        /* мобильные браузеры без конструктора Notification — тихо пропускаем */
      }
    }
    check()
    const id = window.setInterval(check, 10 * 60 * 1000)
    return () => window.clearInterval(id)
  }, [on, todayXp])
}
