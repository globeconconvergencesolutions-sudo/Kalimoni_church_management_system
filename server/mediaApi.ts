import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'
import { getSlotDef, GALLERY_FOLDER_SLUGS } from '../src/lib/mediaSlots'

export type ApiResult = { status: number; body: Record<string, unknown> }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AuthedClient = SupabaseClient<any, 'public', any>

export function envFrom(source: NodeJS.ProcessEnv | Record<string, string | undefined>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string') out[key] = value
  }
  return out
}

function configureCloudinary(env: Record<string, string>) {
  cloudinary.config({
    cloud_name: (env.CLOUDINARY_CLOUD_NAME || env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '').toLowerCase(),
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  })
}

async function destroyCloudinaryAsset(publicId: string, resourceType: 'image' | 'video') {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true })
  } catch (err) {
    console.warn('Cloudinary destroy failed:', publicId, err)
  }
}

async function persistMediaRow(
  authed: AuthedClient,
  media: Record<string, unknown>,
  opts: { slotKey?: string },
): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  if (opts.slotKey) {
    const existing = await authed
      .from('parish_media')
      .select('id')
      .eq('slot_key', opts.slotKey)
      .maybeSingle()
    if (existing.error) return { data: null, error: existing.error.message }
    if (existing.data?.id) {
      const updated = await authed
        .from('parish_media')
        .update(media)
        .eq('id', existing.data.id)
        .select('*')
        .single()
      return { data: updated.data, error: updated.error?.message ?? null }
    }
  }
  const inserted = await authed.from('parish_media').insert(media).select('*').single()
  return { data: inserted.data, error: inserted.error?.message ?? null }
}

export async function authenticateStaff(
  token: string,
  env: Record<string, string>,
): Promise<{ authed: AuthedClient } | ApiResult> {
  if (!token) {
    return { status: 401, body: { ok: false, error: 'Sign in required.' } }
  }
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL || ''
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
  if (!supabaseUrl || !supabaseKey) {
    return { status: 503, body: { ok: false, error: 'Supabase is not configured.' } }
  }
  const authed = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const userRes = await authed.auth.getUser(token)
  if (!userRes.data.user) {
    return { status: 401, body: { ok: false, error: 'Session expired. Sign in again.' } }
  }
  return { authed }
}

export async function processMediaDelete(
  body: { id?: string; slotKey?: string },
  token: string,
  env: Record<string, string>,
): Promise<ApiResult> {
  const staff = await authenticateStaff(token, env)
  if ('status' in staff) return staff
  const { authed } = staff

  if (!body.id && !body.slotKey) {
    return { status: 400, body: { ok: false, error: 'Missing media id or slot key.' } }
  }

  configureCloudinary(env)

  let query = authed.from('parish_media').select('*')
  if (body.id) query = query.eq('id', body.id)
  else query = query.eq('slot_key', body.slotKey!)
  const found = await query.maybeSingle()
  if (found.error) {
    return { status: 502, body: { ok: false, error: found.error.message } }
  }
  if (!found.data) {
    return { status: 404, body: { ok: false, error: 'Media item not found.' } }
  }

  const row = found.data as {
    id: string
    cloudinary_id: string
    media_type?: string
    is_slot?: boolean
    slot_key?: string | null
  }
  const resourceType = row.media_type === 'video' ? 'video' : 'image'

  const removed = await authed.from('parish_media').delete().eq('id', row.id)
  if (removed.error) {
    return { status: 502, body: { ok: false, error: removed.error.message } }
  }

  if (row.cloudinary_id) {
    await destroyCloudinaryAsset(row.cloudinary_id, resourceType)
  }

  return {
    status: 200,
    body: {
      ok: true,
      deletedId: row.id,
      slotKey: row.slot_key ?? null,
      wasSlot: Boolean(row.is_slot),
    },
  }
}

