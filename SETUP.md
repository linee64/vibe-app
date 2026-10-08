# Вайбик — запуск в прод: пошаговый чек-лист

Код уже готов. Тебе остаётся завести аккаунты, скопировать ключи в Vercel и проверить оплату в тестовом режиме.
Займёт примерно 1–1,5 часа. Иди строго по порядку и ставь галочки.

> **Как это устроено.** Если переменные не заданы, сайт работает в **демо-режиме**: вход по любому email,
> прогресс в браузере, ИИ-симуляция, без оплаты. Каждая интеграция включается **только переменными окружения**:
> задал — заработало, убрал — вернулся демо-режим. Код трогать не нужно.

| Что | Включается переменными | Без них |
|---|---|---|
| Аккаунты и синхронизация прогресса | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (+ серверные `SUPABASE_*`) | демо-вход |
| ИИ-проверка домашек (DeepSeek) | `DEEPSEEK_API_KEY` (+ Supabase) | офлайн-симуляция |
| Оплата Pro (Polar) и пейвол разделов 2–5 | `VITE_BILLING_ENABLED=true` и `POLAR_*` (+ Supabase) | кнопки «скоро» |
| Режим ревью (всё открыто, пейвола нет) | `VITE_REVIEW_MODE` — по умолчанию `true` | — |

**Правило безопасности:** переменные с `VITE_` видны в браузере всем. Секретные ключи (`SUPABASE_SECRET_KEY`,
`DEEPSEEK_API_KEY`, `POLAR_*`) — **только без** `VITE_`. Никогда не коммить `.env` (он уже в `.gitignore`).

---

## 0. Что понадобится

