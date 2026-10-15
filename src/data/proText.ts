/** Тексты статуса Pro (веб и приложение) — поверх чистой логики proStatus.ts */
import { formatDate, t } from '../i18n/core'
import { proLine, type ProSource, type ProStatus } from './proStatus'

const DATE: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
export const proDate = (iso: string | null | undefined) => (iso ? formatDate(iso, DATE).replace(/ г\.$/, '') : '')

export const proPlanName = (s: ProStatus) => (s.plan === 'annual' ? t('pro.plan.annual') : s.plan === 'monthly' ? t('pro.plan.monthly') : '')

export const proStateName = (s: ProStatus) => (s.state ? t(`pro.state.${s.state}`) : '')

export const proViaName = (src: ProSource | null) => (src ? t(`pro.via.${src}`) : '')

/** «Продлится 15 октября 2027» / «Пробный период до …» / «Подписка отменена · Pro до …» */
export function proLineText(s: ProStatus): string {
  const l = proLine(s)
  switch (l.kind) {
    case 'trial':
      return t('pro.trialUntil', { date: proDate(l.date) })
    case 'renews':
      return t('pro.renews', { date: proDate(l.date) })
    case 'until':
      return t('pro.until', { date: proDate(l.date) })
    case 'pastDue':
      return t('pro.pastDue')
    default:
      return ''
  }
}

/** «Годовой тариф · Продлится 15 октября 2027» */
export const proSummary = (s: ProStatus) => [proPlanName(s), proLineText(s)].filter(Boolean).join(' · ')

/** «отменена · действует до …» для строки «Статус» в настройках */
export function proStateLine(s: ProStatus): string {
  const name = proStateName(s)
  if (s.state === 'cancelled' && s.periodEnd) return `${name} · ${t('pro.validUntil', { date: proDate(s.periodEnd) })}`
  if (s.state === 'trialing' && (s.trialEnd ?? s.periodEnd)) return `${name} · ${t('pro.validUntil', { date: proDate(s.trialEnd ?? s.periodEnd) })}`
  if (s.state === 'active' && s.periodEnd) return `${name} · ${t('pro.renews', { date: proDate(s.periodEnd) })}`
  return name
}
