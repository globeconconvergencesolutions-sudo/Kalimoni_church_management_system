import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'
import { getSlotDef, GALLERY_FOLDER_SLUGS } from '../src/lib/mediaSlots'
import { cloudinaryCloudName, envFrom, supabaseAnonKey, supabaseUrl } from './parishEnv'

export { envFrom }

export type ApiResult = { status: number; body: Record<string, unknown> }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AuthedClient = SupabaseClient<any, 'public', any>

function configureCloudinary(env: Record<string, string>) {
  cloudinary.config({
    cloud_name: cloudinaryCloudName(env),
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

const MAX_SLOT_VERSIONS = 8

async function persistMediaRow(
  authed: AuthedClient,
  media: Record<string, unknown>,
  opts: { slotKey?: string },
): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  // Gallery / non-slot: simple insert
  if (!opts.slotKey) {
    const inserted = await authed.from('parish_media').insert(media).select('*').single()
    return { data: inserted.data, error: inserted.error?.message ?? null }
  }

  // Slot versioning: retire previous live rows, then insert a new live version.
  // Do not overwrite Cloudinary — each replace keeps its own asset.
  const retire = await authed
    .from('parish_media')
    .update({ slot_active: false, published: false })
    .eq('slot_key', opts.slotKey)
    .eq('slot_active', true)
  if (retire.error) {
    // Pre-migration fallback: update the single existing row in place
    if (/slot_active/i.test(retire.error.message)) {
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
      const inserted = await authed.from('parish_media').insert(media).select('*').single()
      return { data: inserted.data, error: inserted.error?.message ?? null }
    }
    return { data: null, error: retire.error.message }
  }

  const row = { ...media, slot_active: true, published: true, is_slot: true, slot_key: opts.slotKey }
  const inserted = await authed.from('parish_media').insert(row).select('*').single()
  if (inserted.error) return { data: null, error: inserted.error.message }

  // Prune oldest versions beyond the cap (keep live + recent history)
  const versions = await authed
    .from('parish_media')
    .select('id, cloudinary_id, media_type, slot_active, created_at')
    .eq('slot_key', opts.slotKey)
    .order('created_at', { ascending: false })
  if (!versions.error && versions.data && versions.data.length > MAX_SLOT_VERSIONS) {
    const drop = versions.data.slice(MAX_SLOT_VERSIONS)
    for (const old of drop) {
      if (old.slot_active) continue
      await authed.from('parish_media').delete().eq('id', old.id)
      if (old.cloudinary_id) {
        await destroyCloudinaryAsset(
          old.cloudinary_id as string,
          old.media_type === 'video' ? 'video' : 'image',
        )
      }
    }
  }

  return { data: inserted.data, error: null }
}

export async function authenticateStaff(
  token: string,
  env: Record<string, string>,
): Promise<{ authed: AuthedClient } | ApiResult> {
  if (!token) {
    return { status: 401, body: { ok: false, error: 'Sign in required.' } }
  }
  const supabaseUrlValue = supabaseUrl(env)
  const supabaseKey = supabaseAnonKey(env)
  if (!supabaseUrlValue || !supabaseKey) {
    return { status: 503, body: { ok: false, error: 'Supabase is not configured.' } }
  }
  const authed = createClient(supabaseUrlValue, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const userRes = await authed.auth.getUser(token)
  if (!userRes.data.user) {
    return { status: 401, body: { ok: false, error: 'Session expired. Sign in again.' } }
  }
  return { authed }
}

export async function processMediaDelete(
  body: { id?: string; slotKey?: string; purge?: boolean },
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

  // Clear placement → site default, but keep version history (unless purge)
  if (body.slotKey && !body.id) {
    const listed = await authed.from('parish_media').select('*').eq('slot_key', body.slotKey)
    if (listed.error) return { status: 502, body: { ok: false, error: listed.error.message } }
    const rows = listed.data ?? []
    if (rows.length === 0) {
      return {
        status: 200,
        body: { ok: true, alreadyClear: true, slotKey: body.slotKey, wasSlot: true },
      }
    }

    if (body.purge) {
      for (const row of rows) {
        await authed.from('parish_media').delete().eq('id', row.id)
        if (row.cloudinary_id) {
          await destroyCloudinaryAsset(
            row.cloudinary_id as string,
            row.media_type === 'video' ? 'video' : 'image',
          )
        }
      }
      return { status: 200, body: { ok: true, purged: true, slotKey: body.slotKey, wasSlot: true } }
    }

    const deactivated = await authed
      .from('parish_media')
      .update({ slot_active: false, published: false })
      .eq('slot_key', body.slotKey)
    if (deactivated.error) {
      // Pre-migration: delete the single live row
      if (/slot_active/i.test(deactivated.error.message)) {
        for (const row of rows) {
          await authed.from('parish_media').delete().eq('id', row.id)
          if (row.cloudinary_id) {
            await destroyCloudinaryAsset(
              row.cloudinary_id as string,
              row.media_type === 'video' ? 'video' : 'image',
            )
          }
        }
        return { status: 200, body: { ok: true, slotKey: body.slotKey, wasSlot: true } }
      }
      return { status: 502, body: { ok: false, error: deactivated.error.message } }
    }
    return {
      status: 200,
      body: { ok: true, deactivated: true, slotKey: body.slotKey, wasSlot: true, keptVersions: rows.length },
    }
  }

  const found = await authed.from('parish_media').select('*').eq('id', body.id!).maybeSingle()
  if (found.error) {
    return { status: 502, body: { ok: false, error: found.error.message } }
  }
  if (!found.data) {
    return { status: 404, body: { ok: false, error: 'Media item not found. It may already have been removed.' } }
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
      alreadyClear: false,
    },
  }
}

export async function processMediaUpload(
  body: {
    dataUrl?: string
    filename?: string
    fileSize?: number
    title?: string
    category?: string
    alt?: string
    folder?: string
    mode?: 'slot' | 'gallery'
    slotKey?: string
    albumId?: string
    caption?: string
    subtitle?: string
    mediaType?: 'image' | 'video'
    sortOrder?: number
  },
  token: string,
  env: Record<string, string>,
): Promise<ApiResult> {
  const staff = await authenticateStaff(token, env)
  if ('status' in staff) return staff
  const { authed } = staff

  const mimeMatch = /^data:([^;,]+)/.exec(body.dataUrl || '')
  const mime = mimeMatch?.[1]?.toLowerCase() ?? ''
  const isImage = mime.startsWith('image/')
  const isVideo = mime.startsWith('video/')
  if (!isImage && !isVideo) {
    return {
      status: 400,
      body: {
        ok: false,
        error: 'Could not read this file. Try JPG, PNG, WebP, HEIC, MP4, or MOV.',
      },
    }
  }
  const byteSize =
    typeof body.fileSize === 'number' && body.fileSize > 0
      ? body.fileSize
      : Math.floor(((body.dataUrl?.length ?? 0) - (body.dataUrl?.indexOf(',') ?? 0) - 1) * 0.75)
  const maxBytes = isVideo ? 100 * 1024 * 1024 : 25 * 1024 * 1024
  if (byteSize > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024))
    return {
      status: 413,
      body: {
        ok: false,
        error: isVideo
          ? `Video is too large. Please use a file under about ${mb} MB.`
          : `Photo is too large. Please use a file under about ${mb} MB.`,
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
  let albumSlug: string | null = null
  let albumCategory: string | null = null

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
    // Unique asset per replace so previous versions stay on Cloudinary
    publicId = `${root}/${slotDef.cloudinaryPath}/${Date.now()}`
  } else if (body.albumId) {
    const albumRes = await authed
      .from('media_albums')
      .select('id, slug, category')
      .eq('id', body.albumId)
      .maybeSingle()
    if (albumRes.error) {
      return { status: 502, body: { ok: false, error: albumRes.error.message } }
    }
    if (!albumRes.data) {
      return { status: 404, body: { ok: false, error: 'Photo story not found.' } }
    }
    albumSlug = String(albumRes.data.slug).replace(/[^a-zA-Z0-9_-]/g, '')
    albumCategory = String(albumRes.data.category || 'Construction')
    folderName = `stories/${albumSlug}`
  } else {
    const category = (body.category || 'Church Life').trim()
    const slug = GALLERY_FOLDER_SLUGS[category] || 'church-life'
    folderName = `gallery/${slug}`
  }

  const folder = `${root}/${folderName}`

  try {
    const uploadOpts: Record<string, unknown> = {
      resource_type: resourceType,
      overwrite: false,
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
        slot_active: true,
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
        await destroyCloudinaryAsset(uploaded.public_id as string, resourceType)
        return {
          status: 502,
          body: {
            ok: false,
            stored: false,
            storeError: saved.error || 'Could not save to the database. The upload was rolled back.',
            error: saved.error || 'Could not save to the database. The upload was rolled back.',
          },
        }
      }
      return { status: 200, body: { ok: true, media: saved.data, stored: true } }
    }

    let sortOrder = typeof body.sortOrder === 'number' ? body.sortOrder : 0
    if (body.albumId) {
      const countRes = await authed
        .from('parish_media')
        .select('id', { count: 'exact', head: true })
        .eq('album_id', body.albumId)
      sortOrder = countRes.count ?? 0
    }

    const media = {
      cloudinary_id: uploaded.public_id as string,
      url: uploaded.secure_url as string,
      folder: folderName,
      title: (body.title || body.filename || 'Parish media').trim(),
      category: (body.category || albumCategory || 'Church Life').trim(),
      alt: (body.alt || body.caption || body.title || 'Parish media').trim(),
      caption: (body.caption || '').trim() || null,
      published: true,
      sort_order: sortOrder,
      media_type: resourceType,
      is_slot: false,
      album_id: body.albumId || null,
    }
    const saved = await persistMediaRow(authed, media, {})
    if (saved.error || !saved.data) {
      await destroyCloudinaryAsset(uploaded.public_id as string, resourceType)
      return { status: 502, body: { ok: false, error: saved.error || 'Could not save to the database.' } }
    }

    if (body.albumId && saved.data.id) {
      const albumCheck = await authed
        .from('media_albums')
        .select('cover_media_id')
        .eq('id', body.albumId)
        .maybeSingle()
      if (!albumCheck.data?.cover_media_id) {
        await authed
          .from('media_albums')
          .update({ cover_media_id: saved.data.id, updated_at: new Date().toISOString() })
          .eq('id', body.albumId)
      }
    }

    return { status: 200, body: { ok: true, media: saved.data } }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cloudinary upload failed'
    return { status: 502, body: { ok: false, error: message } }
  }
}
