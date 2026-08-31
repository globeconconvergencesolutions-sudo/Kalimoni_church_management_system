import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { getSupabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/env'

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
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#FAF6F0' }}>
        <p className="text-sm" style={{ color: '#6B6259' }}>Supabase is not configured.</p>
      </div>
    )
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF6F0' }}>
        <p className="text-sm" style={{ color: '#6B6259' }}>Loading…</p>
      </div>
    )
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (authError) {
      setError(authError.message)
      return
    }
    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAF6F0' }}>
      <form
        onSubmit={e => { void onSubmit(e) }}
        className="w-full max-w-md p-8"
        style={{ backgroundColor: '#fff', borderTop: '4px solid #6B1A2A' }}
      >
        <div className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
          St. Theresa Parish
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
          Parish office
        </h1>
        <p className="text-sm mb-6" style={{ color: '#6B6259' }}>
          Sign in with the staff account created in Supabase Authentication.
        </p>
        <label className="block text-xs mb-1" style={{ color: '#6B6259' }}>Email</label>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-3 mb-4 text-sm min-h-[44px]"
          style={{ border: '1px solid #D0C4B0', backgroundColor: '#FAF6F0', outline: 'none' }}
        />
        <label className="block text-xs mb-1" style={{ color: '#6B6259' }}>Password</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-3 mb-5 text-sm min-h-[44px]"
          style={{ border: '1px solid #D0C4B0', backgroundColor: '#FAF6F0', outline: 'none' }}
        />
        {error ? (
          <p className="text-sm mb-4" style={{ color: '#6B1A2A' }}>{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 text-sm font-semibold min-h-[44px]"
          style={{ backgroundColor: '#6B1A2A', color: '#FAF6F0', fontFamily: "'Lora', serif" }}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
