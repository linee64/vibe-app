-- =====================================================================
-- Вайбик: начальная схема базы (Supabase / Postgres)
-- Как применить: Supabase Dashboard → SQL Editor → New query → вставить ВЕСЬ файл → Run.
-- Скрипт можно запускать повторно: он не удаляет данные.
--
-- Модель доступа:
--   * браузер ходит с publishable-ключом (роль anon / authenticated) — его ограничивает RLS;
--   * сервер (/api на Vercel) ходит с secret-ключом (роль service_role) — RLS не действует,
--     поэтому сервер сам проверяет пользователя по токену.
-- =====================================================================

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 80),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- progress (весь прогресс одним JSON)
create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 100000),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- homework_submissions
create table if not exists public.homework_submissions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  homework_id text not null check (homework_id ~ '^hw[0-9]{1,2}$'),
  prompts jsonb not null default '[]'::jsonb
    check (jsonb_typeof(prompts) = 'array' and pg_column_size(prompts) < 50000),
  passed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists homework_submissions_user_idx on public.homework_submissions (user_id, created_at desc);

-- ---------------------------------------------------------------- ai_usage (счётчик ИИ-проверок в день)
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  count integer not null default 0 check (count >= 0),
  primary key (user_id, day)
);

-- ---------------------------------------------------------------- subscriptions (заполняет только вебхук Polar)
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  polar_customer_id text,
  polar_subscription_id text,
  status text not null,               -- trialing | active | past_due | canceled | unpaid | incomplete | ...
  plan text,                          -- monthly | annual
  current_period_end timestamptz,
  trial_end timestamptz,
  cancel_at_period_end boolean not null default false,
  source_updated_at timestamptz,      -- время события Polar: старые/повторные события не затирают новые
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- webhook_events (идемпотентность вебхуков)
create table if not exists public.webhook_events (
  id text primary key,                -- заголовок webhook-id
  type text,
  received_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists progress_touch on public.progress;
create trigger progress_touch before insert or update on public.progress
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- профиль при регистрации
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1)), 80)
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- RLS
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.homework_submissions enable row level security;
alter table public.ai_usage enable row level security;
alter table public.subscriptions enable row level security;
alter table public.webhook_events enable row level security;

-- profiles: читать/менять только свой
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- progress: читать/писать только свой
drop policy if exists "progress: read own" on public.progress;
create policy "progress: read own" on public.progress for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "progress: insert own" on public.progress;
create policy "progress: insert own" on public.progress for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "progress: update own" on public.progress;
create policy "progress: update own" on public.progress for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- homework_submissions: читать и добавлять только свои (без правки и удаления)
drop policy if exists "submissions: read own" on public.homework_submissions;
create policy "submissions: read own" on public.homework_submissions for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "submissions: insert own" on public.homework_submissions;
create policy "submissions: insert own" on public.homework_submissions for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- ai_usage и subscriptions: только чтение своего; пишет только сервер (service_role обходит RLS)
drop policy if exists "ai_usage: read own" on public.ai_usage;
create policy "ai_usage: read own" on public.ai_usage for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "subscriptions: read own" on public.subscriptions;
create policy "subscriptions: read own" on public.subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);
-- webhook_events: политик нет = браузеру недоступно совсем

-- ---------------------------------------------------------------- GRANTS (Data API)
-- В новых проектах Supabase таблицы не открываются Data API автоматически — выдаём права явно.
revoke all on public.profiles, public.progress, public.homework_submissions,
  public.ai_usage, public.subscriptions, public.webhook_events from anon;
revoke all on public.profiles, public.progress, public.homework_submissions,
  public.ai_usage, public.subscriptions, public.webhook_events from authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.progress to authenticated;
grant select, insert on public.homework_submissions to authenticated;
grant select on public.ai_usage to authenticated;
grant select on public.subscriptions to authenticated;

grant all on public.profiles, public.progress, public.homework_submissions,
  public.ai_usage, public.subscriptions, public.webhook_events to service_role;

-- ---------------------------------------------------------------- функции для сервера
-- Атомарно: +1 к счётчику за день, если не превышен лимит (возвращает новое значение или -1 = лимит).
-- p_delta = -1 — вернуть попытку, если ИИ не ответил.
create or replace function public.bump_ai_usage(p_user uuid, p_day date, p_limit integer, p_delta integer default 1)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v integer;
begin
  if p_delta < 0 then
    update public.ai_usage set count = greatest(count + p_delta, 0)
      where user_id = p_user and day = p_day returning count into v;
    return coalesce(v, 0);
  end if;
  insert into public.ai_usage as u (user_id, day, count) values (p_user, p_day, 1)
    on conflict (user_id, day) do update set count = u.count + 1 where u.count < p_limit
    returning u.count into v;
  if v is null or v > p_limit then
    return -1;
  end if;
  return v;
end $$;

-- Применить состояние подписки из вебхука Polar.
-- * повторные и запоздавшие события (source_updated_at старее сохранённого) игнорируются;
-- * событие о неактивной ДРУГОЙ подписке не затирает действующую.
create or replace function public.apply_polar_subscription(
  p_user uuid, p_customer text, p_subscription text, p_status text, p_plan text,
  p_period_end timestamptz, p_trial_end timestamptz, p_cancel_at_period_end boolean, p_source_at timestamptz
) returns boolean language plpgsql security definer set search_path = '' as $$
declare
  cur public.subscriptions%rowtype;
begin
  select * into cur from public.subscriptions where user_id = p_user for update;
  if found then
    if cur.source_updated_at is not null and p_source_at is not null and p_source_at < cur.source_updated_at
       and cur.polar_subscription_id is not distinct from p_subscription then
      return false;
    end if;
    if cur.polar_subscription_id is distinct from p_subscription
       and cur.status in ('active', 'trialing')
       and p_status not in ('active', 'trialing') then
      return false;
    end if;
    update public.subscriptions set
      polar_customer_id = coalesce(p_customer, cur.polar_customer_id),
      polar_subscription_id = p_subscription,
      status = p_status,
      plan = coalesce(p_plan, cur.plan),
      current_period_end = p_period_end,
      trial_end = p_trial_end,
      cancel_at_period_end = coalesce(p_cancel_at_period_end, false),
      source_updated_at = p_source_at,
      updated_at = now()
    where user_id = p_user;
  else
    insert into public.subscriptions (user_id, polar_customer_id, polar_subscription_id, status, plan,
      current_period_end, trial_end, cancel_at_period_end, source_updated_at)
    values (p_user, p_customer, p_subscription, p_status, p_plan, p_period_end, p_trial_end,
      coalesce(p_cancel_at_period_end, false), p_source_at);
  end if;
  return true;
end $$;

revoke all on function public.bump_ai_usage(uuid, date, integer, integer) from public, anon, authenticated;
revoke all on function public.apply_polar_subscription(uuid, text, text, text, text, timestamptz, timestamptz, boolean, timestamptz) from public, anon, authenticated;
grant execute on function public.bump_ai_usage(uuid, date, integer, integer) to service_role;
grant execute on function public.apply_polar_subscription(uuid, text, text, text, text, timestamptz, timestamptz, boolean, timestamptz) to service_role;
revoke all on function public.handle_new_user() from public, anon, authenticated;
