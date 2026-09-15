/**
 * Seed the Church Construction Progress photo story from local JPEGs.
 *
 * Prerequisites:
 * 1. Run supabase/migrations/20260915_media_albums.sql in Supabase SQL Editor
 * 2. .env.local has VITE_SUPABASE_*, CLOUDINARY_*, USER_EMAIL, USER_PASSWORD
 *
 * Images live in content/construction-images/ (copied into the repo).
 * Usage: pnpm seed:construction
 */
import { readFileSync, readdirSync } from 'node:fs'
import { basename, extname, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')

const IMAGE_DIR =
  process.env.CONSTRUCTION_IMAGES_DIR ||
  join(PROJECT_ROOT, 'content', 'construction-images')

const ALBUM_SLUG = 'church-construction-2026'
const POST_SLUG = 'church-construction-progress-2026'

const CAPTIONS: Record<string, { title: string; caption: string }> = {
  'ConstructionMenAtWork.jpeg': {
    title: 'Pouring concrete on site',
    caption: 'Workers level freshly poured concrete while Simba cement bags and a mixer keep the pour moving.',
  },
  'menAtWork.jpeg': {
    title: 'Mixer and scaffolding',
    caption: 'The orange concrete mixer at work beside timber formwork and rising rebar cages.',
  },
  'WhatsApp Image 2026-09-09 at 9.49.48 PM.jpeg': {
    title: 'Columns rising from the ground',
    caption: 'Formed columns stand in the muddy yard as the structural frame of the project takes shape.',
  },
  'WhatsApp Image 2026-09-09 at 9.49.49 PM Grills.jpeg': {
    title: 'Rebar wall and column cages',
    caption: 'Steel reinforcement grids for walls and columns, ready for the next concrete pour.',
  },
  'WhatsApp Image 2026-09-09 at 9.49.49 PM.jpeg': {
    title: 'Foundation trench progress',
    caption: 'A deep trench with footing and reinforcement marks the base of a major wall section.',
  },
  'WhatsApp Image 2026-09-09 at 9.49.50 PM GG.jpeg': {
    title: 'Formwork braced for pouring',
    caption: 'Marine plywood formwork braced with timber props along a reinforced wall line.',
  },
  'WhatsApp Image 2026-09-09 at 9.49.50 PM.jpeg': {
    title: 'Wall reinforcement underway',
    caption: 'Vertical and horizontal rebar rise above the excavated earth as the wall skeleton grows.',
  },
  'WhatsApp Image 2026-09-09 at 9.49.51 PM gg.jpeg': {
    title: 'Timber props and shutters',
    caption: 'Diagonal timber props hold the shutters true while the structure is prepared for concrete.',
  },
  'WhatsApp Image 2026-09-09 at 9.49.51 PM.jpeg': {
    title: 'Site overview — early walls',
    caption: 'An overview of early wall and column work across the parish construction ground.',
  },
  'WhatsApp Image 2026-09-09 at 9.49.52 PM.jpeg': {
    title: 'Excavation and steelwork',
    caption: 'Excavated earth, stone piles, and steel cages show the scale of the works in progress.',
  },
  'WhatsApp Image 2026-09-12 at 8.57.22 AM.jpeg': {
    title: 'Close-up of wall formwork',
    caption: 'Plywood formwork and bracing ready for another lift of reinforced concrete.',
  },
  'WhatsApp Image 2026-09-12 at 8.57.23 AM.jpeg': {
    title: 'Morning progress on site',
    caption: 'A morning view of formwork, rebar, and red earth as construction continues at Kalimoni.',
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

function fileToDataUrl(path: string): string {
  const buf = readFileSync(path)
  const ext = extname(path).toLowerCase()
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
  return `data:${mime};base64,${buf.toString('base64')}`
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

const albumPayload = {
  slug: ALBUM_SLUG,
  title: 'Church Construction Progress',
  summary:
    'A look at ongoing building works at St. Theresa Parish, Kalimoni — foundations, formwork, rebar, and the hands that pour the concrete.',
  body:
    'These photographs document current construction on the parish grounds. From trenches and column cages to timber formwork and concrete pours, the images invite the parish family to follow the progress, pray for the workers, and support the mission as walls rise.',
  category: 'Construction',
  status: 'published',
  featured: true,
  related_post_slug: POST_SLUG,
  sort_order: 0,
}

let albumId: string
const existing = await sb.from('media_albums').select('id').eq('slug', ALBUM_SLUG).maybeSingle()
if (existing.error) {
  console.error('album_table_error', existing.error.message)
  console.error('Run supabase/migrations/20260915_media_albums.sql in the Supabase SQL Editor first.')
  process.exit(1)
}
if (existing.data?.id) {
  albumId = existing.data.id
  const upd = await sb.from('media_albums').update({ ...albumPayload, updated_at: new Date().toISOString() }).eq('id', albumId)
  if (upd.error) {
    console.error('album_update_fail', upd.error.message)
    process.exit(1)
  }
  console.log('album_updated', albumId)
} else {
  const created = await sb.from('media_albums').insert(albumPayload).select('id').single()
  if (created.error || !created.data) {
    console.error('album_create_fail', created.error?.message)
    process.exit(1)
  }
  albumId = created.data.id
  console.log('album_created', albumId)
}

const files = readdirSync(IMAGE_DIR)
  .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
  .sort()

let coverId: string | null = null
let sortOrder = 0

for (const file of files) {
  const full = join(IMAGE_DIR, file)
  const meta = CAPTIONS[file] || {
    title: basename(file, extname(file)).replace(/[-_]+/g, ' '),
    caption: 'Construction progress at St. Theresa Parish, Kalimoni.',
  }

  const already = await sb
    .from('parish_media')
    .select('id')
    .eq('album_id', albumId)
    .eq('title', meta.title)
    .maybeSingle()
  if (already.data?.id) {
    console.log('skip_existing', meta.title)
    if (!coverId) coverId = already.data.id
    sortOrder += 1
    continue
  }

  const dataUrl = fileToDataUrl(full)
  console.log('uploading', file)
  const uploaded = await cloudinary.uploader.upload(dataUrl, {
    folder: `${root}/stories/${ALBUM_SLUG}`,
    resource_type: 'image',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  })

  const row = {
    cloudinary_id: uploaded.public_id,
    url: uploaded.secure_url,
    folder: `stories/${ALBUM_SLUG}`,
    title: meta.title,
    category: 'Construction',
    alt: meta.caption,
    caption: meta.caption,
    published: true,
    sort_order: sortOrder,
    media_type: 'image',
    is_slot: false,
    album_id: albumId,
  }
  const inserted = await sb.from('parish_media').insert(row).select('id').single()
  if (inserted.error || !inserted.data) {
    console.error('db_insert_fail', file, inserted.error?.message)
    try {
      await cloudinary.uploader.destroy(uploaded.public_id, { resource_type: 'image' })
    } catch {
      /* ignore */
    }
    process.exit(1)
  }
  if (!coverId) coverId = inserted.data.id
  console.log('ok', meta.title, inserted.data.id)
  sortOrder += 1
}

if (coverId) {
  await sb.from('media_albums').update({ cover_media_id: coverId }).eq('id', albumId)
}

const coverMedia = coverId
  ? await sb.from('parish_media').select('cloudinary_id,url').eq('id', coverId).maybeSingle()
  : null
const coverImg = coverMedia?.data?.cloudinary_id || coverMedia?.data?.url || ''

const postBody = [
  {
    type: 'paragraph',
    content:
      'Across the grounds of St. Theresa Parish, Kalimoni, a new chapter of building is unfolding. These photographs — taken on site in September 2026 — show foundations, steel cages, timber formwork, and the daily labour of pouring concrete.',
  },
  { type: 'heading', content: 'What you are seeing' },
  {
    type: 'paragraph',
    content:
      'Rebar walls and column cages mark where structural concrete will rise. Marine plywood shutters, braced with timber props, hold the forms true. Cement bags, mixers, and muddy trenches speak to the practical reality of parish building: faith expressed in materials, sweat, and careful craft.',
  },
  { type: 'heading', content: 'Follow the progress' },
  {
    type: 'paragraph',
    content:
      'We have gathered the photographs into a dedicated photo story so the parish family — at home in Kalimoni and across the diaspora — can walk the site with us. Visit the gallery filter for Construction, or open the full story page for captions beside each image.',
  },
  {
    type: 'list',
    items: [
      'Pray for the safety of every worker on site',
      'Share the photo story with family abroad',
      'Support the parish building fund when you are able',
    ],
  },
  {
    type: 'paragraph',
    content:
      'May these walls, when finished, house prayer, welcome, and the Vincentian spirit of service to God through service to humanity.',
  },
]

const postRow = {
  slug: POST_SLUG,
  title: 'Building in Faith: Church Construction Progress at Kalimoni',
  category: 'Parish News',
  author: 'Parish Communications',
  date_label: 'September 2026',
  read_time: '3 min read',
  excerpt:
    'Foundations, formwork, and concrete pours — a photo essay on the ongoing construction works at St. Theresa Parish, Kalimoni.',
  cover_img: coverImg,
  tags: ['Construction', 'Parish Projects', 'Kalimoni', 'Building'],
  body: postBody,
  published: true,
  updated_at: new Date().toISOString(),
}

const postExisting = await sb.from('posts').select('id').eq('slug', POST_SLUG).maybeSingle()
if (postExisting.data?.id) {
  const upd = await sb.from('posts').update(postRow).eq('id', postExisting.data.id)
  console.log(upd.error ? `post_update_fail ${upd.error.message}` : 'post_updated')
} else {
  const ins = await sb.from('posts').insert(postRow)
  console.log(ins.error ? `post_insert_fail ${ins.error.message}` : 'post_created')
}

console.log('done', { albumId, albumSlug: ALBUM_SLUG, postSlug: POST_SLUG, photos: sortOrder })
await sb.auth.signOut()
