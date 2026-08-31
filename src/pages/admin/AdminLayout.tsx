import { useEffect, useState } from 'react'
import { Navigate, Outlet, Link, useNavigate } from 'react-router'
import type { Session } from '@supabase/supabase-js'
import { getSupabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/env'

export default function AdminLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const navigate = useNavigate()
  const supabase = getSupabase()

  useEffect(() => {
    if (!supabase) {
      setSession(null)
      return
    }
    void supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => sub.subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    await supabase?.auth.signOut()
    navigate('/admin/login')
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#FAF6F0' }}>
        <p className="text-sm" style={{ color: '#6B6259' }}>
          Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.
        </p>
      </div>
    )
  }

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF6F0' }}>
        <p className="text-sm" style={{ color: '#6B6259' }}>Loading office…</p>
      </div>
    )
  }

  if (!session) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF6F0' }}>
      <header
        className="flex items-center justify-between px-4 sm:px-8 h-14"
        style={{ backgroundColor: '#4A1019' }}
      >
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <span className="text-white text-sm font-semibold" style={{ fontFamily: "'Lora', serif" }}>
            Parish office
          </span>
          <Link to="/admin" className="text-xs uppercase tracking-widest" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>
            Notices
          </Link>
          <Link to="/admin/content" className="text-xs uppercase tracking-widest text-white/50 hover:text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
            Content
          </Link>
          <Link to="/admin/events" className="text-xs uppercase tracking-widest text-white/50 hover:text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
            Events
          </Link>
          <Link to="/admin/posts" className="text-xs uppercase tracking-widest text-white/50 hover:text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
            News
          </Link>
          <Link to="/admin/mass" className="text-xs uppercase tracking-widest text-white/50 hover:text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
            Mass
          </Link>
          <Link to="/" className="text-xs uppercase tracking-widest text-white/50 hover:text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
            View site
          </Link>
        </div>
        <button
          type="button"
          onClick={() => { void signOut() }}
          className="text-xs uppercase tracking-widest px-3 py-2"
          style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}
        >
          Sign out
        </button>
      </header>
      <Outlet />
    </div>
  )
}
