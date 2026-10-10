/**
 * Seed / append Church Construction Progress photos from local JPEGs.
 *
 * Prerequisites:
 * 1. Run supabase/migrations/20260915_media_albums.sql in Supabase SQL Editor
 * 2. .env.local has VITE_SUPABASE_*, CLOUDINARY_*, USER_EMAIL, USER_PASSWORD
 *
 * Images live in content/construction-images/
 * Usage: pnpm seed:construction
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
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
  // Recent additions (October 2026)
  'BeamsSetup.jpeg': {
    title: 'Beam formwork in place',
    caption: 'Timber and plywood beam forms set above the rising structure, ready for the next concrete lift.',
  },
  'Briks.jpeg': {
    title: 'Brickwork underway',
    caption: 'Masonry courses going up as walls begin to fill in between the concrete frame.',
  },
  'ConstructionGoingon.jpeg': {
    title: 'Full site activity',
    caption: 'A wide view of active construction — crews, materials, and structure advancing together.',
  },
  'CrewWorking.jpeg': {
    title: 'Crew on the scaffold',
    caption: 'Parish builders at work on scaffolding as the structure climbs higher.',
  },
  'Filling up.jpeg': {
    title: 'Filling and packing',
    caption: 'Workers fill and pack material along a wall line as the build proceeds.',
  },
  'PeopleWOrking.jpeg': {
    title: 'Hands on the job',
    caption: 'Team members coordinate on site — every stage depends on careful, shared labour.',
  },
  'ProgressProceeding.jpeg': {
    title: 'Steady progress',
    caption: 'Another week of visible progress on the parish building works at Kalimoni.',
  },
  'WallCOnstructin.jpeg': {
    title: 'Wall construction',
    caption: 'Wall sections rising with blockwork and reinforcement as the footprint becomes clear.',
  },
  'WokersWorking.jpeg': {
    title: 'Workers on site',
    caption: 'Builders continue the day-to-day craft of raising the church construction.',
  },
  'WhatsApp Image 2026-10-09 at 4.25.26 PM.jpeg': {
    title: 'October site update — structure',
    caption: 'Recent site photograph showing the advancing structural work in October 2026.',
  },
  'WhatsApp Image 2026-10-09 at 4.25.27 PM.jpeg': {
    title: 'October site update — walls',
    caption: 'Wall lines and framing continue to take shape across the construction ground.',
  },
  'WhatsApp Image 2026-10-09 at 4.25.28 PM.jpeg': {
    title: 'October site update — detail',
    caption: 'A closer look at recent detailing and materials on the parish build.',
  },
  'WhatsApp Image 2026-10-09 at 4.25.31 PM.jpeg': {
    title: 'October site update — frame',
    caption: 'The concrete frame and openings show how the building is emerging.',
  },
  'WhatsApp Image 2026-10-09 at 4.25.32 PM.jpeg': {
    title: 'October site update — elevation',
    caption: 'An elevation view of recent construction progress at St. Theresa Kalimoni Parish.',
  },
  'WhatsApp Image 2026-10-09 at 4.25.33 PM.jpeg': {
    title: 'October site update — yard',
    caption: 'Materials and works in the yard as the October phase continues.',
  },
  'WhatsApp Image 2026-10-09 at 4.25.34 PM.jpeg': {
    title: 'October site update — workface',
    caption: 'Active workface on the parish construction site in early October 2026.',
  },
  'WhatsApp Image 202ss6-10-09 at 4.25.38 PM.jpeg': {
    title: 'October site update — late day',
    caption: 'Late-day photograph from the October construction set on the parish grounds.',
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

function titleFor(file: string): { title: string; caption: string } {
  return (
    CAPTIONS[file] || {
      title: basename(file, extname(file)).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim(),
      caption: 'Construction progress at St. Theresa Kalimoni Parish.',
    }
  )
}

function sanitizePublicIdBase(file: string): string {
  return basename(file, extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
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
if (!existsSync(IMAGE_DIR)) {
  console.error('Image directory not found:', IMAGE_DIR)
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
    'A look at ongoing building works at St. Theresa Kalimoni Parish — foundations, formwork, rebar, brickwork, and the hands that raise the walls.',
  body:
    'These photographs document current construction on the parish grounds. From trenches and column cages to timber formwork, brickwork, and concrete pours, the images invite the parish family to follow the progress, pray for the workers, and support the mission as walls rise.',
  category: 'Construction',
  status: 'published',
  featured: true,
  related_post_slug: POST_SLUG,
  sort_order: 0,
}

let albumId: string
const existing = await sb.from('media_albums').select('id, cover_media_id').eq('slug', ALBUM_SLUG).maybeSingle()
if (existing.error) {
  console.error('album_table_error', existing.error.message)
  console.error('Run supabase/migrations/20260915_media_albums.sql in the Supabase SQL Editor first.')
  process.exit(1)
}
if (existing.data?.id) {
  albumId = existing.data.id
  const upd = await sb
    .from('media_albums')
    .update({ ...albumPayload, updated_at: new Date().toISOString() })
    .eq('id', albumId)
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

const existingMedia = await sb
  .from('parish_media')
  .select('id, title, cloudinary_id, sort_order, caption')
  .eq('album_id', albumId)
  .order('sort_order', { ascending: true })

if (existingMedia.error) {
  console.error('media_list_fail', existingMedia.error.message)
  process.exit(1)
}

const existingRows = existingMedia.data ?? []
const existingTitles = new Set(existingRows.map(r => r.title))
const existingIds = new Set(
  existingRows.flatMap(r => {
    const id = String(r.cloudinary_id || '')
    const leaf = id.split('/').pop() || ''
    return [leaf, leaf.replace(/-[a-z0-9]{6,}$/i, '')]
  }),
)

let sortOrder =
  existingRows.reduce((max, r) => Math.max(max, typeof r.sort_order === 'number' ? r.sort_order : -1), -1) + 1
let coverId: string | null = existing.data?.cover_media_id ?? existingRows[0]?.id ?? null
let uploadedCount = 0
let skippedCount = 0

const files = readdirSync(IMAGE_DIR)
  .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))

if (files.length === 0) {
  console.error('No image files found in', IMAGE_DIR)
  process.exit(1)
}

for (const file of files) {
  const full = join(IMAGE_DIR, file)
  const meta = titleFor(file)
  const publicBase = sanitizePublicIdBase(file)

  const alreadyByTitle = existingTitles.has(meta.title)
  const alreadyByFile =
    existingIds.has(publicBase) ||
    [...existingIds].some(id => id.startsWith(publicBase))

  if (alreadyByTitle || alreadyByFile) {
    console.log('skip_existing', meta.title)
    skippedCount += 1
    continue
  }

  console.log('uploading', file)
  let uploaded: { public_id: string; secure_url: string }
  try {
    uploaded = await cloudinary.uploader.upload(full, {
      folder: `${root}/stories/${ALBUM_SLUG}`,
      public_id: `${publicBase}-${Date.now().toString(36)}`,
      resource_type: 'image',
      use_filename: false,
      unique_filename: false,
      overwrite: false,
    })
  } catch (err) {
    console.error('cloudinary_fail', file, err instanceof Error ? err.message : err)
    process.exit(1)
  }

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

  existingTitles.add(meta.title)
  existingIds.add(publicBase)
  if (!coverId) coverId = inserted.data.id
  console.log('ok', meta.title, inserted.data.id)
  uploadedCount += 1
  sortOrder += 1
}

if (coverId) {
  const coverUpd = await sb.from('media_albums').update({ cover_media_id: coverId }).eq('id', albumId)
  if (coverUpd.error) {
    console.error('cover_update_fail', coverUpd.error.message)
    process.exit(1)
  }
}

const coverMedia = coverId
  ? await sb.from('parish_media').select('cloudinary_id,url').eq('id', coverId).maybeSingle()
  : null
const coverImg = coverMedia?.data?.cloudinary_id || coverMedia?.data?.url || ''

const totalInAlbum = await sb
  .from('parish_media')
  .select('id', { count: 'exact', head: true })
  .eq('album_id', albumId)

const postBody = [
  {
    type: 'paragraph',
    content:
      'Across the grounds of St. Theresa Kalimoni Parish, a new chapter of building is unfolding. These photographs — taken on site through 2026 — show foundations, steel cages, timber formwork, brickwork, and the daily labour of pouring concrete.',
  },
  { type: 'heading', content: 'What you are seeing' },
  {
    type: 'paragraph',
    content:
      'Rebar walls and column cages mark where structural concrete will rise. Marine plywood shutters, braced with timber props, hold the forms true. Brick courses, cement bags, mixers, and muddy trenches speak to the practical reality of parish building: faith expressed in materials, sweat, and careful craft.',
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
  date_label: 'October 2026',
  read_time: '3 min read',
  excerpt:
    'Foundations, formwork, brickwork, and concrete pours — a photo essay on the ongoing construction works at St. Theresa Kalimoni Parish.',
  cover_img: coverImg,
  tags: ['Construction', 'Parish Projects', 'Kalimoni', 'Building'],
  body: postBody,
  published: true,
  updated_at: new Date().toISOString(),
}

const postExisting = await sb.from('posts').select('id').eq('slug', POST_SLUG).maybeSingle()
if (postExisting.data?.id) {
  const upd = await sb.from('posts').update(postRow).eq('id', postExisting.data.id)
  if (upd.error) {
    console.error('post_update_fail', upd.error.message)
    process.exit(1)
  }
  console.log('post_updated')
} else {
  const ins = await sb.from('posts').insert(postRow)
  if (ins.error) {
    console.error('post_insert_fail', ins.error.message)
    process.exit(1)
  }
  console.log('post_created')
}

console.log('done', {
  albumId,
  albumSlug: ALBUM_SLUG,
  postSlug: POST_SLUG,
  uploaded: uploadedCount,
  skipped: skippedCount,
  totalInAlbum: totalInAlbum.count ?? existingRows.length + uploadedCount,
})
await sb.auth.signOut()
