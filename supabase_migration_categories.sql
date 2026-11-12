-- homefinity.pk: product categories + rich text descriptions.
-- Run this whole file once in Supabase > SQL Editor > New query > Run.
-- Safe to run more than once. It keeps all your products, orders and settings.

-- 1) Rich text fields on products (stored as clean HTML)
alter table products add column if not exists long_description text not null default '';
alter table products add column if not exists extra_info text not null default '';

-- 2) Product categories (managed from Admin > Categories)
create table if not exists categories (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null default '',
  description text not null default '',
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists categories_name_key on categories (lower(name));
alter table categories enable row level security;
drop policy if exists "public reads categories" on categories;
drop policy if exists "admin writes categories" on categories;
create policy "public reads categories" on categories for select using (true);
create policy "admin writes categories" on categories for all using (is_admin()) with check (is_admin());

-- 3) Create a category for every category name your products already use
insert into categories (name, slug, sort)
select c, coalesce(nullif(trim(both '-' from regexp_replace(lower(c), '[^a-z0-9]+', '-', 'g')), ''), 'cat'), (row_number() over (order by c)) * 10
from (select distinct trim(category) as c from products where coalesce(trim(category), '') <> '') s
on conflict do nothing;
