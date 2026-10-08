/**
 * Тарифы Вайбика. Цены в долларах США — ориентир на глобальный рынок
 * (обоснование: docs/pricing-research.md, раздел «Решение: глобальный рынок, USD»).
 * Оплата пока не подключена — кнопки ведут на экран входа.
 *
 * Все суммы храним в центах, чтобы не ловить ошибки округления float.
 */
export const TRIAL_DAYS = 3

export const PRICES = {
  monthly: 999, // $9.99 в месяц
  annual: 5999, // $59.99 в год
}

export const annualPerMonth = Math.round(PRICES.annual / 12) // 500 → $5
export const annualFull = PRICES.monthly * 12 // 11 988 → $119.88
export const annualSavePct = Math.round((1 - PRICES.annual / annualFull) * 100) // 50 %
export const annualSaveAmount = annualFull - PRICES.annual // 5 989 → $59.89

/** Центы → «$9.99»; целые суммы без копеек: 500 → «$5», 0 → «$0». */
export const usd = (cents: number) => {
  const whole = cents % 100 === 0
  const value = (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  })
  return `$${value}`
}

export const FREE_FEATURES = [
  'Раздел «Первый промпт» целиком',
  '5 сердечек — восстанавливаются за день',
  'Серия, XP и лиги',
  'Ежедневные задания',
]

export const PRO_FEATURES = [
  'Все разделы и каждый новый курс',
  'Безлимитные сердечки',
  'ИИ-разбор твоих ошибок и кода',
  'Мини-проекты с проверкой',
  'Заморозка серии, если пропустил день',
]
