-- Run this once in the SQL Editor (schema is already applied).
-- Lets an admin delete buyer/supplier accounts from the app.

drop policy if exists "profiles_admin_delete" on public.profiles;
create policy "profiles_admin_delete" on public.profiles
  for delete using (public.is_admin());

create or replace function public.admin_delete_account(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  if exists (
    select 1 from public.profiles
    where id = target_id and role = 'admin'
  ) then
    raise exception 'cannot delete an admin account';
  end if;
  delete from public.profiles where id = target_id;
  delete from auth.users where id = target_id;
end;
$$;

grant execute on function public.admin_delete_account(uuid) to authenticated;
