/**
 * Append construction site videos to the Church Construction Progress story.
 *
 * Videos are stored under Cloudinary …/stories/church-construction-2026/videos
 * with sort_order 1000+ so they sit in a clear “Video diary” block after photos.
 *
 * Usage: pnpm seed:construction-videos
 */
import { existsSync, mkdirSync, readdirSync, copyFileSync, readFileSync, statSync } from 'node:fs'
import { basename, extname, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')

const SOURCE_DIR =
  process.env.CONSTRUCTION_VIDEOS_SOURCE ||
  'C:/Users/qinal/OneDrive/Desktop/qin/Companies/Globcons ltd/Clients/Kalimoni/Desing/Images/Construction Images/recent'

const VIDEO_DIR =
  process.env.CONSTRUCTION_VIDEOS_DIR ||
  join(PROJECT_ROOT, 'content', 'construction-videos')

const ALBUM_SLUG = 'church-construction-2026'
/** Videos start at 1000 so photo story stays 0–999 and video diary is easy to extend. */
const VIDEO_SORT_BASE = 1000

const VIDEO_META: Record<string, { title: string; caption: string; sortOffset: number }> = {
  'MixerAtWork.mp4': {
    title: 'Mixer at work',
    caption: 'The concrete mixer turning on site — raw material becoming structure.',
    sortOffset: 0,
  },
  'WhatsApp Video 2026-09-29 at 1.01.26 PM.mp4': {
    title: 'Site walk — late September',
    caption: 'A short walk across the works in late September as walls and forms take shape.',
    sortOffset: 1,
  },
  'WhatsApp Video 2026-10-10 at 6.20.14 PM.mp4': {
    title: 'Evening progress — 10 Oct',
    caption: 'Evening light on the build: a quick look at how far the work has come.',
    sortOffset: 2,
  },
  'WhatsApp Video ff-10-10 at 6.20.14 PM.mp4': {
    title: 'Crew and structure — 10 Oct',
    caption: 'Another angle from 10 October — crews and rising structure in one glance.',
    sortOffset: 3,
  },
}

function loadEnv() {
  const raw = readFileSync(join(PROJECT_ROOT, '.env.local'), 'utf8')
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .filter(l => l && !l.startsWith('#') && l.includes('='))
      .map(l => {
        const i = l.indexOf('=')
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
      }),
  )
}

function sanitizeBase(file: string): string {
  return basename(file, extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
}

function metaFor(file: string) {
  return (
    VIDEO_META[file] || {
      title: basename(file, extname(file)).replace(/[-_]+/g, ' ').trim(),
      caption: 'Construction video diary — St. Theresa Kalimoni Parish.',
      sortOffset: 50,
    }
  )
}

// Copy latest source videos into the repo content folder
if (!existsSync(VIDEO_DIR)) mkdirSync(VIDEO_DIR, { recursive: true })
if (existsSync(SOURCE_DIR)) {
  for (const name of readdirSync(SOURCE_DIR)) {
    if (!/\.mp4$/i.test(name)) continue
    const dest = join(VIDEO_DIR, name)
    if (!existsSync(dest)) {
      copyFileSync(join(SOURCE_DIR, name), dest)
      console.log('copied', name)
    }
  }
}

const env = loadEnv()
const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  env.VITE_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const root = (env.CLOUDINARY_ROOT_FOLDER || 'Kalimoni').replace(/^\/+|\/+$/g, '')

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env')
  process.exit(1)
}
if (!env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
  console.error('Missing Cloudinary env')
  process.exit(1)
}

