import { getSupabase } from './supabase'
import { isMissingTable } from './supabaseErrors'
import type { ParishMedia } from './media'
import { getSlotDef, GALLERY_FOLDER_SLUGS } from './mediaSlots'

export async function fetchPublishedMedia(): Promise<ParishMedia[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('parish_media')
    .select('*')
    .eq('published', true)
    .or('is_slot.eq.false,is_slot.is.null')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) {
    if (!isMissingTable(error)) console.warn('fetchPublishedMedia', error.message)
    return []
  }
  return (data ?? []) as ParishMedia[]
}

export async function fetchPublishedSlots(): Promise<ParishMedia[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('parish_media')
    .select('*')
    .eq('is_slot', true)
    .eq('published', true)
  if (error) {
    if (!isMissingTable(error)) console.warn('fetchPublishedSlots', error.message)
    return []
  }
  return (data ?? []) as ParishMedia[]
}

export async function fetchStaffMedia(): Promise<{ media: ParishMedia[]; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { media: [], error: 'Supabase is not configured.' }
  const { data, error } = await supabase.from('parish_media').select('*').order('created_at', { ascending: false })
  if (error) return { media: [], error: error.message }
  return { media: (data ?? []) as ParishMedia[], error: null }
}

export async function saveStaffMediaMeta(
  id: string,
  patch: Partial<Pick<ParishMedia, 'title' | 'category' | 'alt' | 'published' | 'caption' | 'subtitle'>>,
): Promise<{ ok: boolean; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }
  const { data, error } = await supabase.from('parish_media').update(patch).eq('id', id).select('id').maybeSingle()
  if (error) return { ok: false, error: error.message }
  if (!data) return { ok: false, error: 'Media item not found or you do not have permission to edit it.' }
  return { ok: true, error: null }
}

async function mediaApi<T>(path: string, body: Record<string, unknown>): Promise<{ ok: boolean; error: string | null; data?: T }> {
  const token = await authToken()
  if (!token) return { ok: false, error: 'Please sign in to manage media.' }
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string } & T
  if (!res.ok || !data.ok) return { ok: false, error: data.error || 'Request failed.' }
  return { ok: true, error: null, data }
}

export async function deleteStaffMedia(id: string): Promise<{ ok: boolean; error: string | null }> {
  const result = await mediaApi('/api/media/delete', { id })
  return { ok: result.ok, error: result.error }
}

export async function clearSiteSlot(slotKey: string): Promise<{ ok: boolean; error: string | null }> {
  if (!getSlotDef(slotKey)) return { ok: false, error: 'Unknown placement on the website.' }
  const result = await mediaApi('/api/media/delete', { slotKey })
  return { ok: result.ok, error: result.error }
}

type UploadGallery = {
  mode: 'gallery'
  title: string
  category: string
  alt?: string
}

type UploadSlot = {
  mode: 'slot'
  slotKey: string
  caption?: string
  subtitle?: string
  alt?: string
}

async function authToken(): Promise<string | null> {
  const supabase = getSupabase()
  const session = await supabase?.auth.getSession()
  return session?.data.session?.access_token ?? null
}

export async function uploadParishMedia(
  file: File,
  meta: UploadGallery | UploadSlot,
): Promise<{ ok: boolean; error: string | null; media?: ParishMedia }> {
  const token = await authToken()
  if (!token) return { ok: false, error: 'Please sign in to upload media.' }

  const dataUrl = await fileToDataUrl(file)
  const isVideo = file.type.startsWith('video/')

  const body: Record<string, unknown> = {
    dataUrl,
    filename: file.name,
    mediaType: isVideo ? 'video' : 'image',
    mode: meta.mode,
  }

  if (meta.mode === 'gallery') {
    body.title = meta.title
    body.category = meta.category
    body.alt = meta.alt || meta.title
    body.folder = `gallery/${GALLERY_FOLDER_SLUGS[meta.category] || 'church-life'}`
  } else {
    const def = getSlotDef(meta.slotKey)
    if (!def) return { ok: false, error: 'Unknown placement on the website.' }
    body.slotKey = meta.slotKey
    body.caption = meta.caption ?? def.defaultCaption ?? ''
    body.subtitle = meta.subtitle ?? def.defaultSubtitle ?? ''
    body.alt = meta.alt || meta.caption || def.label
    body.title = def.label
  }

  const res = await fetch('/api/media/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean
    error?: string
    media?: ParishMedia
    stored?: boolean
    storeError?: string
  }
  if (!res.ok || !data.ok || data.stored === false) {
    return { ok: false, error: data.storeError || data.error || 'Upload failed.' }
  }
  if (!data.media) return { ok: false, error: 'Upload succeeded but no media record was returned.' }
  return { ok: true, error: null, media: data.media }
}

/** @deprecated Use uploadParishMedia */
export async function uploadParishImage(
  file: File,
  meta: { title: string; category: string; alt?: string; folder?: string },
): Promise<{ ok: boolean; error: string | null; media?: ParishMedia }> {
  return uploadParishMedia(file, { mode: 'gallery', title: meta.title, category: meta.category, alt: meta.alt })
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
