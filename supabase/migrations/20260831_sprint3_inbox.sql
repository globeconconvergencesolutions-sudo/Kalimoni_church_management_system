-- Sprint 3: parish inbox (contact, prayer, newsletter, giving notes)
-- Run in the Supabase SQL Editor after Sprint 2.

create table if not exists public.inbox_messages (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact', 'prayer', 'newsletter', 'giving')),
  name text,
  email text not null,
  country text,
  subject text,
  body text,
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  email_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists inbox_messages_created_idx on public.inbox_messages (created_at desc);
create index if not exists inbox_messages_status_idx on public.inbox_messages (status);

alter table public.inbox_messages enable row level security;

drop policy if exists "anon_insert_inbox" on public.inbox_messages;
drop policy if exists "staff_read_inbox" on public.inbox_messages;
drop policy if exists "staff_update_inbox" on public.inbox_messages;
drop policy if exists "staff_delete_inbox" on public.inbox_messages;

create policy "anon_insert_inbox" on public.inbox_messages
  for insert to anon, authenticated
  with check (true);

create policy "staff_read_inbox" on public.inbox_messages
  for select to authenticated
  using (true);

create policy "staff_update_inbox" on public.inbox_messages
  for update to authenticated
  using (true)
  with check (true);

create policy "staff_delete_inbox" on public.inbox_messages
  for delete to authenticated
  using (true);