- [ ] Аккаунт GitHub с этим репозиторием (ты пушишь его сам).
- [ ] Аккаунты: [vercel.com](https://vercel.com), [supabase.com](https://supabase.com), [platform.deepseek.com](https://platform.deepseek.com), [polar.sh](https://polar.sh) и [sandbox.polar.sh](https://sandbox.polar.sh) (тестовая песочница — отдельный вход).
- [ ] Блокнот, куда временно складывать ключи (потом удалить).

Порядок: **Supabase → DeepSeek → Vercel (первый деплой) → Polar sandbox → тест → боевой запуск.**

---

## 1. Supabase (база и аккаунты) — 15 минут

1. [ ] **New project.** Регион — ближе к ученикам (например, *Central EU (Frankfurt)*). Пароль базы сохрани.
2. [ ] **Схема базы.** Слева *SQL Editor → New query* → открой файл `supabase/migrations/0001_init.sql`,
   скопируй **весь** текст → *Run*. Должно быть «Success. No rows returned».
   Скрипт можно запускать повторно — данные он не удаляет.
3. [ ] **Проверка.** *Table Editor* → таблицы `profiles`, `progress`, `homework_submissions`, `ai_usage`,
   `subscriptions`, `webhook_events`; у каждой значок «RLS enabled».
4. [ ] **Ключи.** *Project Settings → API Keys*:
   - **Project URL** (`https://xxxx.supabase.co`) → пойдёт в `VITE_SUPABASE_URL` и `SUPABASE_URL`;
   - **Publishable key** (`sb_publishable_…`) → `VITE_SUPABASE_PUBLISHABLE_KEY`;
   - **Secret key** (`sb_secret_…`; если его нет — *Create new secret key*) → `SUPABASE_SECRET_KEY`. **Это секрет!**
   > Старые ключи `anon` / `service_role` не используй: Supabase их выключает. Если по ошибке вставить секретный
   > ключ в `VITE_SUPABASE_PUBLISHABLE_KEY`, приложение само откажется его использовать и напишет об этом в консоли.
5. [ ] **Вход по почте.** *Authentication → Sign In / Providers → Email*: включён, **Confirm email** — включи (рекомендую).
6. [ ] **Адреса возврата из писем.** *Authentication → URL Configuration*:
   - **Site URL** — адрес сайта (пока можно `http://localhost:3000`, после деплоя поменяешь на боевой);
   - **Redirect URLs** — добавь: `http://localhost:3000/**`, `http://localhost:5173/**`,
     `https://<твой-проект>.vercel.app/**` и потом свой домен `https://<домен>/**`.
7. [ ] **Почта (обязательно до запуска для людей).** Встроенная почта Supabase шлёт письма **только участникам
   твоей команды в Supabase** и не больше 2 в час — для теста на своём email хватит, для учеников — нет.
   *Authentication → Emails → SMTP Settings* → подключи свой SMTP (Resend, Brevo, Postmark — у всех есть
   бесплатный тариф). После этого лимит станет 30 писем/час, его можно поднять в *Authentication → Rate Limits*.
8. [ ] (по желанию) *Authentication → Emails → Templates* — переведи письма на русский. Ссылку `{{ .ConfirmationURL }}` не трогай.

---

## 2. DeepSeek (ИИ-ментор) — 5 минут

1. [ ] [platform.deepseek.com](https://platform.deepseek.com) → *Top up* — пополни баланс ($5 хватит надолго).
2. [ ] *API keys → Create new API key* → скопируй (показывается один раз) → `DEEPSEEK_API_KEY`. **Секрет!**

**Сколько стоит.** Одна проверка промпта ≈ 800–950 входных и 250–350 выходных токенов, ответ за ~2 секунды
(замерено на `deepseek-flash`). Это ≈ **$0.0003–0.0007** за проверку, т.е. ~1500–3000 проверок на $1.
Лимиты в сутки (UTC): Free — `AI_DAILY_LIMIT_FREE` (10), Pro — `AI_DAILY_LIMIT_PRO` (100).
Сверх лимита, при ошибке или таймауте домашка спокойно переключается на офлайн-проверку.

---

## 3. Vercel (хостинг сайта и /api) — 15 минут

1. [ ] *Add New → Project → Import* репозиторий `vibe-app`. Framework определится как **Vite**
   (настройки уже в `vercel.json`: сборка `vite build`, папка `dist`, функции из `/api`).
2. [ ] **Environment Variables** — пока только Supabase и DeepSeek (Polar добавим в шаге 4):

   | Переменная | Значение | Секрет? |
   |---|---|---|
   | `VITE_SUPABASE_URL` | Project URL из Supabase | нет |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` | нет |
   | `VITE_REVIEW_MODE` | `true` (пока идёт ревью) | нет |
   | `SUPABASE_URL` | тот же Project URL | нет |
   | `SUPABASE_SECRET_KEY` | `sb_secret_…` | **да** |
   | `DEEPSEEK_API_KEY` | ключ DeepSeek | **да** |
   | `APP_URL` | `https://<проект>.vercel.app` (потом свой домен) | нет |

   Галочки окружений: *Production*, *Preview* и *Development*.
3. [ ] **Deploy.** Открой `https://<проект>.vercel.app/api/health` — должно быть `"supabase":true,"ai":true`.
4. [ ] Вернись в Supabase → *URL Configuration* → **Site URL** = `https://<проект>.vercel.app`.
5. [ ] (по желанию) *Settings → Functions → Function Region* — тот же регион, что у Supabase (меньше задержка).

> **Важно:** переменные `VITE_*` вшиваются в сайт при сборке. Поменял их — нажми *Deployments → … → Redeploy*.
> Серверные переменные тоже применяются только к новым деплоям.

**Локально с бэкендом.** `npm i -g vercel` → `vercel link` → `vercel env pull .env.local` → `vercel dev`
→ http://localhost:3000 (сайт и `/api` вместе). Обычный `npm run dev` без `.env.local` — это демо-режим.
Если фронт и `/api` живут на разных доменах, укажи `VITE_API_BASE=https://<домен-с-api>`, а в `APP_URL` на
сервере — адрес фронта (иначе сервер отклонит запрос с чужого сайта).

---

## 4. Polar — сначала песочница (sandbox) — 20 минут

Песочница — полная копия Polar с фальшивыми деньгами. Аккаунт и организация там **отдельные**.

1. [ ] [sandbox.polar.sh](https://sandbox.polar.sh) → создай организацию «Вайбик».
2. [ ] **Продукты** (*Products → New Product*), два штуки:
   - «Вайбик Pro — месяц»: *Recurring*, *Monthly*, цена **$9.99**, **Enable trial period: 3 days**;
   - «Вайбик Pro — год»: *Recurring*, *Yearly*, цена **$59.99**, **Enable trial period: 3 days**.
   У каждого: *⋯ → Copy ID* → `POLAR_PRODUCT_MONTHLY_ID` и `POLAR_PRODUCT_ANNUAL_ID`.
   > Пробный период задаётся **на продукте**, код его не переопределяет. Интервал оплаты после создания поменять нельзя — только создать новый продукт.
3. [ ] *Settings → Subscriptions* → включи **Prevent trial abuse** (один триал на человека).
   В настройках *Customer portal* оставь клиентам отмену подписки.
4. [ ] **Токен.** *Settings → Developers → New Token*: скоупы **`checkouts:write`** и **`customer_sessions:write`**
   (больше ничего не нужно) → `POLAR_ACCESS_TOKEN` (`polar_oat_…`). **Секрет!**
5. [ ] **Вебхук.** *Settings → Webhooks → Add Endpoint*:
   - URL: `https://<проект>.vercel.app/api/billing/webhook`
   - Format: **Raw**
   - Secret: *Generate* → скопируй → `POLAR_WEBHOOK_SECRET`. **Секрет!**
   - События: все `subscription.*` (created, updated, active, canceled, uncanceled, revoked, past_due).
6. [ ] **Vercel → Environment Variables** — добавь (для *Preview* и *Production*, пока обе на песочнице):

   | Переменная | Значение |
   |---|---|
   | `POLAR_SERVER` | `sandbox` |
   | `POLAR_ACCESS_TOKEN` | `polar_oat_…` |
   | `POLAR_PRODUCT_MONTHLY_ID` | id месячного продукта |
   | `POLAR_PRODUCT_ANNUAL_ID` | id годового продукта |
   | `POLAR_WEBHOOK_SECRET` | секрет вебхука |
   | `VITE_BILLING_ENABLED` | `true` |

7. [ ] *Redeploy* → `/api/health` показывает `"billing":true,"webhook":true,"polarServer":"sandbox"`.

---

## 5. Сквозной тест в песочнице — 15 минут

Для теста пейвола временно поставь `VITE_REVIEW_MODE=false` (лучше только в окружении *Preview*) и сделай Redeploy.

- [ ] **Регистрация.** «Создать аккаунт» → письмо → ссылка → ты в приложении, прогресс с нуля.
  (Ссылку открывай в том же браузере. Если открыл в другом — почта всё равно подтверждена, просто войди.)
- [ ] **Синхронизация.** Пройди урок → открой сайт в другом браузере, войди → урок отмечен.
  В Supabase → *Table Editor → progress* есть строка.
- [ ] **Сброс пароля.** «Забыли пароль?» → письмо → ссылка → экран «Новый пароль» → войти с новым.
- [ ] **ИИ-ментор.** Домашка 1 → напиши промпт своими словами → в чате бейдж «ИИ-ментор · онлайн»,
  советы Бипи списком и кнопка «Вставить улучшенный промпт». В *ai_usage* растёт счётчик.
- [ ] **Лимит.** Временно `AI_DAILY_LIMIT_FREE=1` → вторая проверка → Бипи пишет про лимит и переходит в офлайн.
  Верни значение.
- [ ] **Пейвол.** Урок раздела 2 → экран «… — в Pro» → «Попробовать 3 дня бесплатно» → страница оплаты Polar.
- [ ] **Оплата.** Карта `4242 4242 4242 4242`, любая будущая дата, любой CVC → возврат в профиль,
  тост «Pro включён», карточка «Твой тариф: Pro», «Пробный период до …». В *subscriptions* — `trialing`.
  Разделы 2–5 открываются.
- [ ] **Тарифы на лендинге.** `/#/pricing` → «Попробовать» (месяц/год) ведёт на оплату выбранного тарифа.
- [ ] **Управление.** Профиль → «Управлять подпиской» → портал Polar → отмени → в профиле
  «автопродление выключено». Polar → *Webhooks → Deliveries*: все ответы **202**.
- [ ] Повторная доставка вебхука (*Redeliver*) ничего не ломает — дубли игнорируются.

---

## 6. Боевой запуск (go-live)

1. [ ] **Polar production** — [polar.sh](https://polar.sh): создай организацию заново, пройди проверку аккаунта и
   настрой выплаты (*Finance → Payouts*). Повтори шаг 4 там: **продукты (id будут другие!)**, Prevent trial abuse,
   новый токен, новый вебхук на боевой адрес (новый секрет).
2. [ ] **Vercel → Production** переменные:
   - `POLAR_SERVER=production`, новые `POLAR_ACCESS_TOKEN`, `POLAR_PRODUCT_MONTHLY_ID`, `POLAR_PRODUCT_ANNUAL_ID`, `POLAR_WEBHOOK_SECRET`;
   - **`VITE_REVIEW_MODE=false`** ← включает блокировки тиров и пейвол;
   - `VITE_BILLING_ENABLED=true`;
   - `APP_URL=https://<боевой домен>`.
   В *Preview* можно оставить песочницу — удобно тестировать.
3. [ ] Свой домен: Vercel → *Settings → Domains*. Добавь его в Supabase (*Site URL* и *Redirect URLs*) и в `APP_URL`.
4. [ ] Supabase: свой SMTP настроен (шаг 1.7), лимит писем поднят под ожидаемый трафик.
5. [ ] **Redeploy** Production → `/api/health`: `"polarServer":"production"`.
6. [ ] Контрольная покупка своей картой → отмена в портале (в триале деньги не списываются).

### Выключить что-то быстро
- ИИ: `VITE_AI_ENABLED=false` (или удали `DEEPSEEK_API_KEY`) → Redeploy. Домашки работают офлайн.
- Оплату: `VITE_BILLING_ENABLED=false` → Redeploy. Пейвол исчезает, разделы снова закрыты только тирами.
- Вернуть режим ревью: `VITE_REVIEW_MODE=true`.

---

## Все переменные

| Переменная | Где видна | Обязательна | По умолчанию | Назначение |
|---|---|---|---|---|
| `VITE_SUPABASE_URL` | браузер | для аккаунтов | — | адрес проекта Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | браузер | для аккаунтов | — | `sb_publishable_…` |
| `VITE_API_BASE` | браузер | нет | тот же домен | где живёт `/api` |
| `VITE_AI_ENABLED` | браузер | нет | вкл. при Supabase | `false` — выключить ИИ-проверку |
| `VITE_BILLING_ENABLED` | браузер | для оплаты | выкл. | `true` — оплата и пейвол |
| `VITE_REVIEW_MODE` | браузер | нет | `true` | всё открыто; **перед запуском — `false`** |
| `APP_URL` | сервер | да (с оплатой) | origin запроса | ссылки возврата, проверка Origin |
| `SUPABASE_URL` | сервер | для /api | — | адрес проекта Supabase |
| `SUPABASE_SECRET_KEY` | сервер | для /api | — | `sb_secret_…` (секрет) |
| `DEEPSEEK_API_KEY` | сервер | для ИИ | — | ключ DeepSeek (секрет) |
| `DEEPSEEK_MODEL` | сервер | нет | `deepseek-flash` | модель |
| `DEEPSEEK_BASE_URL` | сервер | нет | `https://api.deepseek.com` | адрес API |
| `AI_DAILY_LIMIT_FREE` | сервер | нет | `10` | ИИ-проверок в сутки, Free |
| `AI_DAILY_LIMIT_PRO` | сервер | нет | `100` | ИИ-проверок в сутки, Pro |
| `POLAR_ACCESS_TOKEN` | сервер | для оплаты | — | `polar_oat_…` (секрет) |
| `POLAR_SERVER` | сервер | нет | `sandbox` | `sandbox` / `production` |
| `POLAR_PRODUCT_MONTHLY_ID` | сервер | для оплаты | — | id продукта «месяц» |
| `POLAR_PRODUCT_ANNUAL_ID` | сервер | для оплаты | — | id продукта «год» |
| `POLAR_WEBHOOK_SECRET` | сервер | для оплаты | — | секрет вебхука (секрет) |
| `POLAR_API_VERSION` | сервер | нет | `2026-10` | заголовок `Polar-Version` |

---

## Если что-то не работает

| Симптом | Причина и что делать |
|---|---|
| Всё ещё «Тестовый вход» | Нет `VITE_SUPABASE_*` в сборке → проверь переменные и сделай Redeploy |
| Письмо не приходит | Встроенная почта шлёт только участникам команды Supabase → подключи SMTP (шаг 1.7); загляни в «Спам» |
| После ссылки из письма «Ссылка устарела» | Ссылка одноразовая и живёт ограниченное время — запроси новую; проверь *Redirect URLs* |
| Бейдж «симуляция» вместо «ИИ-ментор» | `/api/health` → `ai:false`? Нет `DEEPSEEK_API_KEY` или `SUPABASE_*` на сервере; или `VITE_AI_ENABLED=false` |
| Бипи: «ИИ-ментор сейчас недоступен» | DeepSeek не ответил (баланс, ключ, сбой). Логи: Vercel → *Logs*, строки `[ai/review]` (ключ туда не пишется) |
| «Не получилось открыть оплату» | Неверный токен/скоупы или id продукта не из того окружения (sandbox ≠ production) |
| Оплатил, а Pro не включился | Polar → *Webhooks → Deliveries*: 403 — неверный `POLAR_WEBHOOK_SECRET`; 500 — проверь `SUPABASE_SECRET_KEY` и что SQL-миграция выполнена; 503 — нет секрета на сервере |
| Пейвол не появляется | `VITE_REVIEW_MODE` не `false` или `VITE_BILLING_ENABLED` не `true` (и Redeploy) |
| 403 «Запрос с чужого сайта» | Фронт на другом домене → поставь `APP_URL` = адрес фронта |
