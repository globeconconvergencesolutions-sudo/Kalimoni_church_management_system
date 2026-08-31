import { getSupabase } from './supabase'
import { isMissingTable } from './supabaseErrors'
import { POSTS, type BlogPost } from '../data/blog'
import { PARISH_EVENTS, type ParishEvent } from '../data/parishEvents'
import { EUCHARIST_SLOTS, MASS_LIST_ROWS, type EucharistSlot, type MassListRow } from '../data/massSchedule'

export type CmsStatus = 'static' | 'live' | 'unavailable'

function mapPost(row: Record<string, unknown>): BlogPost {
  return {
    slug: String(row.slug),
    title: String(row.title),
    category: String(row.category),
    author: String(row.author),
    date: String(row.date_label),
    readTime: String(row.read_time),
    excerpt: String(row.excerpt),
    coverImg: String(row.cover_img),
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    body: (row.body as BlogPost['body']) ?? [],
  }
}

function mapEvent(row: Record<string, unknown>): ParishEvent {
  return {
    id: String(row.slug ?? row.id),
    date: String(row.date_label),
    month: String(row.month_label),
    title: String(row.title),
    category: String(row.category),
    time: String(row.time_label),
    desc: String(row.description),
    color: String(row.color),
    icon: String(row.icon),
  }
}

export async function fetchPublishedPosts(): Promise<{ posts: BlogPost[]; source: CmsStatus }> {
  const supabase = getSupabase()
  if (!supabase) return { posts: POSTS, source: 'static' }
  const { data, error } = await supabase.from('posts').select('*').eq('published', true).order('created_at', { ascending: false })
  if (error) {
    if (!isMissingTable(error)) console.warn('fetchPublishedPosts', error.message)
    return { posts: POSTS, source: 'static' }
  }
  if (!data?.length) return { posts: POSTS, source: 'static' }
  return { posts: data.map(mapPost), source: 'live' }
}

export async function fetchPublishedPost(slug: string): Promise<BlogPost | undefined> {
  const { posts } = await fetchPublishedPosts()
  return posts.find(p => p.slug === slug)
}

export async function fetchPublishedEvents(): Promise<{ events: ParishEvent[]; source: CmsStatus }> {
  const supabase = getSupabase()
  if (!supabase) return { events: PARISH_EVENTS, source: 'static' }
  const { data, error } = await supabase.from('parish_events').select('*').eq('published', true).order('sort_order', { ascending: true })
  if (error) {
    if (!isMissingTable(error)) console.warn('fetchPublishedEvents', error.message)
    return { events: PARISH_EVENTS, source: 'static' }
  }
  if (!data?.length) return { events: PARISH_EVENTS, source: 'static' }
  return { events: data.map(mapEvent), source: 'live' }
}

export async function fetchMassList(): Promise<MassListRow[]> {
  const supabase = getSupabase()
  if (!supabase) return MASS_LIST_ROWS
  const { data, error } = await supabase
    .from('mass_slots')
    .select('*')
    .eq('published', true)
    .eq('list_group', 'regular')
    .order('sort_order', { ascending: true })
  if (error || !data?.length) return MASS_LIST_ROWS
  return data.map(row => ({ label: String(row.display_label), times: String(row.display_time) }))
}

export async function fetchEucharistSlots(): Promise<EucharistSlot[]> {
  const supabase = getSupabase()
  if (!supabase) return EUCHARIST_SLOTS
  const { data, error } = await supabase
    .from('mass_slots')
    .select('*')
    .eq('published', true)
    .eq('kind', 'eucharist')
    .not('weekday', 'is', null)
    .order('weekday', { ascending: true })
    .order('minutes_from_midnight', { ascending: true })
  if (error || !data?.length) return EUCHARIST_SLOTS
  return data.map(row => ({
    weekday: Number(row.weekday),
    minutesFromMidnight: Number(row.minutes_from_midnight),
    displayTime: String(row.display_time),
  }))
}

