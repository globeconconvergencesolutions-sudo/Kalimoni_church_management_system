import { getSupabase } from './supabase'
import { isMissingTable } from './supabaseErrors'
import type { ParishMedia } from './media'

export type MediaAlbumStatus = 'draft' | 'published'

export type MediaAlbum = {
  id: string
  slug: string
  title: string
  summary: string
  body: string
  cover_media_id: string | null
  category: string
  status: MediaAlbumStatus
  featured: boolean
  sort_order: number
  related_post_slug: string | null
  published_at: string | null
  created_at?: string
  updated_at?: string
}

export type MediaAlbumWithCover = MediaAlbum & {
  cover?: ParishMedia | null
  items?: ParishMedia[]
}

export const STORY_CATEGORIES = [
  'Construction',
  'Celebrations',
  'Community Outreach',
  'Church Life',
  'Sacraments',
  'Youth Activities',
] as const

export function slugifyAlbum(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function fetchPublishedAlbums(): Promise<MediaAlbum[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('media_albums')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false })
  if (error) {
    if (!isMissingTable(error)) console.warn('fetchPublishedAlbums', error.message)
    return []
  }
  return (data ?? []) as MediaAlbum[]
}

export async function fetchFeaturedAlbum(): Promise<MediaAlbumWithCover | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('media_albums')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) {
    if (!isMissingTable(error)) console.warn('fetchFeaturedAlbum', error.message)
    return null
  }
  if (!data) return null
  const album = data as MediaAlbum
  let cover: ParishMedia | null = null
  if (album.cover_media_id) {
    const coverRes = await supabase.from('parish_media').select('*').eq('id', album.cover_media_id).maybeSingle()
    cover = (coverRes.data as ParishMedia) ?? null
  }
  if (!cover) {
    const first = await supabase
      .from('parish_media')
      .select('*')
      .eq('album_id', album.id)
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle()
    cover = (first.data as ParishMedia) ?? null
  }
  return { ...album, cover }
}

export async function fetchPublishedAlbumBySlug(slug: string): Promise<MediaAlbumWithCover | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('media_albums')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) {
    if (!isMissingTable(error)) console.warn('fetchPublishedAlbumBySlug', error.message)
    return null
  }
  if (!data) return null
  const album = data as MediaAlbum
  const itemsRes = await supabase
    .from('parish_media')
    .select('*')
    .eq('album_id', album.id)
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  const items = (itemsRes.data ?? []) as ParishMedia[]
  let cover: ParishMedia | null = null
  if (album.cover_media_id) {
    cover = items.find(i => i.id === album.cover_media_id) ?? null
    if (!cover) {
      const coverRes = await supabase.from('parish_media').select('*').eq('id', album.cover_media_id).maybeSingle()
      cover = (coverRes.data as ParishMedia) ?? null
    }
  }
  if (!cover) cover = items[0] ?? null
  return { ...album, cover, items }
}

export async function fetchStaffAlbums(): Promise<{ albums: MediaAlbum[]; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { albums: [], error: 'Supabase is not configured.' }
  const { data, error } = await supabase
    .from('media_albums')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) return { albums: [], error: error.message }
  return { albums: (data ?? []) as MediaAlbum[], error: null }
}

export async function fetchStaffAlbum(id: string): Promise<{ album: MediaAlbum | null; items: ParishMedia[]; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { album: null, items: [], error: 'Supabase is not configured.' }
  const albumRes = await supabase.from('media_albums').select('*').eq('id', id).maybeSingle()
  if (albumRes.error) return { album: null, items: [], error: albumRes.error.message }
  if (!albumRes.data) return { album: null, items: [], error: 'Story not found.' }
  const itemsRes = await supabase
    .from('parish_media')
    .select('*')
    .eq('album_id', id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  return {
    album: albumRes.data as MediaAlbum,
    items: (itemsRes.data ?? []) as ParishMedia[],
    error: itemsRes.error?.message ?? null,
  }
}

export type AlbumDraft = {
  title: string
  slug: string
  summary: string
  body?: string
  category: string
  status: MediaAlbumStatus
  featured: boolean
  related_post_slug?: string | null
  cover_media_id?: string | null
  sort_order?: number
}

export async function saveStaffAlbum(
  id: string | null,
  draft: AlbumDraft,
): Promise<{ ok: boolean; error: string | null; album?: MediaAlbum }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }
  const slug = (draft.slug || slugifyAlbum(draft.title)).trim()
  if (!draft.title.trim()) return { ok: false, error: 'Give this story a title.' }
  if (!slug) return { ok: false, error: 'A URL slug is required.' }

  const payload = {
    title: draft.title.trim(),
    slug,
    summary: (draft.summary || '').trim(),
    body: (draft.body || '').trim(),
    category: (draft.category || 'Construction').trim(),
    status: draft.status,
    featured: Boolean(draft.featured),
    related_post_slug: draft.related_post_slug?.trim() || null,
    cover_media_id: draft.cover_media_id || null,
    sort_order: draft.sort_order ?? 0,
    updated_at: new Date().toISOString(),
  }

  if (id) {
    const { data, error } = await supabase.from('media_albums').update(payload).eq('id', id).select('*').single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, error: null, album: data as MediaAlbum }
  }

  const { data, error } = await supabase.from('media_albums').insert(payload).select('*').single()
  if (error) return { ok: false, error: error.message }
  return { ok: true, error: null, album: data as MediaAlbum }
}

export async function deleteStaffAlbum(id: string): Promise<{ ok: boolean; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }
  // Unlink media first so FK set-null is clean; keep gallery rows
  await supabase.from('parish_media').update({ album_id: null }).eq('album_id', id)
  const { error } = await supabase.from('media_albums').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true, error: null }
}

export async function setAlbumCover(albumId: string, mediaId: string): Promise<{ ok: boolean; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }
  const { error } = await supabase
    .from('media_albums')
    .update({ cover_media_id: mediaId, updated_at: new Date().toISOString() })
    .eq('id', albumId)
  if (error) return { ok: false, error: error.message }
  return { ok: true, error: null }
}

export async function updateAlbumItemSort(
  items: { id: string; sort_order: number }[],
): Promise<{ ok: boolean; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }
  for (const item of items) {
    const { error } = await supabase.from('parish_media').update({ sort_order: item.sort_order }).eq('id', item.id)
    if (error) return { ok: false, error: error.message }
  }
  return { ok: true, error: null }
}
