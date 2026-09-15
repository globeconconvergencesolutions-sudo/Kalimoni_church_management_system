-- Slot image version history
-- Multiple uploads per placement; only one is live (slot_active).

alter table public.parish_media
  add column if not exists slot_active boolean not null default true;

-- Existing rows: keep current live behaviour
update public.parish_media
set slot_active = true
where is_slot = true and slot_key is not null;

update public.parish_media
set slot_active = false
where is_slot = false or slot_key is null;

drop index if exists parish_media_slot_key_unique;

-- Only one *live* custom image per placement
create unique index if not exists parish_media_slot_active_unique
  on public.parish_media (slot_key)
  where slot_key is not null and slot_active = true;

create index if not exists parish_media_slot_versions_idx
  on public.parish_media (slot_key, created_at desc)
  where slot_key is not null;