export async function importPrototypeContent(): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return 'Supabase is not configured.'

  const postRows = POSTS.map(p => ({
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
  }))

  const eventRows = PARISH_EVENTS.map((e, i) => ({
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
  }))

  const massRows = [
    ...EUCHARIST_SLOTS.map((s, i) => ({
      weekday: s.weekday,
      minutes_from_midnight: s.minutesFromMidnight,
      display_time: s.displayTime,
      display_label: s.displayTime,
      kind: 'eucharist',
      list_group: null as string | null,
      sort_order: i,
      published: true,
    })),
    ...MASS_LIST_ROWS.map((r, i) => ({
      weekday: null as number | null,
      minutes_from_midnight: null as number | null,
      display_time: r.times,
      display_label: r.label,
      kind: 'other',
      list_group: 'regular',
      sort_order: 100 + i,
      published: true,
    })),
  ]

  const postsRes = await supabase.from('posts').upsert(postRows, { onConflict: 'slug' })
  if (postsRes.error) return postsRes.error.message
  const eventsRes = await supabase.from('parish_events').upsert(eventRows, { onConflict: 'slug' })
  if (eventsRes.error) return eventsRes.error.message
  await supabase.from('mass_slots').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  const massRes = await supabase.from('mass_slots').insert(massRows)
  if (massRes.error) return massRes.error.message
  return null
}

export async function cmsTablesReady(): Promise<{ ready: boolean; message: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { ready: false, message: 'Supabase is not configured.' }
  for (const table of ['posts', 'parish_events', 'mass_slots'] as const) {
    const { error } = await supabase.from(table).select('id').limit(1)
    if (error && isMissingTable(error)) {
      return { ready: false, message: 'Run supabase/migrations/20260831_sprint2_cms.sql in the SQL Editor, then import content here.' }
    }
    if (error) return { ready: false, message: error.message }
  }
  return { ready: true, message: null }
}

export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return slug || 'item'
}

export type StaffPost = BlogPost & { id: string; published: boolean }

export type StaffEvent = ParishEvent & { dbId: string; published: boolean; sortOrder: number }

export type StaffMassSlot = {
  id: string
  weekday: number | null
  minutesFromMidnight: number | null
  displayTime: string
  displayLabel: string
  kind: string
  listGroup: string | null
  sortOrder: number
  published: boolean
}

function mapStaffPost(row: Record<string, unknown>): StaffPost {
  return { ...mapPost(row), id: String(row.id), published: Boolean(row.published) }
}

function mapStaffEvent(row: Record<string, unknown>): StaffEvent {
  return {
    ...mapEvent(row),
    dbId: String(row.id),
    published: Boolean(row.published),
    sortOrder: Number(row.sort_order ?? 0),
  }
}

function mapStaffMass(row: Record<string, unknown>): StaffMassSlot {
  return {
    id: String(row.id),
    weekday: row.weekday === null || row.weekday === undefined ? null : Number(row.weekday),
    minutesFromMidnight:
      row.minutes_from_midnight === null || row.minutes_from_midnight === undefined
        ? null
        : Number(row.minutes_from_midnight),
    displayTime: String(row.display_time),
    displayLabel: String(row.display_label),
    kind: String(row.kind),
    listGroup: row.list_group === null || row.list_group === undefined ? null : String(row.list_group),
    sortOrder: Number(row.sort_order ?? 0),
    published: Boolean(row.published),
  }
}

export async function fetchStaffPosts(): Promise<{ posts: StaffPost[]; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { posts: [], error: 'Supabase is not configured.' }
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
  if (error) return { posts: [], error: error.message }
  return { posts: (data ?? []).map(row => mapStaffPost(row as Record<string, unknown>)), error: null }
}

export async function fetchStaffPost(id: string): Promise<StaffPost | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase.from('posts').select('*').eq('id', id).maybeSingle()
  if (error || !data) return null
  return mapStaffPost(data as Record<string, unknown>)
}

