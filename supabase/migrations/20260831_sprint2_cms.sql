-- Sprint 2: posts, calendar events, Mass times
-- Run in the Supabase SQL Editor, then open /admin/content and import prototype content.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null default 'Parish News',
  author text not null default 'Parish Communications',
  date_label text not null,
  read_time text not null default '4 min read',
  excerpt text not null default '',
  cover_img text not null default '',
  tags text[] not null default '{}',
  body jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parish_events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  date_label text not null,
  month_label text not null,
  title text not null,
  category text not null default '',
  time_label text not null default '',
  description text not null default '',
  color text not null default '#6B1A2A',
  icon text not null default '✦',
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mass_slots (
  id uuid primary key default gen_random_uuid(),
  weekday smallint,
  minutes_from_midnight int,
  display_time text not null,
  display_label text not null,
  kind text not null default 'eucharist',
  list_group text,
  sort_order int not null default 0,
  published boolean not null default true
);

create index if not exists posts_slug_idx on public.posts (slug);
create index if not exists parish_events_month_idx on public.parish_events (month_label, sort_order);

alter table public.posts enable row level security;
alter table public.parish_events enable row level security;
alter table public.mass_slots enable row level security;

drop policy if exists "anon_read_posts" on public.posts;
drop policy if exists "staff_read_posts" on public.posts;
drop policy if exists "staff_insert_posts" on public.posts;
drop policy if exists "staff_update_posts" on public.posts;
drop policy if exists "staff_delete_posts" on public.posts;
create policy "anon_read_posts" on public.posts for select to anon using (published = true);
create policy "staff_read_posts" on public.posts for select to authenticated using (true);
create policy "staff_insert_posts" on public.posts for insert to authenticated with check (true);
create policy "staff_update_posts" on public.posts for update to authenticated using (true) with check (true);
create policy "staff_delete_posts" on public.posts for delete to authenticated using (true);

drop policy if exists "anon_read_events" on public.parish_events;
drop policy if exists "staff_read_events" on public.parish_events;
drop policy if exists "staff_insert_events" on public.parish_events;
drop policy if exists "staff_update_events" on public.parish_events;
drop policy if exists "staff_delete_events" on public.parish_events;
create policy "anon_read_events" on public.parish_events for select to anon using (published = true);
create policy "staff_read_events" on public.parish_events for select to authenticated using (true);
create policy "staff_insert_events" on public.parish_events for insert to authenticated with check (true);
create policy "staff_update_events" on public.parish_events for update to authenticated using (true) with check (true);
create policy "staff_delete_events" on public.parish_events for delete to authenticated using (true);

drop policy if exists "anon_read_mass" on public.mass_slots;
drop policy if exists "staff_read_mass" on public.mass_slots;
drop policy if exists "staff_insert_mass" on public.mass_slots;
drop policy if exists "staff_update_mass" on public.mass_slots;
drop policy if exists "staff_delete_mass" on public.mass_slots;
create policy "anon_read_mass" on public.mass_slots for select to anon using (published = true);
create policy "staff_read_mass" on public.mass_slots for select to authenticated using (true);
create policy "staff_insert_mass" on public.mass_slots for insert to authenticated with check (true);
create policy "staff_update_mass" on public.mass_slots for update to authenticated using (true) with check (true);
create policy "staff_delete_mass" on public.mass_slots for delete to authenticated using (true);
