-- =============================================================================
-- St. Theresa Parish — Photo Stories (media albums)
-- Paste into Supabase → SQL Editor → Run (safe to re-run)
-- =============================================================================

create table if not exists public.media_albums (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  summary text not null default '',
  body text not null default '',
  cover_media_id uuid references public.parish_media (id) on delete set null,
  category text not null default 'Construction',
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  sort_order int not null default 0,
  related_post_slug text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists media_albums_slug_unique on public.media_albums (slug);
create index if not exists media_albums_status_idx on public.media_albums (status, featured, sort_order);

alter table public.parish_media
  add column if not exists album_id uuid references public.media_albums (id) on delete set null;

create index if not exists parish_media_album_idx on public.parish_media (album_id, sort_order)
  where album_id is not null;

alter table public.media_albums enable row level security;

drop policy if exists "anon_read_albums" on public.media_albums;
drop policy if exists "staff_read_albums" on public.media_albums;
drop policy if exists "staff_insert_albums" on public.media_albums;
drop policy if exists "staff_update_albums" on public.media_albums;
drop policy if exists "staff_delete_albums" on public.media_albums;

create policy "anon_read_albums" on public.media_albums
  for select to anon using (status = 'published');
create policy "staff_read_albums" on public.media_albums
  for select to authenticated using (true);
create policy "staff_insert_albums" on public.media_albums
  for insert to authenticated with check (true);
create policy "staff_update_albums" on public.media_albums
  for update to authenticated using (true) with check (true);
create policy "staff_delete_albums" on public.media_albums
  for delete to authenticated using (true);

-- At most one featured album at a time (optional soft rule via trigger)
create or replace function public.media_albums_single_featured()
returns trigger
language plpgsql
as $$
begin
  if new.featured is true then
    update public.media_albums
    set featured = false
    where featured = true and id is distinct from new.id;
  end if;
  new.updated_at = now();
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists media_albums_single_featured_trg on public.media_albums;
create trigger media_albums_single_featured_trg
  before insert or update on public.media_albums
  for each row execute function public.media_albums_single_featured();
