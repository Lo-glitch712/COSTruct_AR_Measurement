-- Run this in the SQL Editor if accounts are created but no profiles row appears:
-- https://supabase.com/dashboard/project/nhjsadyqgygfffjyisjg/sql

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role public.app_role;
begin
  new_role := case
    when new.raw_user_meta_data->>'role' in ('buyer', 'supplier', 'admin')
      then (new.raw_user_meta_data->>'role')::public.app_role
    else 'buyer'::public.app_role
  end;

  insert into public.profiles (
    id, role, name, email, phone, supplier_id,
    first_name, middle_name, last_name, birthday,
    street, city, province, zip_code
  )
  values (
    new.id,
    new_role,
    coalesce(
      nullif(new.raw_user_meta_data->>'name', ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'User'
    ),
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'supplier_id', ''),
    nullif(new.raw_user_meta_data->>'first_name', ''),
    nullif(new.raw_user_meta_data->>'middle_name', ''),
    nullif(new.raw_user_meta_data->>'last_name', ''),
    nullif(new.raw_user_meta_data->>'birthday', '')::date,
    nullif(new.raw_user_meta_data->>'street', ''),
    nullif(new.raw_user_meta_data->>'city', ''),
    nullif(new.raw_user_meta_data->>'province', ''),
    nullif(new.raw_user_meta_data->>'zip_code', '')
  )
  on conflict (id) do update set
    role = excluded.role,
    name = excluded.name,
    email = excluded.email,
    phone = coalesce(excluded.phone, public.profiles.phone),
    supplier_id = coalesce(excluded.supplier_id, public.profiles.supplier_id),
    first_name = coalesce(excluded.first_name, public.profiles.first_name),
    middle_name = coalesce(excluded.middle_name, public.profiles.middle_name),
    last_name = coalesce(excluded.last_name, public.profiles.last_name),
    birthday = coalesce(excluded.birthday, public.profiles.birthday),
    street = coalesce(excluded.street, public.profiles.street),
    city = coalesce(excluded.city, public.profiles.city),
    province = coalesce(excluded.province, public.profiles.province),
    zip_code = coalesce(excluded.zip_code, public.profiles.zip_code);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());
