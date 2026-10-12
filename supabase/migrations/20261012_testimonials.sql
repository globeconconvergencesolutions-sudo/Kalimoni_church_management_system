-- Moderated parish testimonials (Voices of the Parish)
-- Public (anon) may insert pending only; anon reads published only; staff full access.

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  display_name text not null,
  role text,
  location text,
  status text not null default 'pending'
    check (status in ('pending', 'published', 'rejected')),
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null
);

create index if not exists testimonials_published_idx
  on public.testimonials (published, sort_order, created_at desc);

create index if not exists testimonials_status_idx
  on public.testimonials (status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists testimonials_set_updated_at on public.testimonials;
create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute procedure public.set_updated_at();

-- Keep published flag aligned with status
create or replace function public.testimonials_sync_published()
returns trigger
language plpgsql
as $$
begin
  new.published := (new.status = 'published');
  return new;
end;
$$;

drop trigger if exists testimonials_sync_published on public.testimonials;
create trigger testimonials_sync_published
  before insert or update on public.testimonials
  for each row execute procedure public.testimonials_sync_published();

alter table public.testimonials enable row level security;

drop policy if exists "anon_read_published_testimonials" on public.testimonials;
create policy "anon_read_published_testimonials"
  on public.testimonials for select
  to anon
  using (published = true and status = 'published');

drop policy if exists "anon_insert_pending_testimonials" on public.testimonials;
create policy "anon_insert_pending_testimonials"
  on public.testimonials for insert
  to anon
  with check (
    status = 'pending'
    and published = false
    and coalesce(trim(quote), '') <> ''
    and coalesce(trim(display_name), '') <> ''
  );

drop policy if exists "staff_read_testimonials" on public.testimonials;
create policy "staff_read_testimonials"
  on public.testimonials for select
  to authenticated
  using (true);

drop policy if exists "staff_insert_testimonials" on public.testimonials;
create policy "staff_insert_testimonials"
  on public.testimonials for insert
  to authenticated
  with check (true);

drop policy if exists "staff_update_testimonials" on public.testimonials;
create policy "staff_update_testimonials"
  on public.testimonials for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "staff_delete_testimonials" on public.testimonials;
create policy "staff_delete_testimonials"
  on public.testimonials for delete
  to authenticated
  using (true);
