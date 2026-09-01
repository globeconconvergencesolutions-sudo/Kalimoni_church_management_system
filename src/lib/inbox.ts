import { getSupabase } from './supabase'
import { isMissingTable } from './supabaseErrors'
import type { InboxKind, InboxMessage, InboxPayload, InboxStatus } from './inboxTypes'

export async function submitInbox(payload: InboxPayload): Promise<{ ok: boolean; error: string | null; emailSent?: boolean }> {
  try {
    const res = await fetch('/api/inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; emailSent?: boolean }
    if (res.ok && data.ok) return { ok: true, error: null, emailSent: data.emailSent }
    if (res.status !== 404) {
      return { ok: false, error: data.error || 'Could not send your message. Please try again.' }
    }
  } catch {
    // Static hosts have no Vite /api/inbox — fall through to Supabase insert.
  }

  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'The parish inbox is not configured yet.' }
  const { error } = await supabase.from('inbox_messages').insert({
    kind: payload.kind,
    name: payload.name?.trim() || null,
    email: payload.email.trim(),
    country: payload.country?.trim() || null,
    subject: payload.subject?.trim() || null,
    body: payload.body?.trim() || null,
    email_sent: false,
  })
  if (error) {
    if (isMissingTable(error)) {
      return { ok: false, error: 'We could not deliver your message right now. Please call the parish or try again shortly.' }
    }
    return { ok: false, error: error.message }
  }
  return { ok: true, error: null, emailSent: false }
}

export async function fetchInbox(kind?: InboxKind | 'all'): Promise<{ messages: InboxMessage[]; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { messages: [], error: 'Supabase is not configured.' }
  let query = supabase.from('inbox_messages').select('*').order('created_at', { ascending: false })
  if (kind && kind !== 'all') query = query.eq('kind', kind)
  const { data, error } = await query
  if (error) return { messages: [], error: error.message }
  return { messages: (data ?? []) as InboxMessage[], error: null }
}

export async function updateInboxStatus(id: string, status: InboxStatus): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return 'Supabase is not configured.'
  const { error } = await supabase.from('inbox_messages').update({ status }).eq('id', id)
  return error?.message ?? null
}

export async function deleteInboxMessage(id: string): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return 'Supabase is not configured.'
  const { error } = await supabase.from('inbox_messages').delete().eq('id', id)
  return error?.message ?? null
}

export async function inboxTableReady(): Promise<{ ready: boolean; message: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { ready: false, message: 'Supabase is not configured.' }
  const { error } = await supabase.from('inbox_messages').select('id').limit(1)
  if (error && isMissingTable(error)) {
    return { ready: false, message: 'The inbox is not available right now. Please try again later.' }
  }
  if (error) return { ready: false, message: error.message }
  return { ready: true, message: null }
}