export async function saveStaffPost(
  input: {
    id?: string
    slug: string
    title: string
    category: string
    author: string
    date: string
    readTime: string
    excerpt: string
    coverImg: string
    tags: string[]
    body: BlogPost['body']
    published: boolean
  },
): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return 'Supabase is not configured.'
  const row = {
    slug: input.slug,
    title: input.title,
    category: input.category,
    author: input.author,
    date_label: input.date,
    read_time: input.readTime,
    excerpt: input.excerpt,
    cover_img: input.coverImg,
    tags: input.tags,
    body: input.body,
    published: input.published,
    updated_at: new Date().toISOString(),
  }
  if (input.id) {
    const { error } = await supabase.from('posts').update(row).eq('id', input.id)
    return error?.message ?? null
  }
  const { error } = await supabase.from('posts').insert(row)
  return error?.message ?? null
}

export async function deleteStaffPost(id: string): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return 'Supabase is not configured.'
  const { error } = await supabase.from('posts').delete().eq('id', id)
  return error?.message ?? null
}

export async function fetchStaffEvents(): Promise<{ events: StaffEvent[]; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { events: [], error: 'Supabase is not configured.' }
  const { data, error } = await supabase.from('parish_events').select('*').order('sort_order', { ascending: true })
  if (error) return { events: [], error: error.message }
  return { events: (data ?? []).map(row => mapStaffEvent(row as Record<string, unknown>)), error: null }
}

export async function fetchStaffEvent(id: string): Promise<StaffEvent | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase.from('parish_events').select('*').eq('id', id).maybeSingle()
  if (error || !data) return null
  return mapStaffEvent(data as Record<string, unknown>)
}

export async function saveStaffEvent(
  input: {
    dbId?: string
    slug: string
    date: string
    month: string
    title: string
    category: string
    time: string
    desc: string
    color: string
    icon: string
    published: boolean
    sortOrder: number
  },
): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return 'Supabase is not configured.'
  const row = {
    slug: input.slug,
    date_label: input.date,
    month_label: input.month,
    title: input.title,
    category: input.category,
    time_label: input.time,
    description: input.desc,
    color: input.color,
    icon: input.icon,
    published: input.published,
    sort_order: input.sortOrder,
    updated_at: new Date().toISOString(),
  }
  if (input.dbId) {
    const { error } = await supabase.from('parish_events').update(row).eq('id', input.dbId)
    return error?.message ?? null
  }
  const { error } = await supabase.from('parish_events').insert(row)
  return error?.message ?? null
}

export async function deleteStaffEvent(id: string): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return 'Supabase is not configured.'
  const { error } = await supabase.from('parish_events').delete().eq('id', id)
  return error?.message ?? null
}

export async function fetchStaffMassSlots(): Promise<{ slots: StaffMassSlot[]; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { slots: [], error: 'Supabase is not configured.' }
  const { data, error } = await supabase.from('mass_slots').select('*').order('sort_order', { ascending: true })
  if (error) return { slots: [], error: error.message }
  return { slots: (data ?? []).map(row => mapStaffMass(row as Record<string, unknown>)), error: null }
}

export async function saveStaffMassSlot(input: Omit<StaffMassSlot, 'id'> & { id?: string }): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return 'Supabase is not configured.'
  const row = {
    weekday: input.weekday,
    minutes_from_midnight: input.minutesFromMidnight,
    display_time: input.displayTime,
    display_label: input.displayLabel,
    kind: input.kind,
    list_group: input.listGroup,
    sort_order: input.sortOrder,
    published: input.published,
  }
  if (input.id) {
    const { error } = await supabase.from('mass_slots').update(row).eq('id', input.id)
    return error?.message ?? null
  }
  const { error } = await supabase.from('mass_slots').insert(row)
  return error?.message ?? null
}

export async function deleteStaffMassSlot(id: string): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return 'Supabase is not configured.'
  const { error } = await supabase.from('mass_slots').delete().eq('id', id)
  return error?.message ?? null
}
