-- Media slots: site placements + gallery library (run after sprint4 giving/media)

alter table public.parish_media
  add column if not exists slot_key text,
  add column if not exists media_type text not null default 'image',
  add column if not exists page text,
  add column if not exists section text,
  add column if not exists label text,
  add column if not exists hint text,
  add column if not exists caption text,
  add column if not exists subtitle text,
  add column if not exists aspect_hint text,
  add column if not exists is_slot boolean not null default false;

create unique index if not exists parish_media_slot_key_unique
  on public.parish_media (slot_key)
  where slot_key is not null;

create index if not exists parish_media_slots_idx
  on public.parish_media (is_slot, page, section, sort_order);

create index if not exists parish_media_gallery_idx
  on public.parish_media (is_slot, published, sort_order)
  where is_slot = false;
