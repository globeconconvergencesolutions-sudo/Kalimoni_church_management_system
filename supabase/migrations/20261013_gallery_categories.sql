-- =============================================================================
-- St. Theresa Parish — Gallery categories (custom, orderable, hideable)
-- Paste into Supabase → SQL Editor → Run (safe to re-run)
--
-- parish_media.category stays a plain text column (the category name), so
-- existing rows keep working. This table adds ordering, descriptions and
-- visibility, and lets the office create their own categories.
-- =============================================================================

create table if not exists public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text not null default '',
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists gallery_categories_name_unique on public.gallery_categories (lower(name));
create unique index if not exists gallery_categories_slug_unique on public.gallery_categories (slug);
create index if not exists gallery_categories_order_idx on public.gallery_categories (sort_order, name);

-- Seed the original six categories
insert into public.gallery_categories (name, slug, sort_order)
values
  ('Church Life', 'church-life', 10),
  ('Sacraments', 'sacraments', 20),
  ('Celebrations', 'celebrations', 30),
  ('Community Outreach', 'community-outreach', 40),
  ('Youth Activities', 'youth-activities', 50),
  ('Construction', 'construction', 60)
on conflict do nothing;

-- Adopt any category names already used by gallery items
insert into public.gallery_categories (name, slug, sort_order)
select distinct on (lower(trim(m.category)))
  trim(m.category),
  trim(both '-' from regexp_replace(lower(trim(m.category)), '[^a-z0-9]+', '-', 'g')),
  1000
from public.parish_media m
where coalesce(m.is_slot, false) = false
  and m.slot_key is null
  and trim(coalesce(m.category, '')) <> ''
on conflict do nothing;

alter table public.gallery_categories enable row level security;

drop policy if exists "anon_read_gallery_categories" on public.gallery_categories;
drop policy if exists "staff_read_gallery_categories" on public.gallery_categories;
drop policy if exists "staff_insert_gallery_categories" on public.gallery_categories;
drop policy if exists "staff_update_gallery_categories" on public.gallery_categories;
drop policy if exists "staff_delete_gallery_categories" on public.gallery_categories;

-- Public site reads every row so it can leave hidden categories out of /gallery
create policy "anon_read_gallery_categories" on public.gallery_categories
  for select to anon using (true);
create policy "staff_read_gallery_categories" on public.gallery_categories
  for select to authenticated using (true);
create policy "staff_insert_gallery_categories" on public.gallery_categories
  for insert to authenticated with check (true);
create policy "staff_update_gallery_categories" on public.gallery_categories
  for update to authenticated using (true) with check (true);
create policy "staff_delete_gallery_categories" on public.gallery_categories
  for delete to authenticated using (true);

create or replace function public.gallery_categories_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists gallery_categories_touch_trg on public.gallery_categories;
create trigger gallery_categories_touch_trg
  before update on public.gallery_categories
  for each row execute function public.gallery_categories_touch();

-- Speeds up "move all items in a category" and per-category counts
create index if not exists parish_media_category_idx on public.parish_media (category)
  where slot_key is null;
