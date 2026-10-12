import { getSupabase } from './supabase'
import { isMissingTable } from './supabaseErrors'
import type {
  Testimonial,
  TestimonialMetaUpdate,
  TestimonialStatus,
  TestimonialSubmit,
} from './testimonialTypes'

export async function fetchPublishedTestimonials(): Promise<Testimonial[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('published', true)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    if (!isMissingTable(error)) console.warn('fetchPublishedTestimonials', error.message)
    return []
  }
  return (data ?? []) as Testimonial[]
}

export async function submitTestimonial(
  payload: TestimonialSubmit,
): Promise<{ ok: boolean; error: string | null }> {
  if (payload.website?.trim()) {
    return { ok: true, error: null }
  }

  const quote = payload.quote?.trim() ?? ''
  const displayName = payload.display_name?.trim() ?? ''
  if (!quote || !displayName) {
    return { ok: false, error: 'Please share your name and a few words.' }
  }
  if (quote.length > 800) {
    return { ok: false, error: 'Please keep your story under 800 characters.' }
  }

  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'The parish site is not fully configured yet.' }

  const { error } = await supabase.from('testimonials').insert({
    quote,
    display_name: displayName,
    role: payload.role?.trim() || null,
    location: payload.location?.trim() || null,
    status: 'pending',
    published: false,
  })

  if (error) {
    if (isMissingTable(error)) {
      return { ok: false, error: 'We could not receive your story right now. Please try again shortly.' }
    }
    return { ok: false, error: error.message }
  }
  return { ok: true, error: null }
}

export async function fetchStaffTestimonials(
  status?: TestimonialStatus | 'all',
): Promise<{ rows: Testimonial[]; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { rows: [], error: 'Supabase is not configured.' }

  let query = supabase.from('testimonials').select('*').order('created_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) {
    const hint = isMissingTable(error)
      ? 'Testimonials are not available yet. Run the testimonials migration in Supabase.'
      : error.message
    return { rows: [], error: hint }
  }
  return { rows: (data ?? []) as Testimonial[], error: null }
}

export async function setTestimonialStatus(
  id: string,
  status: TestimonialStatus,
  reviewedBy?: string | null,
): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return 'Supabase is not configured.'

  const patch: Record<string, unknown> = {
    status,
    published: status === 'published',
    reviewed_at: new Date().toISOString(),
  }
  if (reviewedBy !== undefined) patch.reviewed_by = reviewedBy

  const { error } = await supabase.from('testimonials').update(patch).eq('id', id)
  return error?.message ?? null
}

export async function saveStaffTestimonialMeta(
  id: string,
  meta: TestimonialMetaUpdate,
): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return 'Supabase is not configured.'

  const patch: Record<string, unknown> = {}
  if (meta.quote !== undefined) patch.quote = meta.quote.trim()
  if (meta.display_name !== undefined) patch.display_name = meta.display_name.trim()
  if (meta.role !== undefined) patch.role = meta.role?.trim() || null
  if (meta.location !== undefined) patch.location = meta.location?.trim() || null
  if (meta.sort_order !== undefined) patch.sort_order = meta.sort_order

  const { error } = await supabase.from('testimonials').update(patch).eq('id', id)
  return error?.message ?? null
}

export async function deleteTestimonial(id: string): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return 'Supabase is not configured.'
  const { error } = await supabase.from('testimonials').delete().eq('id', id)
  return error?.message ?? null
}

export async function countPendingTestimonials(): Promise<number> {
  const supabase = getSupabase()
  if (!supabase) return 0
  const { count, error } = await supabase
    .from('testimonials')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
  if (error) return 0
  return count ?? 0
}
