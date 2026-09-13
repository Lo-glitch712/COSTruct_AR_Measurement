-- COSTruct — push this in the Supabase SQL Editor (or `supabase db push`).
-- Creates roles, tables, RLS, and seeds Partido hardware stores + catalogs.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('buyer', 'supplier', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.town as enum ('Tigaon', 'Goa', 'Lagonoy', 'San Jose', 'Sagnay');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.suppliers (
  id text primary key,
  name text not null,
  town public.town not null,
  location text not null,
  email text not null unique,
  lead text not null default 'Local pickup',
  price_index text,
  is_best boolean not null default false
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'buyer',
  name text not null,
  email text not null unique,
  phone text,
  supplier_id text references public.suppliers (id),
  first_name text,
  middle_name text,
  last_name text,
  birthday date,
  street text,
  city text,
  province text,
  zip_code text,
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  supplier_id text not null references public.suppliers (id) on delete cascade,
  material text not null,
  price numeric(12, 2) not null check (price >= 0),
  unit text not null,
  in_stock boolean not null default true,
  unique (supplier_id, material)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  name text not null default '',
  supplier_id text references public.suppliers (id),
  total numeric(14, 2) not null default 0,
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.project_components (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  length numeric(12, 4) not null,
  width numeric(12, 4) not null,
  height numeric(12, 4) not null
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists catalog_items_supplier_idx on public.catalog_items (supplier_id);
create index if not exists projects_buyer_idx on public.projects (buyer_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, name, email, phone, supplier_id)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'buyer'),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'supplier_id'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.suppliers enable row level security;
alter table public.catalog_items enable row level security;
alter table public.projects enable row level security;
alter table public.project_components enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

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

drop policy if exists "suppliers_read" on public.suppliers;
create policy "suppliers_read" on public.suppliers
  for select using (auth.role() = 'authenticated');

drop policy if exists "catalog_read" on public.catalog_items;
create policy "catalog_read" on public.catalog_items
  for select using (auth.role() = 'authenticated');

drop policy if exists "catalog_write_own" on public.catalog_items;
create policy "catalog_write_own" on public.catalog_items
  for all using (
    public.is_admin()
    or supplier_id in (
      select supplier_id from public.profiles
      where id = auth.uid() and role = 'supplier'
    )
  )
  with check (
    public.is_admin()
    or supplier_id in (
      select supplier_id from public.profiles
      where id = auth.uid() and role = 'supplier'
    )
  );

drop policy if exists "projects_buyer_or_admin" on public.projects;
create policy "projects_buyer_or_admin" on public.projects
  for all using (buyer_id = auth.uid() or public.is_admin())
  with check (buyer_id = auth.uid() or public.is_admin());

drop policy if exists "project_components_buyer_or_admin" on public.project_components;
create policy "project_components_buyer_or_admin" on public.project_components
  for all using (
    public.is_admin()
    or project_id in (select id from public.projects where buyer_id = auth.uid())
  )
  with check (
    public.is_admin()
    or project_id in (select id from public.projects where buyer_id = auth.uid())
  );

insert into public.suppliers (id, name, town, location, email, lead, price_index, is_best)
values
  ('johan', 'Johan Hardware', 'Tigaon', 'Tigaon, Camarines Sur', 'johan.hardware@gmail.com', 'Local pickup', 'Above reference', false),
  ('hdc', 'HDC Hardware', 'Tigaon', 'Tigaon, Camarines Sur', 'hdc.hardware@gmail.com', 'Local pickup', 'Above reference', false),
  ('bong-chel', 'Bong & Chel Hardware', 'Tigaon', 'Tigaon, Camarines Sur', 'bongchel.hardware@gmail.com', 'Local pickup', 'At reference', false),
  ('st-claire', 'St. Claire Hardware', 'Tigaon', 'Tigaon, Camarines Sur', 'stclaire.hardware@gmail.com', 'Local pickup', 'At reference', false),
  ('three-28', 'Three 28 Hardware', 'Tigaon', 'Tigaon, Camarines Sur', 'three28.hardware@gmail.com', 'Local pickup', 'Above reference', false),
  ('city-town', 'City Town Hardware', 'Goa', 'Goa, Camarines Sur', 'citytown.hardware@gmail.com', 'Local pickup', 'Below reference', false),
  ('nikki-kikko', 'Nikki & Kikko Hardware', 'Goa', 'Goa, Camarines Sur', 'nikkikikko.hardware@gmail.com', 'Local pickup', 'Below reference', true),
  ('sm-goa', 'S & M Hardware', 'Goa', 'Goa, Camarines Sur', 'smgoa.hardware@gmail.com', 'Local pickup', 'At reference', false),
  ('kuya-pony', 'Kuya Pony Hardware', 'Lagonoy', 'Lagonoy, Camarines Sur', 'kuyapony.hardware@gmail.com', 'Local pickup', 'Below reference', false),
  ('marks', 'Marks Hardware', 'Lagonoy', 'Lagonoy, Camarines Sur', 'marks.hardware@gmail.com', 'Local pickup', 'At reference', false),
  ('barnuevo', 'Barnuevo Hardware', 'Lagonoy', 'Lagonoy, Camarines Sur', 'barnuevo.hardware@gmail.com', 'Local pickup', 'Above reference', false),
  ('sm-lagonoy', 'S & M Hardware', 'Lagonoy', 'Lagonoy, Camarines Sur', 'smlagonoy.hardware@gmail.com', 'Local pickup', 'Below reference', false),
  ('obias', 'Obias Hardware', 'Lagonoy', 'Lagonoy, Camarines Sur', 'obias.hardware@gmail.com', 'Local pickup', 'Below reference', false),
  ('noah', 'Noah Hardware', 'San Jose', 'San Jose, Camarines Sur', 'noah.hardware@gmail.com', 'Local pickup', 'Below reference', false),
  ('eugine', 'Eugine Hardware', 'San Jose', 'San Jose, Camarines Sur', 'eugine.hardware@gmail.com', 'Local pickup', 'Below reference', false),
  ('siltrade', 'Siltrade', 'San Jose', 'San Jose, Camarines Sur', 'siltrade.hardware@gmail.com', 'Local pickup', 'At reference', false),
  ('mant', 'Mant Hardware', 'San Jose', 'San Jose, Camarines Sur', 'mant.hardware@gmail.com', 'Local pickup', 'At reference', false),
  ('highgate', 'HighGate Hardware', 'Sagnay', 'Sagnay, Camarines Sur', 'highgate.hardware@gmail.com', 'Local pickup', 'Above reference', false)
on conflict (id) do update set
  name = excluded.name,
  town = excluded.town,
  location = excluded.location,
  email = excluded.email,
  lead = excluded.lead,
  price_index = excluded.price_index,
  is_best = excluded.is_best;

insert into public.catalog_items (supplier_id, material, price, unit) values
  ('johan', 'Portland Cement', 255, 'bag'),
  ('johan', 'Pozzolan Cement', 250, 'bag'),
  ('johan', 'Sand', 1400, 'm³'),
  ('johan', 'Gravel', 1800, 'm³'),
  ('johan', 'CHB — 4"', 16, 'pc'),
  ('johan', 'CHB — 5"', 18, 'pc'),
  ('johan', 'CHB — 6"', 20, 'pc'),
  ('hdc', 'Portland Cement', 270, 'bag'),
  ('hdc', 'Pozzolan Cement', 265, 'bag'),
  ('hdc', 'Sand', 1650, 'm³'),
  ('hdc', 'Gravel (CR)', 2100, 'm³'),
  ('hdc', 'CHB — 4"', 20, 'pc'),
  ('hdc', 'CHB — 5"', 26, 'pc'),
  ('hdc', 'CHB — 6"', 31, 'pc'),
  ('bong-chel', 'Portland Cement', 245, 'bag'),
  ('bong-chel', 'Sand', 1400, 'm³'),
  ('bong-chel', 'Gravel', 1800, 'm³'),
  ('bong-chel', 'CHB — 4"', 18, 'pc'),
  ('st-claire', 'Portland Cement', 245, 'bag'),
  ('st-claire', 'Pozzolan Cement', 240, 'bag'),
  ('st-claire', 'Sand', 1400, 'm³'),
  ('st-claire', 'Gravel', 1800, 'm³'),
  ('st-claire', 'CHB — 4"', 17, 'pc'),
  ('st-claire', 'CHB — 5"', 20, 'pc'),
  ('three-28', 'Portland Cement', 245, 'bag'),
  ('three-28', 'Sand', 1500, 'm³'),
  ('three-28', 'Gravel', 1800, 'm³'),
  ('three-28', 'CHB — 4"', 18, 'pc'),
  ('three-28', 'CHB — 5"', 21, 'pc'),
  ('city-town', 'Portland Cement', 240, 'bag'),
  ('city-town', 'Sand', 1600, 'm³'),
  ('city-town', 'Gravel', 1400, 'm³'),
  ('city-town', 'CHB — 4"', 14, 'pc'),
  ('nikki-kikko', 'Portland Cement', 235, 'bag'),
  ('nikki-kikko', 'Sand (AS)', 1240, 'm³'),
  ('nikki-kikko', 'Gravel', 1635, 'm³'),
  ('nikki-kikko', 'CHB — 4"', 17, 'pc'),
  ('sm-goa', 'Portland Cement', 245, 'bag'),
  ('sm-goa', 'Sand', 1483, 'm³'),
  ('sm-goa', 'Gravel', 1700, 'm³'),
  ('sm-goa', 'CHB — 4"', 16, 'pc'),
  ('sm-goa', 'CHB — 5"', 18, 'pc'),
  ('kuya-pony', 'Portland Cement', 240, 'bag'),
  ('kuya-pony', 'Sand', 1350, 'm³'),
  ('kuya-pony', 'Gravel', 1750, 'm³'),
  ('kuya-pony', 'CHB — 4"', 16, 'pc'),
  ('kuya-pony', 'CHB — 5"', 18, 'pc'),
  ('marks', 'Portland Cement', 245, 'bag'),
  ('marks', 'Sand', 1350, 'm³'),
  ('marks', 'Gravel', 1700, 'm³'),
  ('marks', 'CHB — 4"', 17, 'pc'),
  ('marks', 'CHB — 5"', 20, 'pc'),
  ('barnuevo', 'Portland Cement', 245, 'bag'),
  ('barnuevo', 'Sand (AS)', 1600, 'm³'),
  ('barnuevo', 'Gravel (CR)', 2200, 'm³'),
  ('barnuevo', 'Gravel (GR)', 2000, 'm³'),
  ('barnuevo', 'CHB — 4"', 4, 'pc'),
  ('sm-lagonoy', 'Portland Cement', 240, 'bag'),
  ('sm-lagonoy', 'Sand', 1240, 'm³'),
  ('sm-lagonoy', 'Gravel', 1980, 'm³'),
  ('sm-lagonoy', 'CHB — 4"', 17, 'pc'),
  ('sm-lagonoy', 'CHB — 5"', 18, 'pc'),
  ('sm-lagonoy', 'CHB — 6"', 19, 'pc'),
  ('obias', 'Portland Cement', 240, 'bag'),
  ('obias', 'Sand (AS)', 1250, 'm³'),
  ('obias', 'Gravel (CR)', 1950, 'm³'),
  ('obias', 'Gravel (GR)', 1350, 'm³'),
  ('obias', 'CHB — 4"', 17, 'pc'),
  ('obias', 'CHB — 5"', 19.5, 'pc'),
  ('obias', 'CHB — 6"', 21, 'pc'),
  ('noah', 'Portland Cement', 245, 'bag'),
  ('noah', 'Sand (AS)', 1350, 'm³'),
  ('noah', 'Sand (GR)', 750, 'm³'),
  ('noah', 'Gravel (CR)', 1750, 'm³'),
  ('noah', 'Gravel (GR)', 1100, 'm³'),
  ('noah', 'CHB — 4"', 17, 'pc'),
  ('noah', 'CHB — 5"', 21, 'pc'),
  ('noah', 'CHB — 6"', 19, 'pc'),
  ('eugine', 'Portland Cement', 245, 'bag'),
  ('eugine', 'Sand (AS)', 1450, 'm³'),
  ('eugine', 'Sand (GR)', 700, 'm³'),
  ('eugine', 'Gravel', 1000, 'm³'),
  ('eugine', 'CHB — 4"', 17, 'pc'),
  ('siltrade', 'Portland Cement', 240, 'bag'),
  ('siltrade', 'Sand (AS)', 1650, 'm³'),
  ('siltrade', 'Gravel (CR)', 1950, 'm³'),
  ('siltrade', 'CHB — 4"', 16, 'pc'),
  ('mant', 'Portland Cement', 240, 'bag'),
  ('mant', 'Sand (AS)', 1350, 'm³'),
  ('mant', 'Gravel', 1950, 'm³'),
  ('mant', 'CHB — 4"', 16, 'pc'),
  ('highgate', 'Portland Cement', 250, 'bag'),
  ('highgate', 'Sand (AS)', 1650, 'm³'),
  ('highgate', 'Gravel (CR)', 2100, 'm³')
on conflict (supplier_id, material) do update set
  price = excluded.price,
  unit = excluded.unit;

-- Auth users cannot be inserted from SQL without the service role.
-- After this script, create these users in Authentication → Users
-- (or the app's local login, which already seeds them):
--
--   admin@gmail.com                 password: admin123     role: admin
--   *.hardware@gmail.com            password: supplier123  role: supplier
--   buyer sign-ups                  password: chosen       role: buyer
--
-- When creating a supplier user, set user metadata:
--   { "role": "supplier", "name": "Johan Hardware", "supplier_id": "johan" }
-- When creating the admin user:
--   { "role": "admin", "name": "COSTruct Admin" }
