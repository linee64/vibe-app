/**
 * Тарифы Вайбика. Цены выбраны по исследованию рынка (docs/pricing-research.md).
 * Оплата пока не подключена — кнопки ведут на экран входа.
 */
export const TRIAL_DAYS = 3

export const PRICES = {
  monthly: 3490, // ₸ в месяц
  annual: 24990, // ₸ в год
}

export const annualPerMonth = Math.round(PRICES.annual / 12) // 2 083 ₸
export const annualFull = PRICES.monthly * 12 // 41 880 ₸
export const annualSavePct = Math.round((1 - PRICES.annual / annualFull) * 100) // 40 %
export const annualSaveAmount = annualFull - PRICES.annual // 16 890 ₸

/** 24990 → «24 990 ₸» (неразрывный пробел между разрядами) */
export const tenge = (n: number) => `${n.toLocaleString('ru-RU').replace(/\s/g, '\u00A0')}\u00A0₸`

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
