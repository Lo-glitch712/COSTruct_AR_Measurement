-- Run once in the SQL Editor after the original schema.
-- Adds buyer registration fields to profiles.

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists middle_name text,
  add column if not exists last_name text,
  add column if not exists birthday date,
  add column if not exists street text,
  add column if not exists city text,
  add column if not exists province text,
  add column if not exists zip_code text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, role, name, email, phone, supplier_id,
    first_name, middle_name, last_name, birthday, street, city, province, zip_code
  )
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'buyer'),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'supplier_id',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'middle_name',
    new.raw_user_meta_data->>'last_name',
    nullif(new.raw_user_meta_data->>'birthday', '')::date,
    new.raw_user_meta_data->>'street',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'province',
    new.raw_user_meta_data->>'zip_code'
  )
  on conflict (id) do update set
    first_name = excluded.first_name,
    middle_name = excluded.middle_name,
    last_name = excluded.last_name,
    birthday = excluded.birthday,
    street = excluded.street,
    city = excluded.city,
    province = excluded.province,
    zip_code = excluded.zip_code;
  return new;
end;
$$;
