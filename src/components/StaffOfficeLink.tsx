import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getSupabase } from '../lib/supabase'

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="5" y="11" width="14" height="10" rx="1.5" />
      <path d="M8 11V8a4 4 0 118 0v3" />
    </svg>
  )
}

type Variant = 'nav' | 'drawer' | 'footer'

export default function StaffOfficeLink({
  variant = 'footer',
  lang = 'en',
}: {
  variant?: Variant
  lang?: 'en' | 'sw'
}) {
  const [to, setTo] = useState('/admin/login')
  const signedIn = to === '/admin'
  const label = signedIn
    ? lang === 'sw' ? 'Ofisi ya parokia' : 'Parish office'
    : lang === 'sw' ? 'Ingia ofisini' : 'Staff'

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => {
      setTo(data.session ? '/admin' : '/admin/login')
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setTo(session ? '/admin' : '/admin/login')
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (variant === 'nav') {
    return (
      <Link
        to={to}
        className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] tracking-[0.14em] uppercase transition-all duration-200 hover:bg-white/5 rounded-full"
        style={{ border: '1px solid rgba(200,146,42,0.28)', color: 'rgba(240,232,216,0.75)', fontFamily: "'DM Mono', monospace" }}
        title={lang === 'sw' ? 'Ofisi ya parokia' : 'Parish office'}
      >
        <LockIcon />
        {label}
      </Link>
    )
  }

  if (variant === 'drawer') {
    return (
      <Link
        to={to}
        className="col-span-2 mt-1 py-3 text-center text-[10px] tracking-[0.18em] uppercase min-h-[44px] flex items-center justify-center gap-2"
        style={{ color: 'rgba(240,232,216,0.7)', fontFamily: "'DM Mono', monospace", border: '1px solid rgba(200,146,42,0.2)' }}
      >
        <LockIcon />
        {label}
      </Link>
    )
  }

  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
      style={{ color: '#3A3530' }}
      title={lang === 'sw' ? 'Ofisi ya parokia — kwa wafanyakazi' : 'Parish office — staff only'}
    >
      <LockIcon />
      {label}
    </Link>
  )
}
