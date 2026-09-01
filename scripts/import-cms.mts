import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { POSTS } from '../src/data/blog.ts'
import { PARISH_EVENTS } from '../src/data/parishEvents.ts'
import { EUCHARIST_SLOTS, MASS_LIST_ROWS } from '../src/data/massSchedule.ts'

const raw = readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(
  raw.split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => {
    const i = l.indexOf('=')
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  }),
)

const sb = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
)

const login = await sb.auth.signInWithPassword({ email: env.USER_EMAIL, password: env.USER_PASSWORD })
if (login.error) {
  console.error('login_fail', login.error.message)
  process.exit(1)
}

const postsRes = await sb.from('posts').upsert(
  POSTS.map(p => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    author: p.author,
    date_label: p.date,
    read_time: p.readTime,
    excerpt: p.excerpt,
    cover_img: p.coverImg,
    tags: p.tags,
    body: p.body,
    published: true,
  })),
  { onConflict: 'slug' },
)
if (postsRes.error) {
  console.error('posts', postsRes.error.message)
  process.exit(1)
}

const eventsRes = await sb.from('parish_events').upsert(
  PARISH_EVENTS.map((e, i) => ({
    slug: e.id,
    date_label: e.date,
    month_label: e.month,
    title: e.title,
    category: e.category,
    time_label: e.time,
    description: e.desc,
    color: e.color,
    icon: e.icon,
    published: true,
    sort_order: i,
  })),
  { onConflict: 'slug' },
)
if (eventsRes.error) {
  console.error('events', eventsRes.error.message)
  process.exit(1)
}

await sb.from('mass_slots').delete().neq('id', '00000000-0000-0000-0000-000000000000')
const massRes = await sb.from('mass_slots').insert([
  ...EUCHARIST_SLOTS.map((s, i) => ({
    weekday: s.weekday,
    minutes_from_midnight: s.minutesFromMidnight,
    display_time: s.displayTime,
    display_label: s.displayTime,
    kind: 'eucharist',
    list_group: null,
    sort_order: i,
    published: true,
  })),
  ...MASS_LIST_ROWS.map((r, i) => ({
    weekday: null,
    minutes_from_midnight: null,
    display_time: r.times,
    display_label: r.label,
    kind: 'other',
    list_group: 'regular',
    sort_order: 100 + i,
    published: true,
  })),
])
if (massRes.error) {
  console.error('mass', massRes.error.message)
  process.exit(1)
}

const posts = await sb.from('posts').select('id', { count: 'exact', head: true })
const events = await sb.from('parish_events').select('id', { count: 'exact', head: true })
const mass = await sb.from('mass_slots').select('id', { count: 'exact', head: true })
console.log(`import_ok posts=${posts.count} events=${events.count} mass=${mass.count}`)
await sb.auth.signOut()
