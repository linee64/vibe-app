-- Проверка RLS таблицы feedback на локальном Postgres (не для Supabase Dashboard!).
-- createdb vb && psql -d vb -f supabase/tests/local_supabase_stub.sql \
--   -f supabase/migrations/0001_init.sql -f supabase/migrations/0002_feedback.sql -f supabase/tests/feedback_rls.sql
-- Ожидается: сервис видит 3 строки; ограничения отклоняют 6 плохих вставок; ученик A и B видят только по 1 своей;
-- insert/update/delete/вид из браузера и anon — permission denied.
\set ON_ERROR_STOP 0
insert into auth.users (id, email) values ('11111111-1111-4111-8111-111111111111','a@example.com'),('22222222-2222-4222-8222-222222222222','b@example.com');
-- сервер (service_role) пишет
set role service_role;
insert into public.feedback (user_id, rating, category, message, context, source) values ('11111111-1111-4111-8111-111111111111', 4, 'idea', 'A: идея', '{"route":"/learn"}', 'manual');
insert into public.feedback (user_id, rating, source) values ('22222222-2222-4222-8222-222222222222', 2, 'first_lesson');
insert into public.feedback (email, category, source) values ('guest@example.com', 'price', 'paywall_exit');
select 'service sees', count(*) from public.feedback;
-- ограничения
insert into public.feedback (source) values ('manual');                                         -- пустой → ошибка
insert into public.feedback (rating, source) values (6, 'manual');                              -- оценка 6 → ошибка
insert into public.feedback (category, source) values ('hack', 'manual');                       -- категория → ошибка
insert into public.feedback (rating, source) values (3, 'spam');                                -- источник → ошибка
insert into public.feedback (rating, message, source) values (3, repeat('x', 1001), 'manual');  -- длинный текст → ошибка
insert into public.feedback (user_id, email, rating, source) values ('11111111-1111-4111-8111-111111111111', 'x@example.com', 3, 'manual'); -- почта у ученика → ошибка
reset role;
-- ученик A
set role authenticated; set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select 'A sees', count(*), string_agg(coalesce(message,'-'), ',') from public.feedback;
insert into public.feedback (user_id, rating, source) values ('11111111-1111-4111-8111-111111111111', 5, 'manual'); -- нельзя
update public.feedback set rating = 1;                                                                           -- нельзя
delete from public.feedback;                                                                                     -- нельзя
select 'A view', count(*) from public.feedback_recent;                                                            -- нельзя
reset role; reset request.jwt.claim.sub;
-- ученик B
set role authenticated; set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
select 'B sees', count(*), max(source) from public.feedback;
reset role; reset request.jwt.claim.sub;
-- гость
set role anon;
select 'anon sees', count(*) from public.feedback;
insert into public.feedback (email, rating, source) values ('g@example.com', 5, 'manual');
reset role;
select 'total after', count(*) from public.feedback;
select 'owner view', count(*), max(contact_email) from public.feedback_recent;
select relname, relrowsecurity from pg_class where relname = 'feedback';
