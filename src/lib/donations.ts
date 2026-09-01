import { getSupabase } from './supabase'
import type { ParishMedia } from './media'

export async function fetchStaffDonations(): Promise<{ rows: Record<string, unknown>[]; error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { rows: [], error: 'Supabase is not configured.' }
  const { data, error } = await supabase.from('donations').select('*').order('created_at', { ascending: false })
  if (error) return { rows: [], error: error.message }
  return { rows: data ?? [], error: null }
}

export type { ParishMedia }