export async function processMediaUpload(
  body: {
    dataUrl?: string
    filename?: string
    title?: string
    category?: string
    alt?: string
    folder?: string
    mode?: 'slot' | 'gallery'
    slotKey?: string
    caption?: string
    subtitle?: string
    mediaType?: 'image' | 'video'
  },
  token: string,
  env: Record<string, string>,
): Promise<ApiResult> {
  const staff = await authenticateStaff(token, env)
  if ('status' in staff) return staff
  const { authed } = staff

  const isImage = body.dataUrl?.startsWith('data:image/')
  const isVideo = body.dataUrl?.startsWith('data:video/')
  if (!isImage && !isVideo) {
    return { status: 400, body: { ok: false, error: 'Choose a JPG, PNG, WebP image, or MP4/WebM video.' } }
  }
  const maxSize = isVideo ? 48_000_000 : 12_000_000
  if ((body.dataUrl?.length ?? 0) > maxSize) {
    return {
      status: 413,
      body: {
        ok: false,
        error: isVideo ? 'Video is too large. Use a file under about 32 MB.' : 'Image is too large. Use a file under about 8 MB.',
      },
    }
  }

  configureCloudinary(env)
  const root = (env.CLOUDINARY_ROOT_FOLDER || 'Kalimoni').replace(/^\/+|\/+$/g, '')
  const resourceType = isVideo ? 'video' : 'image'
  const mode = body.mode === 'slot' ? 'slot' : 'gallery'

  let folderName = (body.folder || 'gallery/church-life').replace(/[^a-zA-Z0-9/_-]/g, '')
  let publicId: string | undefined
  let slotDef: ReturnType<typeof getSlotDef>

  if (mode === 'slot') {
    if (!body.slotKey) {
      return { status: 400, body: { ok: false, error: 'Missing placement key.' } }
    }
    slotDef = getSlotDef(body.slotKey)
    if (!slotDef) {
      return { status: 400, body: { ok: false, error: 'Unknown placement on the website.' } }
    }
    if (slotDef.mediaType === 'image' && isVideo) {
      return { status: 400, body: { ok: false, error: 'This placement accepts images only.' } }
    }
    folderName = slotDef.cloudinaryPath.replace(/\/[^/]+$/, '')
    publicId = `${root}/${slotDef.cloudinaryPath}`
  } else {
    const category = (body.category || 'Church Life').trim()
    const slug = GALLERY_FOLDER_SLUGS[category] || 'church-life'
    folderName = `gallery/${slug}`
  }

  const folder = `${root}/${folderName}`

  try {
    const uploadOpts: Record<string, unknown> = {
      resource_type: resourceType,
      overwrite: mode === 'slot',
      invalidate: mode === 'slot',
    }
    if (mode === 'slot' && publicId) {
      uploadOpts.public_id = publicId
      uploadOpts.use_filename = false
      uploadOpts.unique_filename = false
    } else {
      uploadOpts.folder = folder
      uploadOpts.use_filename = true
      uploadOpts.unique_filename = true
      uploadOpts.overwrite = false
    }

    const uploaded = await cloudinary.uploader.upload(body.dataUrl!, uploadOpts)

    if (mode === 'slot' && body.slotKey && slotDef!) {
      const media = {
        cloudinary_id: uploaded.public_id as string,
        url: uploaded.secure_url as string,
        folder: folderName,
        title: (body.title || slotDef.label).trim(),
        category: slotDef.page,
        alt: (body.alt || slotDef.label).trim(),
        published: true,
        sort_order: slotDef.sortOrder,
        slot_key: body.slotKey,
        media_type: resourceType,
        page: slotDef.page,
        section: slotDef.section,
        label: slotDef.label,
        hint: slotDef.hint,
        caption: (body.caption || slotDef.defaultCaption || '').trim() || null,
        subtitle: (body.subtitle || slotDef.defaultSubtitle || '').trim() || null,
        aspect_hint: slotDef.aspect,
        is_slot: true,
      }
      const saved = await persistMediaRow(authed, media, { slotKey: body.slotKey })
      if (saved.error || !saved.data) {
        return { status: 502, body: { ok: false, error: saved.error || 'Could not save to the database.' } }
      }
      return { status: 200, body: { ok: true, media: saved.data } }
    }

    const media = {
      cloudinary_id: uploaded.public_id as string,
      url: uploaded.secure_url as string,
      folder: folderName,
      title: (body.title || body.filename || 'Parish media').trim(),
      category: (body.category || 'Church Life').trim(),
      alt: (body.alt || body.title || 'Parish media').trim(),
      published: true,
      sort_order: 0,
      media_type: resourceType,
      is_slot: false,
    }
    const saved = await persistMediaRow(authed, media, {})
    if (saved.error || !saved.data) {
      await destroyCloudinaryAsset(uploaded.public_id as string, resourceType)
      return { status: 502, body: { ok: false, error: saved.error || 'Could not save to the database.' } }
    }
    return { status: 200, body: { ok: true, media: saved.data } }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cloudinary upload failed'
    return { status: 502, body: { ok: false, error: message } }
  }
}
