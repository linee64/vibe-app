# Аналитика Вайбика (PostHog)

Один тонкий слой для веба и мобилки: `track(event, props)` — `src/lib/analytics.ts` (posthog-js, грузится лениво)
и `mobile/src/lib/analytics.ts` (posthog-react-native). Общая логика и список событий — `src/lib/analyticsCore.ts`.

- **Выключено по умолчанию.** Без `VITE_POSTHOG_KEY` / `EXPO_PUBLIC_POSTHOG_KEY` — no-op (в dev событие пишется в консоль `[analytics:off]`).
- **Без личных данных.** Ни email, ни текстов промптов, ни текста отзывов. Ключи свойств — только `snake_case`;
  ключи вида `email/password/token/prompt/message/text…`, строки длиннее 80 символов и строки, похожие на почту/токен,
  отбрасываются (`src/lib/scrub.ts → sanitizeProps`). Из URL убирается query.
- **Идентификация:** `identify(<Supabase user id>)` при входе (только UUID — демо-аккаунты анонимны), `reset()` при выходе.
- **Без автосбора:** `autocapture: false`, ввод в полях не собирается, `capture_pageview: false` (страницы шлём сами как `$pageview` / `$screen`).
- **Запись сессий** выключена; включается только `VITE_POSTHOG_SESSION_RECORDING=true` (все поля и тексты маскируются). В мобилке не включается.
- У каждого события есть `platform` (`web` / `ios` / `android`) и `app_version`.

## Воронка

```
landing_viewed → signup_started → signup_completed / login_completed
  → placement_started → placement_completed (необязательно)
  → lesson_started → exercise_answered… → lesson_completed  (или lesson_abandoned)
  → homework_started → homework_submitted… → homework_passed → tier_unlocked
  → paywall_viewed → checkout_started → checkout_completed / trial_started   (или paywall_closed)
```

Рекомендуемые инсайты в PostHog: Funnel `landing_viewed → signup_completed → lesson_completed → homework_passed → checkout_started → trial_started`;
Retention по `lesson_completed`; Trends `lesson_abandoned` с разбивкой по `reason` и `lesson_id`; доля `paywall_closed` к `paywall_viewed`.

## События

| Событие | Когда | Свойства |
|---|---|---|
| `landing_viewed` | открыт лендинг | `section` (`top` / `pricing`) |
| `signup_started` | нажали «Начать» на лендинге (гость) или вкладку «Регистрация» | `entry` (`landing` / `login`) |
| `signup_completed` | Supabase создал аккаунт | `needs_confirm` |
| `login_completed` | успешный вход | `method` (`password` / `demo`) |
| `logout` | выход | — |
| `placement_started` | начат тест на уровень | `target` (тир), `retry`? |
| `placement_completed` | тест закончен | `target`, `score`, `total`, `passed` |
| `lesson_started` | открыт урок | `lesson_id`, `unit`, `repeat` |
| `exercise_answered` | нажали «Проверить» (или пропуск) | `lesson_id`, `type`, `correct`, `retry`, `skipped` |
| `hint_used` | куплена подсказка | `lesson_id`, `type` |
| `charge_empty` | закончился заряд Бипи | `lesson_id`, `step` |
| `tokens_spent` | потрачены токены | `reason` (`hint` / `recharge`), `amount`, `where`? (`charge_empty` / `shop`) |
| `lesson_completed` | урок пройден | `lesson_id`, `unit`, `mistakes`, `duration_s`, `perfect`, `accuracy`, `repeat` |
| `lesson_abandoned` | ушли из урока, не закончив | `lesson_id`, `unit`, `step`, `duration_s`, `reason` (`quit` / `charge_empty` / `left`), `mistakes` (веб) |
| `homework_started` | открыта домашка | `homework_id`, `unit` |
| `homework_submitted` | отправлен промпт в домашке | `homework_id`, `ai_or_sim`, `iteration`, `requirements_done`, `requirements_total` |
| `homework_passed` | домашка сдана | `homework_id`, `ai_or_sim`, `iterations`, `repeat` |
| `tier_unlocked` | открыт тир | `tier`, `via` (`progress` / `placement`), `completed_tier`? |
| `paywall_viewed` | показан пейвол / тарифы | `source` (`unit_gate` / `pricing` / `paywall`), `unit`? |
| `paywall_closed` | закрыли пейвол без покупки | `source`, `unit`? |
| `checkout_started` | нажали «Оформить» / «Попробовать» | `plan` (`monthly` / `annual`), `source` |
| `checkout_completed` | вернулись из оплаты / покупка в сторе | `plan`? |
| `trial_started` | подписка в статусе trialing | `plan`, `days`? |
| `feedback_opened` | открыт лист «Отзыв» | `entry` (`profile` / `sidebar` / `header` / `landing` / `more`) |
| `feedback_submitted` | отправлен отзыв (в т.ч. микро-опрос) | `rating`, `category`, `source` — **без текста и почты** |
| `micro_prompt_shown` | показан микро-опрос | `source` (`first_lesson` / `paywall_exit` / `homework`) |
| `micro_prompt_dismissed` | микро-опрос закрыт крестиком | `source` |
| `error_screen_shown` | показан экран «Бипи споткнулся» | `route` (веб) / `boundary` (мобилка) |
| `$pageview` / `$screen` | смена экрана | `$current_url` без query (веб) / имя экрана (мобилка) |

Добавить событие: допиши имя в `AnalyticsEvent` (`src/lib/analyticsCore.ts`) и строку в эту таблицу.
