-- 0003: удаление аккаунта из приложения (App Store Guideline 5.1.1(v)).
-- Пользователь сам вызывает public.delete_my_account() — удаляется его запись в auth.users,
-- а все его данные (profiles, progress, homework_submissions, ai_usage, subscriptions) уходят каскадом
-- (on delete cascade); feedback остаётся анонимным (user_id → null).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
