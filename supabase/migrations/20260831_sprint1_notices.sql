-- Sprint 1: parish notices (run in Supabase SQL Editor if the CLI is not linked)

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  severity text not null default 'info' check (severity in ('info', 'urgent')),
  pin boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  published boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notices_live_idx
  on public.notices (published, pin, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notices_set_updated_at on public.notices;
create trigger notices_set_updated_at
  before update on public.notices
  for each row execute procedure public.set_updated_at();

alter table public.notices enable row level security;

drop policy if exists "anon_read_live_notices" on public.notices;
create policy "anon_read_live_notices"
  on public.notices for select
  to anon
  using (
    published = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

drop policy if exists "staff_read_notices" on public.notices;
create policy "staff_read_notices"
  on public.notices for select
  to authenticated
  using (true);

drop policy if exists "staff_insert_notices" on public.notices;
create policy "staff_insert_notices"
  on public.notices for insert
  to authenticated
  with check (true);

drop policy if exists "staff_update_notices" on public.notices;
create policy "staff_update_notices"
  on public.notices for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "staff_delete_notices" on public.notices;
create policy "staff_delete_notices"
  on public.notices for delete
  to authenticated
  using (true);

insert into public.notices (title, body, severity, pin, published)
select
  'Karibu — welcome to St. Theresa Parish',
  'Sunday Mass at 7:30 AM and 9:30 AM. Join us in Kalimoni, Juja. This notice can be edited from the parish office admin.',
  'info',
  true,
  true
where not exists (select 1 from public.notices limit 1);
