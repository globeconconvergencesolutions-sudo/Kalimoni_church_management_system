import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSupabase } from '../lib/supabase'

/** True once Supabase auth has a staff session (or config is missing). */
export function useStaffSession(): { ready: boolean; session: Session | null } {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setSession(null)
      setReady(true)
      return
    }
    let cancelled = false
    const apply = (next: Session | null) => {
      if (cancelled) return
      setSession(next)
      setReady(true)
    }
    void supabase.auth.getSession().then(({ data }) => apply(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => apply(next))
    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  return { ready, session }
}
