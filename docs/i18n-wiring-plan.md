# Локализация Вайбика: как устроено (фазы 1–2 выполнены)

Языки: **ru** (источник, встроен в бандл) · **en** · **kk** (кириллица) · **es** (нейтральный, LatAm) · **zh** (zh-CN).
Цены тарифов — всегда USD. Названия событий аналитики — английские, не переводятся.

## Слои

| Слой | Где | Что |
|---|---|---|
| Ядро | `src/i18n/core.ts` | `t(key, params)` с плюралами по `params.n`/`count` (ru one/few/many; en/es/kk one/other; zh other), `formatDate/formatUsd/formatNumber/formatPercent` (Intl), `detectLocale`, `setLocale` (+ `localStorage['vaibik.locale']`), `applyHtmlLang`. Ленивая загрузка каталогов (`import('./ui/<l>')`). Только типы/данные — без React. |
| Разметка | `src/i18n/rich.ts` | `tx(key, params, tags)` — `<0>…</0>` обёртка, `<0/>` элемент, `{name}` ReactNode. Общий для веба и React Native. |
| Контент курса | `src/i18n/content/*` | Пакеты уроков/упражнений/домашек/тиров/магазина по языкам; резолвер накладывает перевод на ru по полям (фолбэк на ru), защищённые поля (id, ответы, код) не переводятся; перемешивание вариантов сидируется ru-заголовком → позиции ответов одинаковые во всех языках. |
| Симуляторы домашек | `src/i18n/homework/sims.ts` | `getLocalizedSims(l)` — ключевые слова = ru ∪ en ∪ язык, реплики ИИ/Бипи на языке ученика. |
| Рантайм | `src/i18n/runtime.ts` | `initLocale()` (сохранённое → язык браузера/телефона → en), `changeLocale()` (явный выбор: сохраняем, шлём `language_changed`), `applyContent()` — подменяет живые данные `UNITS/HOMEWORKS/TIERS/SHOP`, ставит `<html lang>` и `document.title`. |
| React | `src/i18n/react.ts` | `useLocale()` (useSyncExternalStore), `<LocaleKeyed>` — пересоздаёт дерево при смене языка (модульные данные уже подменены). |
| Подписи данных | `src/i18n/labels.ts` | Категории/оценки отзывов, причины отказа на пейволе (`src/data/feedback.ts` остаётся без i18n — его импортирует сервер). |

## UI-каталоги

- `src/i18n/ui/ru.ts` — источник, 984 ключа. Ключи вида `x0abc123` — хэш русского текста (сгенерированы кодмодом),
  семантические — для плюралов, массивов и новых строк (`economy.tokens`, `pricing.afterTrialYear`, `lang.*`, `api.err.*`…).
- `src/i18n/ui/{en,kk,es,zh}.ts` — `satisfies Partial<Record<UIKey, Msg>>`: лишний ключ = ошибка tsc; отсутствующий → фолбэк ru.
- Добавить строку: `t('my.key')` в коде + ключ в `ru.ts` + перевод в 4 каталога → `validate-i18n` проверит
  наличие, плейсхолдеры `{x}`, теги `<0>`, формы плюрала, кириллицу в en/es/zh и «kk = ru».
- Склейки из кусков запрещены: фраза целиком с параметрами (`t('lesson.chargePause', { min })`, `tx('layout.rank', …)`).

## Подключение

**Веб.** `main.tsx`: `initLocale()` до первого рендера; `<LocaleKeyed>` вокруг `FeedbackProvider + App`.
Переключатель `src/components/LanguageSwitcher.tsx` (без флагов, самоназвания: English · Қазақша · Español · 中文 · Русский):
компактный `<select>` в шапке лендинга и на экране входа (на узких экранах — код языка), список-кнопки в профиле.
Все экраны/компоненты/упражнения переведены на `t()`/`tx()`; топ-левел массивы строк превращены в функции
(`FREE_FEATURES()`, `STEP_LABELS()`…), чтобы читать язык при рендере. Даты — `formatDate`, деньги — `formatUsd`.
CSS: `.btn` может переноситься (длинные kk/es), заголовки — `hyphens: auto`, для `:lang(zh)` — `line-break: strict`,
CJK-фолбэк шрифтов.

**Прогресс/профиль.** `Progress.locale` сохраняется в облачный прогресс Supabase (тот же JSON, без миграций);
при входе облачный язык применяется, только если на устройстве нет явного выбора.

**Аналитика.** PostHog: супер-свойство `locale` во всех событиях (веб и мобильное), событие `language_changed {from,to}`.

**ИИ-разбор домашек.** Клиент шлёт `locale` в `/api/ai/review`; `server/review.ts` валидирует (`REVIEW_LOCALES`,
неизвестный → 400) и строит системный промпт `systemPromptFor(locale)`: для ru — прежний промпт байт-в-байт, для
остальных «по-русски» заменено на язык ученика + правило «все тексты (feedback, improved_prompt) — на <язык>».
Канонические фразы `src/homework/ai.ts` остаются русскими: они только «подкармливают» симулятор (его ключи включают ru).

**Мобильное приложение.** `mobile/src/lib/locale.ts`: AsyncStorage → `expo-localization` → en, те же каталоги и контент
через `@web/i18n`. Сплэш держится до загрузки языка; `<LocaleKeyed>` пересоздаёт навигацию, затем возвращаемся на
экран, откуда меняли язык. Переключатель — в профиле (`testID="lang-switcher"`, `lang-xx`). Язык хранится только
локально (AsyncStorage); в облачный прогресс мобильное приложение его пока не пишет (веб — пишет).

## Проверки

- `npm run build`, `npm test` (в т.ч. `tests/client/i18n.test.ts`: плюралы, фолбэк, detectLocale, USD, tx, структура
  уроков = ru, домашки и ИИ-мост в каждом языке), `npm run lint`.
- `npx jiti scripts/validate-i18n.ts`, `npx jiti scripts/validate-content.ts`.
- Прохождение: `VAIBIK_LANG=en node scripts/playthrough.mjs <url>` (весь курс; `scripts/lib/i18n.mjs` переводит подписи
  кнопок для Playwright), смоук языка: `VAIBIK_LANG=kk node scripts/i18n-smoke.mjs <url>` (урок + домашка +
  переполнения на 320/375/1280 + кириллица в en/es/zh + `<html lang>`).
- Скриншоты: `scripts/i18n-shots.mjs` (80–86), `scripts/mobile-i18n-shots.mjs` (87–88, Expo web).

## Рабочие файлы перевода

Вне репозитория, в `/workspace/i18n-work/` (кодмод, `tr/*.json` = `{key: [en, kk, es, zh]}`, генераторы `genru.cjs`,
`gencat.cjs`). Каталоги в репозитории — результат; править можно и прямо в `src/i18n/ui/<l>.ts`.

## Что осталось на потом

- Ревью носителями kk и zh (см. «Спорные места» в `docs/i18n-glossary.md`).
- Хэш-ключи можно переименовать в семантические (механическая замена).
- `index.html`: статические `<title>`/`description` остаются русскими до запуска JS (title меняется в рантайме);
  для SEO по языкам нужен пререндер.
