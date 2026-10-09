# Архитектура Вайбика

Коротко о том, как устроен репозиторий: два клиента (веб и мобильное приложение) на одном контенте,
тонкий бэкенд из Vercel Functions и Supabase. Без переменных окружения всё работает в демо-режиме.

## Папки

```
src/                 веб-приложение (Vite + React 19 + Tailwind v4)
  data/              ← общий контент и чистая логика (без DOM): курс, упражнения, экономика, тиры, тарифы
    units/           уроки разделов u1…u5
  homework/          симуляторы домашек (sims.ts), мост ИИ → симулятор (ai.ts), превью (только веб)
  i18n/              языки: UI-каталоги (ui/), переводы курса (content/), домашек (homework/)
  components/        UI веба; exercises/ — 8 типов упражнений
  screens/           экраны (лендинг, путь, урок, домашка, профиль…)
  lib/               конфиг по env, Supabase, синхронизация прогресса, ИИ-проверка, оплата, аналитика, Sentry
  store.tsx          состояние ученика (сессия + прогресс) и сохранение в localStorage
api/                 Vercel Functions: ai/review, billing/{checkout,portal,webhook}, feedback, health
server/              логика функций: токен Supabase, лимиты, DeepSeek, Polar, отзывы, Sentry
supabase/            миграции (таблицы, RLS, функции) и SQL-тесты RLS
mobile/              React Native (Expo) — см. mobile/README.md
tests/               unit-тесты vitest: api/ (функции) и client/ (логика клиента)
scripts/
  validate/          проверки без браузера: контент курса, домашки, переводы
  e2e/               Playwright: полное прохождение курса, смоук языка; lib/ — общий «решатель»
  shots/             Playwright: скриншоты → .artifacts/screenshots/ (не в git)
docs/                техническая документация и картинки для README
```

## Поток данных

1. **Контент** — TypeScript-модули в `src/data/`. Перед показом варианты ответов детерминированно
   перемешиваются (`prepareExercise`), проверка ответа — `isCorrect` в `src/data/exerciseLogic.ts`.
2. **Язык** — русский текст в `src/data/` — источник. `src/i18n/runtime.ts` при смене языка подменяет
   «живые» данные курса переводами из `src/i18n/content/<lang>/`; отпечатки (`fingerprints.ts`) ловят
   правку русского источника без обновления переводов (`npm run validate:i18n`).
3. **Прогресс** — `src/store.tsx` хранит его в `localStorage` (`vaibik.progress`). Со входом через Supabase
   прогресс синхронизируется с таблицей `progress` (`src/lib/progressSync.ts`): счётчики — максимум,
   множества — объединение, заряд — минимум, так что с двух устройств ничего не теряется.
4. **Домашки** — промпт разбирается офлайн-симулятором (`src/homework/sims.ts`). Если настроен бэкенд,
   `POST /api/ai/review` (DeepSeek на сервере) может только **добавить** выполненные требования
   (`mergeAiIntoPrompt`), но не отменить засчитанное симулятором. При ошибке или лимите — снова симуляция.
5. **Оплата** — веб: Polar (`/api/billing/*`), вебхук пишет статус в таблицу `subscriptions`.
   Мобильное приложение: покупки в сторах через RevenueCat (см. `mobile/SETUP-MOBILE.md`).

## Демо-режим и настоящий режим

Режим определяется только переменными окружения (`.env.example`, пошагово — `SETUP.md`):

| | Демо (ничего не задано) | С переменными |
|---|---|---|
| Вход | любой email и пароль, всё локально | Supabase Auth |
| Прогресс | `localStorage` / AsyncStorage | + таблица `progress` в Supabase |
| Домашки | офлайн-симуляция ИИ | `/api/ai/review` (DeepSeek), при сбое — симуляция |
| Оплата | демо-кнопки | Polar (веб), RevenueCat (мобилка) |
| Аналитика / ошибки | выключены | PostHog / Sentry, без личных данных |

`VITE_REVIEW_MODE` (по умолчанию `true`) открывает все тиры и прячет пейвол — для ревью. Перед запуском — `false`.
Секретные ключи (DeepSeek, Polar, service role Supabase) живут только на сервере; клиенты знают лишь публичные.

## Веб и мобилка: общий контент

Мобильное приложение не копирует курс. `mobile/metro.config.js` добавляет `../src` в `watchFolders` и
резолвит алиас `@web/*` → `src/*`, так что `src/data/**`, `src/homework/{sims,ai}.ts`, `src/i18n/**` и
синхронизация прогресса — один и тот же код. Два веб-модуля, завязанные на Vite и браузер
(`src/lib/config.ts`, `src/lib/supabase.ts`), при сборке мобилки подменяются адаптерами из
`mobile/src/lib/web-adapters/` (та же подмена — в `mobile/jest.resolver.js`). Поэтому код в `src/data/`
и `src/homework/sims.ts` не должен импортировать DOM, React DOM или `import.meta.env` напрямую.
