-- =====================================================================
-- Вайбик: отзывы учеников (форма «Отзыв» и микро-опросы)
-- Как применить: после 0001_init.sql — Supabase Dashboard → SQL Editor → New query →
-- вставить ВЕСЬ файл → Run. Скрипт можно запускать повторно: он не удаляет данные.
--
-- Модель доступа:
--   * пишет ТОЛЬКО сервер (/api/feedback, secret-ключ = роль service_role);
--   * браузер (anon / authenticated) вставлять не может; ученик видит только свои отзывы,
--     чужие — никогда; гости (anon) не видят ничего.
-- =====================================================================

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text check (email is null or (char_length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$')),
  rating smallint check (rating is null or rating between 1 and 5),
  category text check (category is null or category in ('bug', 'idea', 'hard', 'other', 'price', 'try_first', 'no_value')),
  message text check (message is null or char_length(message) <= 1000),
  context jsonb not null default '{}'::jsonb
    check (jsonb_typeof(context) = 'object' and pg_column_size(context) < 4000),
  source text not null default 'manual' check (source in ('manual', 'first_lesson', 'paywall_exit', 'homework')),
  created_at timestamptz not null default now(),
  -- пустой отзыв не нужен: хотя бы оценка, тема или текст
  constraint feedback_not_empty check (rating is not null or category is not null or coalesce(btrim(message), '') <> ''),
  -- почту храним только у гостей (у ученика с аккаунтом она и так есть в auth.users)
  constraint feedback_email_only_guests check (email is null or user_id is null)
);

create index if not exists feedback_created_idx on public.feedback (created_at desc);
create index if not exists feedback_user_idx on public.feedback (user_id, created_at desc) where user_id is not null;
create index if not exists feedback_source_idx on public.feedback (source, created_at desc);

alter table public.feedback enable row level security;

-- Ученик может прочитать только свои отзывы (например, «мои обращения» в будущем)
drop policy if exists "feedback: read own" on public.feedback;
create policy "feedback: read own" on public.feedback for select to authenticated
  using ((select auth.uid()) = user_id);
-- политик на insert/update/delete нет = из браузера писать нельзя, только сервер

revoke all on public.feedback from anon;
revoke all on public.feedback from authenticated;
grant select on public.feedback to authenticated;
grant all on public.feedback to service_role;

-- Удобный вид для владельца — только в SQL Editor (роль postgres): свежие отзывы с почтой ученика.
--   select * from public.feedback_recent limit 50;
-- security_invoker: вид работает с правами того, кто его читает; через Data API он недоступен.
create or replace view public.feedback_recent with (security_invoker = true) as
  select f.created_at, f.source, f.rating, f.category, f.message,
         coalesce(f.email, u.email) as contact_email,
         f.context ->> 'route' as route, f.context ->> 'app_version' as app_version, f.context ->> 'platform' as platform,
         f.user_id, f.id
  from public.feedback f
  left join auth.users u on u.id = f.user_id
  order by f.created_at desc;

revoke all on public.feedback_recent from anon, authenticated, service_role;
