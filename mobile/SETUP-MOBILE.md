# Вайбик: ключи, сборки и публикация

Секретов сервера в приложении нет и быть не должно: `DEEPSEEK_API_KEY`, service-role Supabase и ключи Polar живут только на сервере веб-версии. Приложение ходит в свой бэкенд `/api` с токеном пользователя.

Скопируй `.env.example` в `.env` (он в `.gitignore`) и заполни. Все значения ниже — публичные, они попадают в сборку.

| Переменная | Зачем | Где взять |
| --- | --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | настоящие аккаунты и синхронизация прогресса | Supabase → Project Settings → API |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | только publishable/anon-ключ (`sb_publishable_…` или JWT с ролью `anon`). Секретный ключ приложение само откажется использовать | там же |
| `EXPO_PUBLIC_API_BASE` | адрес веб-бэкенда без слэша на конце, например `https://vaibik.example.com`. Нужен для ИИ-проверки домашек | твой деплой Vercel |
| `EXPO_PUBLIC_REVIEW_MODE` | `true` (по умолчанию) — все тиры открыты, пейвол не мешает. Перед релизом поставь `false` | — |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | публичный SDK-ключ RevenueCat для iOS (`appl_…`) | RevenueCat → Project → API keys |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | то же для Android (`goog_…`) | там же |
| `EXPO_PUBLIC_POSTHOG_KEY` / `EXPO_PUBLIC_POSTHOG_HOST` | аналитика воронки (те же события, что в вебе, `docs/analytics.md`); ключ `phc_…` публичный | PostHog → Project settings |
| `EXPO_PUBLIC_SENTRY_DSN` / `EXPO_PUBLIC_SENTRY_ENVIRONMENT` | отчёты о падениях (проект `vaibik-mobile`); DSN публичный | Sentry → проект → Client Keys |
| `SENTRY_ORG`, `SENTRY_PROJECT` (+ секрет EAS `SENTRY_AUTH_TOKEN`) | **не** `EXPO_PUBLIC_`: только для выгрузки source maps в EAS Build; при их наличии `app.config.ts` подключает плагин `@sentry/react-native` | Sentry → Settings |

Без PostHog/Sentry — аналитика и отчёты выключены (no-op). Отзывы уходят на `POST {EXPO_PUBLIC_API_BASE}/api/feedback` (тот же сервер, что у веба, с лимитами и пересылкой в Telegram); без `API_BASE` — сохраняются на устройстве.

Без Supabase — демо-вход. Без `API_BASE` — домашки проверяются офлайн-симуляцией. Без ключей RevenueCat — пейвол показывает цены, но ничего не списывает.

## Оплата: почему RevenueCat, а не Polar

Apple требует In-App Purchase для цифровых подписок внутри iOS-приложения, поэтому веб-оплата Polar там запрещена. В приложении оплата идёт через `react-native-purchases` (RevenueCat): продукты `vaibik_pro_monthly` ($9.99/мес) и `vaibik_pro_annual` ($59.99/год), право `pro`, пробный период 3 дня — как тарифы веба (`src/data/pricing.ts`). Нативный SDK работает только в dev build и стор-сборках, **не в Expo Go**.

### Связка RevenueCat → Supabase

Таблица `public.subscriptions` заполняется только сервером. Для мобильных покупок нужен вебхук RevenueCat:

1. В RevenueCat: Integrations → Webhooks, URL `https://<домен>/api/billing/revenuecat-webhook`, авторизация — общий секрет.
2. Хендлер на сервере (по образцу `api/billing/webhook.ts` для Polar): проверить секрет, взять `app_user_id` (мы передаём туда id пользователя Supabase через `Purchases.logIn`), замапить событие на строку `subscriptions`:
   - `INITIAL_PURCHASE` / `RENEWAL` / `UNCANCELLATION` → `status: 'active'` (или `'trialing'`, если `period_type === 'TRIAL'`), `plan` по product id (`vaibik_pro_monthly` → `monthly`, `vaibik_pro_annual` → `annual`), `current_period_end` из `expiration_at_ms`.
   - `CANCELLATION` → `cancel_at_period_end: true` (доступ до конца периода).
   - `EXPIRATION` → `status: 'canceled'`.
   - `BILLING_ISSUE` → `status: 'past_due'`.
3. Писать только service-role ключом и только если событие новее `source_updated_at` (повторные вебхуки не должны затирать новые). Идемпотентность — через таблицу `webhook_events`.
4. Приложение само подписку не читает: доступ к разделам 2–5 решает веб-логика по этой строке. Пока вебхука нет, покупка активирует Pro только на устройстве через RevenueCat.

## Сборки (EAS)

```bash
npm install -g eas-cli
cd mobile
eas login
eas init            # запишет реальный projectId в app.json/extra.eas
eas build --profile development --platform ios      # dev build с Expo Dev Client
eas build --profile preview --platform all          # внутреннее тестирование
eas build --profile production --platform all       # в сторы
```

Профили описаны в `eas.json`. `development` — для проверки покупок на устройстве, `preview` — внутренние сборки, `production` — то, что уходит на ревью.

## App Store (iOS)

1. Аккаунт Apple Developer — **$99/год**: https://developer.apple.com/programs/
2. App Store Connect → новое приложение, Bundle ID `com.vaibik.app` (тот же, что в `app.config.ts`).
3. Subscriptions: группа «Вайбик Pro», продукты `vaibik_pro_monthly` и `vaibik_pro_annual`, у обоих introductory offer — 3 дня бесплатно.
4. В RevenueCat: приложение iOS, ключ App Store Connect API, entitlement `pro`, offering `default` с обоими пакетами.
5. `eas submit --platform ios --profile production` (нужен Apple ID и app-specific пароль или API-ключ; EAS спросит сам).
6. Скриншоты, описание, политика конфиденциальности — и на ревью. Первое ревью обычно 1–2 дня.

## Google Play (Android)

1. Аккаунт Google Play Console — **$25 разово**: https://play.google.com/console/signup
2. Приложение с package name `com.vaibik.app`.
3. Монетизация → подписки: `vaibik_pro_monthly`, `vaibik_pro_annual`, бесплатный пробный период 3 дня.
4. В RevenueCat: приложение Android, сервисный аккаунт Google, те же entitlement и offering.
5. `eas submit --platform android --profile production`.
6. Закрытое тестирование (обязательно для новых аккаунтов), потом прод.

## Проверка перед релизом

- `EXPO_PUBLIC_REVIEW_MODE=false`.
- `cd mobile && npx tsc --noEmit && npm test && npx expo-doctor`.
- Пройти покупку и восстановление на песочнице App Store / лицензионном тестере Play.
