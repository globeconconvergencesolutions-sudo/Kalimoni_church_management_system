import { getSupabase } from './supabase'
import { isMissingTable } from './supabaseErrors'
import type { Notice, NoticeDraft } from './noticeTypes'

export async function fetchLiveNotices(): Promise<Notice[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const now = Date.now()
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('published', true)
    .order('pin', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    if (!isMissingTable(error)) console.warn('fetchLiveNotices', error.message)
    return []
  }

  return ((data ?? []) as Notice[]).filter(n => {
    if (n.starts_at && new Date(n.starts_at).getTime() > now) return false
    if (n.ends_at && new Date(n.ends_at).getTime() < now) return false
    return true
  })
}

export async function fetchAllNotices(): Promise<{ notices: Notice[]; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { notices: [], error: 'Supabase is not configured.' }

  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .order('pin', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    const hint = isMissingTable(error)
      ? 'The notices table is missing. Run supabase/migrations/20260831_sprint1_notices.sql in the Supabase SQL Editor.'
      : error.message
    return { notices: [], error: hint }
  }
  return { notices: (data ?? []) as Notice[], error: null }
}

export async function fetchNotice(id: string): Promise<Notice | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase.from('notices').select('*').eq('id', id).maybeSingle()
  if (error) return null
  return data as Notice | null
}

export async function createNotice(draft: NoticeDraft, userId: string | null): Promise<{ notice: Notice | null; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { notice: null, error: 'Supabase is not configured.' }

  const { data, error } = await supabase
    .from('notices')
    .insert({
      ...draft,
      created_by: userId,
    })
    .select()
    .single()

  if (error) return { notice: null, error: error.message }
  return { notice: data as Notice, error: null }
}

export async function updateNotice(id: string, draft: NoticeDraft): Promise<{ notice: Notice | null; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { notice: null, error: 'Supabase is not configured.' }

  const { data, error } = await supabase
    .from('notices')
    .update(draft)
    .eq('id', id)
    .select()
    .single()

  if (error) return { notice: null, error: error.message }
  return { notice: data as Notice, error: null }
}

export async function deleteNotice(id: string): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return 'Supabase is not configured.'
  const { error } = await supabase.from('notices').delete().eq('id', id)
  return error ? error.message : null
}
