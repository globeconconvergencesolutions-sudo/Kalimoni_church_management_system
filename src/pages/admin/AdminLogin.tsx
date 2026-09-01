import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { getSupabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/env'
import officialLogo from '../../imports/St._Theresa_Catholic_Church__Kalimoni_-_Logo.png'
import { office } from '../../components/office/officeTheme'
import ParishLoader from '../../components/office/ParishLoader'

export default function AdminLogin() {
  const navigate = useNavigate()
  const supabase = getSupabase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setChecking(false)
      return
    }
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/admin', { replace: true })
      else setChecking(false)
    })
  }, [supabase, navigate])

  if (!isSupabaseConfigured() || !supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: office.ivory }}>
        <p className="text-sm text-center max-w-sm leading-relaxed" style={{ color: office.mute }}>
          The parish office cannot be reached right now. Please try again later.
        </p>
      </div>
    )
  }

  if (checking) {
    return <ParishLoader caption="Opening the parish house" tone="dark" />
  }

  if (busy) {
    return <ParishLoader caption="Signing you in" tone="dark" />
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setBusy(false)
      setError(
        authError.message.toLowerCase().includes('invalid')
          ? 'That email or password did not match our records.'
          : 'We could not sign you in. Please try again.',
      )
      return
    }
    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ backgroundColor: office.ivory }}>
      <div
        className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden"
        style={{ backgroundColor: office.night }}
      >
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #C8922A 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[280px] leading-none select-none pointer-events-none" style={{ color: 'rgba(200,146,42,0.06)', fontFamily: 'Georgia, serif' }}>
          ✝
        </div>
        <div className="relative">
          <div className="text-[10px] tracking-[0.32em] uppercase mb-8" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
            Ruiru Deanery · Nairobi
          </div>
          <img
            src={officialLogo}
            alt="St. Theresa Catholic Church Kalimoni"
            className="rounded-full object-contain mb-8"
            style={{ width: 88, height: 88, backgroundColor: '#fff', boxShadow: `0 0 0 2px ${office.gold}` }}
          />
          <h1 className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "'Lora', serif" }}>
            Parish<br />office
          </h1>
          <p className="text-sm max-w-sm leading-relaxed" style={{ color: 'rgba(240,232,216,0.62)' }}>
            For clergy, secretaries, and the communications team of St. Theresa Parish, Kalimoni —
            notices, Mass times, the calendar, and the inbox gathered in one quiet house.
          </p>
        </div>
        <p className="relative text-sm italic" style={{ color: office.goldLite, fontFamily: "'Lora', serif" }}>
          “Service to God through service to humanity.”
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-16 sm:px-12">
        <div className="lg:hidden flex flex-col items-center mb-10">
          <img
            src={officialLogo}
            alt="St. Theresa Parish"
            className="rounded-full object-contain mb-4"
            style={{ width: 72, height: 72, backgroundColor: '#fff', boxShadow: `0 0 0 2px ${office.gold}` }}
          />
          <div className="text-[10px] tracking-[0.28em] uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
            St. Theresa · Kalimoni
          </div>
        </div>
        <form onSubmit={e => { void onSubmit(e) }} className="w-full max-w-md mx-auto">
          <div className="text-[10px] tracking-[0.28em] uppercase mb-3" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
            Parish office
          </div>
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
            Peace be with you
          </h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: office.mute }}>
            Sign in with the credentials issued for parish staff.
          </p>
          <label className="block text-[10px] tracking-[0.18em] uppercase mb-1.5" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>Email</label>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 mb-5 text-sm min-h-[48px]"
            style={office.field}
          />
          <label className="block text-[10px] tracking-[0.18em] uppercase mb-1.5" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>Password</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 mb-6 text-sm min-h-[48px]"
            style={office.field}
          />
          {error ? <p className="text-sm mb-4" style={{ color: office.wine }}>{error}</p> : null}
          <button
            type="submit"
            className="w-full py-3.5 text-sm font-semibold min-h-[48px] mb-6"
            style={{ backgroundColor: office.wine, color: office.ivory, fontFamily: "'Lora', serif" }}
          >
            Enter the office
          </button>
          <Link to="/" className="text-xs" style={{ color: office.mute }}>
            ← Back to the parish website
          </Link>
        </form>
      </div>
    </div>
  )
}
