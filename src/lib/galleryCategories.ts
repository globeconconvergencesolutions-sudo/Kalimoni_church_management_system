import { getSupabase } from './supabase'
import { isMissingTable } from './supabaseErrors'
import { GALLERY_CATEGORIES } from './mediaSlots'

export type GalleryCategory = {
  id: string
  name: string
  slug: string
  description: string
  sort_order: number
  visible: boolean
  created_at?: string
  updated_at?: string
}

type Result = { ok: boolean; error: string | null }

const MIGRATION_HINT =
  'Custom categories need a database update. Run the 20261013_gallery_categories migration in Supabase, then try again.'

export function slugifyCategory(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function normalizeCategoryName(input: string): string {
  return input.replace(/\s+/g, ' ').trim().slice(0, 60)
}

/** Built-in list used before the migration runs (or when Supabase is offline). */
export function defaultGalleryCategories(): GalleryCategory[] {
  return GALLERY_CATEGORIES.map((name, i) => ({
    id: `default-${slugifyCategory(name)}`,
    name,
    slug: slugifyCategory(name),
    description: '',
    sort_order: (i + 1) * 10,
    visible: true,
  }))
}

/**
 * Categories in display order. `missingTable` is true before the migration has
 * been run — the defaults are returned so the office keeps working.
 */
export async function fetchGalleryCategories(): Promise<{
  categories: GalleryCategory[]
  error: string | null
  missingTable: boolean
}> {
  const supabase = getSupabase()
  if (!supabase) return { categories: defaultGalleryCategories(), error: null, missingTable: true }
  const { data, error } = await supabase
    .from('gallery_categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) {
    if (isMissingTable(error)) return { categories: defaultGalleryCategories(), error: null, missingTable: true }
    return { categories: defaultGalleryCategories(), error: error.message, missingTable: false }
  }
  return { categories: (data ?? []) as GalleryCategory[], error: null, missingTable: false }
}

/**
 * Merge stored categories with any names found on media rows, so an item whose
 * category was never registered is still reachable (and can be moved out).
 */
export function mergeCategoryNames(categories: GalleryCategory[], usedNames: Iterable<string>): GalleryCategory[] {
  const known = new Set(categories.map(c => c.name.toLowerCase()))
  const extras: GalleryCategory[] = []
  for (const raw of usedNames) {
    const name = (raw || '').trim()
    if (!name || known.has(name.toLowerCase())) continue
    known.add(name.toLowerCase())
    extras.push({
      id: `unlisted-${slugifyCategory(name)}`,
      name,
      slug: slugifyCategory(name),
      description: '',
      sort_order: 100000,
      visible: true,
    })
  }
  return [...categories, ...extras.sort((a, b) => a.name.localeCompare(b.name))]
}

export function isStoredCategory(cat: GalleryCategory): boolean {
  return !cat.id.startsWith('default-') && !cat.id.startsWith('unlisted-')
}

export async function createGalleryCategory(
  rawName: string,
  opts: { description?: string; sortOrder?: number } = {},
): Promise<Result & { category?: GalleryCategory }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }
  const name = normalizeCategoryName(rawName)
  if (!name) return { ok: false, error: 'Give the category a name.' }
  const slug = slugifyCategory(name)
  if (!slug) return { ok: false, error: 'Use letters or numbers in the category name.' }

  const { data, error } = await supabase
    .from('gallery_categories')
    .insert({
      name,
      slug,
      description: (opts.description || '').trim(),
      sort_order: opts.sortOrder ?? 1000,
    })
    .select('*')
    .maybeSingle()
  if (error) {
    if (isMissingTable(error)) return { ok: false, error: MIGRATION_HINT }
    if (error.code === '23505') return { ok: false, error: `A category called "${name}" already exists.` }
    return { ok: false, error: error.message }
  }
  return { ok: true, error: null, category: data as GalleryCategory }
}

/**
 * Rename a category and carry every gallery item and photo story with it.
 */
