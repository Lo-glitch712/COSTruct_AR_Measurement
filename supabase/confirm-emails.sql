-- Confirm existing Auth users (fixes "Email not confirmed" on login).
-- Run in: https://supabase.com/dashboard/project/robmfnfvgmgoasllyphd/sql

update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;

create or replace function public.auto_confirm_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_auto_confirm on auth.users;
create trigger on_auth_user_auto_confirm
  before insert or update on auth.users
  for each row execute procedure public.auto_confirm_auth_user();
