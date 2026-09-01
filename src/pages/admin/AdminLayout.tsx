import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router'
import type { Session } from '@supabase/supabase-js'
import { getSupabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/env'
import officialLogo from '../../imports/St._Theresa_Catholic_Church__Kalimoni_-_Logo.png'
import { office } from '../../components/office/officeTheme'
import ParishLoader from '../../components/office/ParishLoader'
import {
  IconBell,
  IconCalendar,
  IconChalice,
  IconCross,
  IconEnvelope,
  IconHeart,
  IconHome,
  IconImage,
  IconImport,
  IconNews,
} from '../../components/office/officeTheme'

const GROUPS: { label: string; items: { to: string; label: string; icon: ReactNode; end?: boolean }[] }[] = [
  {
    label: 'Today',
    items: [
      { to: '/admin', label: 'Dashboard', icon: <IconHome />, end: true },
      { to: '/admin/inbox', label: 'Inbox', icon: <IconEnvelope /> },
    ],
  },
  {
    label: 'Proclaim',
    items: [
      { to: '/admin/notices', label: 'Notices', icon: <IconBell /> },
      { to: '/admin/posts', label: 'News', icon: <IconNews /> },
    ],
  },
  {
    label: 'Calendar',
    items: [
      { to: '/admin/events', label: 'Events', icon: <IconCalendar /> },
      { to: '/admin/mass', label: 'Mass times', icon: <IconChalice /> },
    ],
  },
  {
    label: 'House',
    items: [
      { to: '/admin/media', label: 'Media', icon: <IconImage /> },
      { to: '/admin/content', label: 'Archive', icon: <IconImport /> },
    ],
  },
  {
    label: 'Gifts',
    items: [
      { to: '/admin/giving', label: 'Giving', icon: <IconHeart /> },
    ],
  },
]

function NavBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {GROUPS.map(group => (
        <div key={group.label} className="mb-6">
          <div
            className="px-5 mb-2 text-[9px] tracking-[0.22em] uppercase"
            style={{ color: 'rgba(232,184,75,0.55)', fontFamily: "'DM Mono', monospace" }}
          >
            {group.label}
          </div>
          <div className="flex flex-col">
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                    isActive ? 'text-white' : 'text-white/55 hover:text-white'
                  }`
                }
                style={({ isActive }) => ({
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: isActive ? 'rgba(200,146,42,0.12)' : 'transparent',
                  borderLeft: isActive ? `3px solid ${office.gold}` : '3px solid transparent',
                })}
              >
                <span className="opacity-80">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

export default function AdminLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const supabase = getSupabase()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

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
    setSigningOut(true)
    await supabase?.auth.signOut()
    navigate('/admin/login')
  }

  if (signingOut) {
    return <ParishLoader caption="Signing you out" tone="light" />
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: office.ivory }}>
        <p className="text-sm text-center max-w-sm leading-relaxed" style={{ color: office.mute }}>
          The parish office cannot be reached right now. Please try again later.
        </p>
      </div>
    )
  }

  if (session === undefined) {
    return <ParishLoader caption="Opening the parish house" tone="light" />
  }

  if (!session) return <Navigate to="/admin/login" replace />

  const email = session.user.email ?? 'Staff'

  const sidebar = (
    <div className="flex flex-col h-full relative overflow-hidden" style={{ backgroundColor: office.night }}>
      <div
        className="absolute -right-6 bottom-24 text-[160px] leading-none select-none pointer-events-none"
        style={{ color: 'rgba(200,146,42,0.05)', fontFamily: 'Georgia, serif' }}
        aria-hidden
      >
        ✝
      </div>
      <div className="relative px-5 pt-7 pb-6" style={{ borderBottom: '1px solid rgba(200,146,42,0.12)' }}>
        <Link to="/admin" className="flex items-center gap-3">
          <img
            src={officialLogo}
            alt=""
            className="rounded-full object-contain shrink-0"
            style={{ width: 44, height: 44, backgroundColor: '#fff', boxShadow: `0 0 0 1.5px ${office.gold}` }}
          />
          <div>
            <div className="text-[9px] tracking-[0.2em] uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
              St. Theresa
            </div>
            <div className="text-white font-semibold text-sm leading-tight" style={{ fontFamily: "'Lora', serif" }}>
              Parish office
            </div>
          </div>
        </Link>
      </div>
      <nav className="relative flex-1 overflow-y-auto py-5">
        <NavBody onNavigate={() => setOpen(false)} />
      </nav>
      <div className="relative px-5 py-5" style={{ borderTop: '1px solid rgba(200,146,42,0.12)' }}>
        <div className="text-[10px] truncate mb-3" style={{ color: 'rgba(240,232,216,0.45)', fontFamily: "'DM Mono', monospace" }}>
          {email}
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 text-xs mb-3"
          style={{ color: office.goldLite, fontFamily: "'Inter', sans-serif" }}
        >
          <IconCross /> View the parish website
        </Link>
        <button
          type="button"
          onClick={() => { void signOut() }}
          className="text-xs uppercase tracking-widest"
          style={{ color: 'rgba(200,146,42,0.8)', fontFamily: "'DM Mono', monospace",cursor: 'pointer'}}
        >
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: office.ivory }}>
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-40" style={{ boxShadow: '8px 0 40px rgba(28,8,14,0.18)' }}>
        {sidebar}
      </aside>

      {open ? (
        <div className="lg:hidden fixed inset-0 z-50">
          <button type="button" className="absolute inset-0" style={{ backgroundColor: 'rgba(12,4,8,0.55)' }} aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw]">{sidebar}</div>
        </div>
      ) : null}

      <div className="lg:pl-64 min-h-screen flex flex-col">
        <header
          className="lg:hidden flex items-center justify-between px-4 h-14 sticky top-0 z-30"
          style={{ backgroundColor: office.burgundy }}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-white p-2 min-w-[44px] min-h-[44px]"
            aria-label="Open office menu"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </button>
          <span className="text-white text-sm font-semibold" style={{ fontFamily: "'Lora', serif" }}>Parish office</span>
          <span className="w-11" />
        </header>
        <main className="flex-1 px-4 sm:px-8 lg:px-12 py-8 lg:py-12">
          <Outlet />
        </main>
        <footer className="px-8 py-4 text-[10px] tracking-[0.14em] uppercase" style={{ color: '#C4B8A8', fontFamily: "'DM Mono', monospace" }}>
          Service to God through service to humanity
        </footer>
      </div>
    </div>
  )
}