export async function renameGalleryCategory(cat: GalleryCategory, rawName: string): Promise<Result> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }
  const name = normalizeCategoryName(rawName)
  if (!name) return { ok: false, error: 'Give the category a name.' }
  if (name === cat.name) return { ok: true, error: null }

  if (isStoredCategory(cat)) {
    const { error } = await supabase
      .from('gallery_categories')
      .update({ name, slug: slugifyCategory(name) })
      .eq('id', cat.id)
    if (error) {
      if (error.code === '23505') return { ok: false, error: `A category called "${name}" already exists.` }
      return { ok: false, error: error.message }
    }
  } else {
    const created = await createGalleryCategory(name, { sortOrder: cat.sort_order })
    if (!created.ok) return created
  }

  const moved = await supabase.from('parish_media').update({ category: name }).eq('category', cat.name).is('slot_key', null)
  if (moved.error) return { ok: false, error: moved.error.message }

  const stories = await supabase.from('media_albums').update({ category: name }).eq('category', cat.name)
  if (stories.error && !isMissingTable(stories.error)) return { ok: false, error: stories.error.message }

  return { ok: true, error: null }
}

export async function updateGalleryCategory(
  cat: GalleryCategory,
  patch: Partial<Pick<GalleryCategory, 'description' | 'visible' | 'sort_order'>>,
): Promise<Result> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }
  if (!isStoredCategory(cat)) {
    const created = await createGalleryCategory(cat.name, {
      description: patch.description,
      sortOrder: patch.sort_order ?? cat.sort_order,
    })
    if (!created.ok || !created.category) return created
    if (patch.visible === false) return updateGalleryCategory(created.category, { visible: false })
    return { ok: true, error: null }
  }
  const { error } = await supabase.from('gallery_categories').update(patch).eq('id', cat.id)
  if (error) return { ok: false, error: isMissingTable(error) ? MIGRATION_HINT : error.message }
  return { ok: true, error: null }
}

/** Persist a new order: list position becomes sort_order (10, 20, 30…). */
export async function reorderGalleryCategories(ordered: GalleryCategory[]): Promise<Result> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }
  for (let i = 0; i < ordered.length; i++) {
    const cat = ordered[i]
    const sortOrder = (i + 1) * 10
    if (cat.sort_order === sortOrder && isStoredCategory(cat)) continue
    const result = await updateGalleryCategory(cat, { sort_order: sortOrder })
    if (!result.ok) return result
  }
  return { ok: true, error: null }
}

/**
 * Delete a category. Items in it are moved to `moveTo` first, so nothing is
 * ever orphaned.
 */
export async function deleteGalleryCategory(cat: GalleryCategory, moveTo: string | null): Promise<Result> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }

  if (moveTo && moveTo !== cat.name) {
    const moved = await supabase.from('parish_media').update({ category: moveTo }).eq('category', cat.name).is('slot_key', null)
    if (moved.error) return { ok: false, error: moved.error.message }
    const stories = await supabase.from('media_albums').update({ category: moveTo }).eq('category', cat.name)
    if (stories.error && !isMissingTable(stories.error)) return { ok: false, error: stories.error.message }
  }

  if (!isStoredCategory(cat)) return { ok: true, error: null }
  const { error } = await supabase.from('gallery_categories').delete().eq('id', cat.id)
  if (error) return { ok: false, error: isMissingTable(error) ? MIGRATION_HINT : error.message }
  return { ok: true, error: null }
}

/** Move one or many gallery items into a category. */
export async function moveMediaToCategory(ids: string[], category: string): Promise<Result & { moved: number }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.', moved: 0 }
  if (!ids.length) return { ok: true, error: null, moved: 0 }
  const name = normalizeCategoryName(category)
  if (!name) return { ok: false, error: 'Choose a category to move into.', moved: 0 }
  const { data, error } = await supabase.from('parish_media').update({ category: name }).in('id', ids).select('id')
  if (error) return { ok: false, error: error.message, moved: 0 }
  const moved = data?.length ?? 0
  if (moved === 0) return { ok: false, error: 'Nothing was moved — you may not have permission to edit these items.', moved }
  return { ok: true, error: null, moved }
}

/** Publish or unpublish many gallery items at once. */
export async function setMediaPublished(ids: string[], published: boolean): Promise<Result> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }
  if (!ids.length) return { ok: true, error: null }
  const { error } = await supabase.from('parish_media').update({ published }).in('id', ids)
  if (error) return { ok: false, error: error.message }
  return { ok: true, error: null }
}
