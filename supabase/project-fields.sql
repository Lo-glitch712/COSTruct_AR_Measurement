-- Run once in the SQL Editor after the original schema.
-- Adds site address and optional notes to saved projects.

alter table public.projects
  add column if not exists address text not null default '',
  add column if not exists description text not null default '';
