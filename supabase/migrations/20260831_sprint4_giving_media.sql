-- Sprint 4: demo M-Pesa gifts + Cloudinary media catalogue
-- Run in the Supabase SQL Editor after Sprint 3.

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  amount numeric not null,
  currency text not null default 'KES',
  kes_amount numeric,
  cause text not null,
  frequency text not null default 'once',
  status text not null default 'demo_pending',
  checkout_ref text,
  demo boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.parish_media (
  id uuid primary key default gen_random_uuid(),
  cloudinary_id text not null,
  url text not null,
  folder text not null default 'gallery',
  title text not null default '',
  category text not null default 'Church Life',
  alt text not null default '',
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists donations_created_idx on public.donations (created_at desc);
create index if not exists parish_media_folder_idx on public.parish_media (folder, sort_order);

alter table public.donations enable row level security;
alter table public.parish_media enable row level security;

drop policy if exists "anon_insert_donations" on public.donations;
drop policy if exists "staff_read_donations" on public.donations;
drop policy if exists "staff_update_donations" on public.donations;
drop policy if exists "staff_delete_donations" on public.donations;
create policy "anon_insert_donations" on public.donations for insert to anon, authenticated with check (true);
create policy "anon_update_demo_donations" on public.donations for update to anon using (demo = true) with check (demo = true);
create policy "staff_read_donations" on public.donations for select to authenticated using (true);
create policy "staff_update_donations" on public.donations for update to authenticated using (true) with check (true);
create policy "staff_delete_donations" on public.donations for delete to authenticated using (true);

drop policy if exists "anon_read_media" on public.parish_media;
drop policy if exists "staff_read_media" on public.parish_media;
drop policy if exists "staff_insert_media" on public.parish_media;
drop policy if exists "staff_update_media" on public.parish_media;
drop policy if exists "staff_delete_media" on public.parish_media;
create policy "anon_read_media" on public.parish_media for select to anon using (published = true);
create policy "staff_read_media" on public.parish_media for select to authenticated using (true);
create policy "staff_insert_media" on public.parish_media for insert to authenticated with check (true);
create policy "staff_update_media" on public.parish_media for update to authenticated using (true) with check (true);
create policy "staff_delete_media" on public.parish_media for delete to authenticated using (true);
