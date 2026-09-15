import { getSupabase } from './supabase'
import { isMissingTable } from './supabaseErrors'
import type { ParishMedia } from './media'
import { getSlotDef, GALLERY_FOLDER_SLUGS } from './mediaSlots'
import { validateParishMediaFile } from './mediaUploadRules'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

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
  const withActive = await supabase
    .from('parish_media')
    .select('*')
    .eq('is_slot', true)
    .eq('published', true)
    .eq('slot_active', true)
  if (!withActive.error) return (withActive.data ?? []) as ParishMedia[]
  // Pre-migration fallback (no slot_active column yet)
  if (!/slot_active/i.test(withActive.error.message || '')) {
    if (!isMissingTable(withActive.error)) console.warn('fetchPublishedSlots', withActive.error.message)
    return []
  }
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
  patch: Partial<Pick<ParishMedia, 'title' | 'category' | 'alt' | 'published' | 'caption' | 'subtitle' | 'sort_order' | 'album_id' | 'slot_active'>>,
): Promise<{ ok: boolean; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }
  const { data, error } = await supabase.from('parish_media').update(patch).eq('id', id).select('id').maybeSingle()
  if (error) return { ok: false, error: error.message }
  if (!data) return { ok: false, error: 'Media item not found or you do not have permission to edit it.' }
  return { ok: true, error: null }
}

/** Make a previous upload live again for this placement. */
export async function activateSlotVersion(
  slotKey: string,
  mediaId: string,
): Promise<{ ok: boolean; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }
  if (!getSlotDef(slotKey)) return { ok: false, error: 'Unknown placement on the website.' }

  const retire = await supabase
    .from('parish_media')
    .update({ slot_active: false, published: false })
    .eq('slot_key', slotKey)
  if (retire.error) {
    if (/slot_active/i.test(retire.error.message)) {
      return {
        ok: false,
        error: 'Version history needs a database update. Run the media_slot_versions migration in Supabase, then try again.',
      }
    }
    return { ok: false, error: retire.error.message }
  }

  const activate = await supabase
    .from('parish_media')
    .update({ slot_active: true, published: true })
    .eq('id', mediaId)
    .eq('slot_key', slotKey)
    .select('id')
    .maybeSingle()
  if (activate.error) return { ok: false, error: activate.error.message }
  if (!activate.data) return { ok: false, error: 'That version was not found for this placement.' }
  return { ok: true, error: null }
}

function friendlyHttpError(status: number, fallback?: string): string {
  if (status === 413) {
    return 'This file is too large for the upload service. Try a smaller photo (under ~12 MB) or compress the video.'
  }
  if (status === 401 || status === 403) {
    return 'Your session expired or you do not have permission. Sign in again and retry.'
  }
  if (status === 502 || status === 504) {
    return 'The upload service timed out or failed. Wait a moment and try again.'
  }
  return fallback || `Request failed (${status}).`
}

async function mediaApi<T>(path: string, body: Record<string, unknown>): Promise<{ ok: boolean; error: string | null; data?: T }> {
  const token = await authToken()
  if (!token) return { ok: false, error: 'Please sign in to manage media.' }
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
  } catch {
    return { ok: false, error: 'Could not reach the upload service. Check your connection and try again.' }
  }
  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? ((await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; alreadyClear?: boolean } & T)
    : ({} as { ok?: boolean; error?: string; alreadyClear?: boolean } & T)
  if (res.status === 404 && !path.includes('/delete')) {
    return {
      ok: false,
      error: 'Upload service not found. On production, deploy the /api/media routes. Locally, restart the dev server (pnpm dev).',
    }
  }
  if (!res.ok || !data.ok) {
    return { ok: false, error: data.error || friendlyHttpError(res.status) }
  }
  return { ok: true, error: null, data }
}

export async function deleteStaffMedia(id: string): Promise<{ ok: boolean; error: string | null }> {
  const result = await mediaApi('/api/media/delete', { id })
  return { ok: result.ok, error: result.error }
}

export async function clearSiteSlot(
  slotKey: string,
): Promise<{ ok: boolean; error: string | null; alreadyClear?: boolean }> {
  if (!getSlotDef(slotKey)) return { ok: false, error: 'Unknown placement on the website.' }
  const result = await mediaApi<{ alreadyClear?: boolean }>('/api/media/delete', { slotKey })
  if (!result.ok) return { ok: false, error: result.error }
  return { ok: true, error: null, alreadyClear: Boolean(result.data?.alreadyClear) }
}

type UploadGallery = {
  mode: 'gallery'
  title: string
  category: string
  alt?: string
  caption?: string
  albumId?: string
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

  const allowVideo =
    meta.mode === 'gallery' ||
    (meta.mode === 'slot' && getSlotDef(meta.slotKey)?.mediaType === 'video')
  const check = validateParishMediaFile(file, { allowVideo })
  if (!check.ok) return { ok: false, error: check.error }

  let dataUrl: string
  try {
    dataUrl = await fileToDataUrl(file)
  } catch {
    return {
      ok: false,
      error: 'Could not read this file on your device. Try another format (JPG/PNG) or a smaller file.',
    }
  }

  // Rough guard: base64 ~33% larger; many hosts reject huge JSON bodies.
  if (dataUrl.length > 18 * 1024 * 1024) {
    return {
      ok: false,
      error: 'This file is too large to upload safely. Compress the photo (aim under ~12 MB) and try again.',
    }
  }

  const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name)

  const body: Record<string, unknown> = {
    dataUrl,
    filename: file.name,
    fileSize: file.size,
    mediaType: isVideo ? 'video' : 'image',
    mode: meta.mode,
  }

  if (meta.mode === 'gallery') {
    body.title = meta.title
    body.category = meta.category
    body.alt = meta.alt || meta.caption || meta.title
    body.caption = meta.caption || meta.alt || meta.title
    if (meta.albumId) {
      body.albumId = meta.albumId
      body.folder = `stories/${meta.albumId}`
    } else {
      body.folder = `gallery/${GALLERY_FOLDER_SLUGS[meta.category] || 'church-life'}`
    }
  } else {
    const def = getSlotDef(meta.slotKey)
    if (!def) return { ok: false, error: 'Unknown placement on the website.' }
    body.slotKey = meta.slotKey
    body.caption = meta.caption ?? def.defaultCaption ?? ''
    body.subtitle = meta.subtitle ?? def.defaultSubtitle ?? ''
    body.alt = meta.alt || meta.caption || def.label
    body.title = def.label
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/media/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
  } catch {
    return { ok: false, error: 'Could not reach the upload service. Check your connection and try again.' }
  }
  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? ((await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        media?: ParishMedia
        stored?: boolean
        storeError?: string
      })
    : {}
  if (res.status === 404) {
    return {
      ok: false,
      error: 'Upload service not found. On production, deploy the /api/media routes. Locally, restart the dev server (pnpm dev).',
    }
  }
  if (!res.ok || !data.ok || data.stored === false) {
    return {
      ok: false,
      error: data.storeError || data.error || friendlyHttpError(res.status, `Upload failed (${res.status}).`),
    }
  }
  if (!data.media) {
    return {
      ok: false,
      error: 'Upload reached Cloudinary but the parish database did not save a record. Nothing is live yet — try again.',
    }
  }
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