cloudinary.config({
  cloud_name: (env.CLOUDINARY_CLOUD_NAME || env.VITE_CLOUDINARY_CLOUD_NAME || '').toLowerCase(),
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

const sb = createClient(supabaseUrl, supabaseKey)
const login = await sb.auth.signInWithPassword({
  email: env.USER_EMAIL,
  password: env.USER_PASSWORD,
})
if (login.error) {
  console.error('login_fail', login.error.message)
  process.exit(1)
}

const albumRes = await sb.from('media_albums').select('id, body, summary').eq('slug', ALBUM_SLUG).maybeSingle()
if (albumRes.error || !albumRes.data?.id) {
  console.error('album_missing', albumRes.error?.message || 'Create the construction album first (pnpm seed:construction).')
  process.exit(1)
}
const albumId = albumRes.data.id

const storyBody = [
  'Foundations first — trenches, steel cages, and the quiet work of preparing the ground.',
  '',
  'Then formwork and pours — timber props, plywood shutters, and concrete finding its shape.',
  '',
  'Now walls rising — brick, beam, and the parish building becoming visible day by day.',
  '',
  'Scroll the photographs for the still moments. Play the video diary for the site in motion.',
].join('\n')

const storySummary =
  'Still photographs and a short video diary of the parish build — foundations, formwork, and walls rising at St. Theresa Kalimoni Parish.'

await sb
  .from('media_albums')
  .update({
    summary: storySummary,
    body: storyBody,
    updated_at: new Date().toISOString(),
  })
  .eq('id', albumId)

const existing = await sb
  .from('parish_media')
  .select('id, title, cloudinary_id, media_type, sort_order')
  .eq('album_id', albumId)

if (existing.error) {
  console.error('media_list_fail', existing.error.message)
  process.exit(1)
}

const rows = existing.data ?? []
const titles = new Set(rows.map(r => r.title))
const idLeaves = new Set(
  rows.flatMap(r => {
    const leaf = String(r.cloudinary_id || '').split('/').pop() || ''
    return [leaf, leaf.replace(/-[a-z0-9]{6,}$/i, '')]
  }),
)

const files = readdirSync(VIDEO_DIR)
  .filter(f => /\.mp4$/i.test(f))
  .sort((a, b) => (VIDEO_META[a]?.sortOffset ?? 50) - (VIDEO_META[b]?.sortOffset ?? 50))

if (!files.length) {
  console.error('No .mp4 files in', VIDEO_DIR)
  process.exit(1)
}

let uploaded = 0
let skipped = 0

for (const file of files) {
  const meta = metaFor(file)
  const base = sanitizeBase(file)
  if (titles.has(meta.title) || idLeaves.has(base) || [...idLeaves].some(id => id.startsWith(base))) {
    console.log('skip_existing', meta.title)
    skipped += 1
    continue
  }

  const full = join(VIDEO_DIR, file)
  const sortOrder = VIDEO_SORT_BASE + meta.sortOffset
  console.log('uploading_video', file, `(${(statSync(full).size / (1024 * 1024)).toFixed(1)} MB)`)

  let uploadedAsset: { public_id: string; secure_url: string }
  try {
    uploadedAsset = await cloudinary.uploader.upload(full, {
      folder: `${root}/stories/${ALBUM_SLUG}/videos`,
      public_id: `${base}-${Date.now().toString(36)}`,
      resource_type: 'video',
      overwrite: false,
      use_filename: false,
      unique_filename: false,
    })
  } catch (err) {
    console.error('cloudinary_fail', file, err instanceof Error ? err.message : err)
    process.exit(1)
  }

  const inserted = await sb
    .from('parish_media')
    .insert({
      cloudinary_id: uploadedAsset.public_id,
      url: uploadedAsset.secure_url,
      folder: `stories/${ALBUM_SLUG}/videos`,
      title: meta.title,
      category: 'Construction',
      alt: meta.caption,
      caption: meta.caption,
      published: true,
      sort_order: sortOrder,
      media_type: 'video',
      is_slot: false,
      album_id: albumId,
    })
    .select('id')
    .single()

  if (inserted.error || !inserted.data) {
    console.error('db_insert_fail', file, inserted.error?.message)
    try {
      await cloudinary.uploader.destroy(uploadedAsset.public_id, { resource_type: 'video' })
    } catch {
      /* ignore */
    }
    process.exit(1)
  }

  titles.add(meta.title)
  idLeaves.add(base)
  uploaded += 1
  console.log('ok', meta.title, inserted.data.id)
}

const counts = await sb.from('parish_media').select('id, media_type').eq('album_id', albumId).eq('published', true)
const photos = (counts.data ?? []).filter(r => r.media_type !== 'video').length
const videos = (counts.data ?? []).filter(r => r.media_type === 'video').length

console.log('done', { albumId, uploaded, skipped, photos, videos })
await sb.auth.signOut()
