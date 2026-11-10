import { useState } from 'react'
import { JUMUIYA_COUNT } from '../data/jumuiyas'
import { useSEO } from '../hooks/useSEO'
import { submitInbox } from '../lib/inbox'
import { confirmDemoStk, estimateKes, sendDemoStk } from '../lib/mpesa'

const PAYMENT_METHODS = [
  {
    id: 'mpesa',
    label: 'M-Pesa',
    tag: 'Tithe · Donation · Offertory',
    bg: '#009A3D',
    labelColor: '#A8FFCC',
    icon: (
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="4" fill="#009A3D" />
        <text x="20" y="26" textAnchor="middle" fontSize="13" fontWeight="800" fill="white" fontFamily="Arial,sans-serif">M</text>
      </svg>
    ),
    fields: [
      { label: 'Paybill Number', value: '8622862', note: '(Lipa na M-Pesa)' },
      { label: 'Account', value: 'Tithe / Donation / Offertory', note: '+ your name' },
    ],
    steps: [
      'Go to M-Pesa on your phone',
      'Select Lipa na M-Pesa → Paybill',
      'Enter Business No: 8622862',
      'Enter Account: Tithe, Donation, or Offertory, then your name',
      'Enter amount and your M-Pesa PIN',
    ],
  },
  {
    id: 'family-bank',
    label: 'Family Bank',
    tag: 'Tithes · Donations · Offerings',
    bg: '#1A3A4A',
    labelColor: '#A8D4E8',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </svg>
    ),
    fields: [
      { label: 'Bank Name', value: 'Family Bank', note: '' },
      { label: 'Branch', value: 'Thika', note: '' },
      { label: 'Account Name', value: "St. Theresa's Kalimoni Parish", note: '' },
      { label: 'Account Number', value: '005000026146', note: '' },
    ],
    steps: [
      'Use your Family Bank app, agency, or any Family Bank branch',
      'Deposit or transfer to account 005000026146',
      'Use the account name: St. Theresa\'s Kalimoni Parish',
      'Keep your receipt and email it to sttheresakalimoniparish@gmail.com if helpful',
    ],
  },
  {
    id: 'kcb',
    label: 'KCB Bank',
    tag: 'Centenary Church Project',
    bg: '#6B1A2A',
    labelColor: '#E8B84B',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
        <path d="M3 21h18" />
        <path d="M5 21V10l7-5 7 5v11" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
    fields: [
      { label: 'Bank Name', value: 'KCB Bank', note: '' },
      { label: 'Branch', value: 'Juja', note: '' },
      { label: 'Account Name', value: 'St. Theresa Kalimoni Catholic Parish', note: '' },
      { label: 'Account Number', value: '1202431526', note: '' },
    ],
    steps: [
      'Use your KCB app, agent, or any KCB branch',
      'Transfer to account 1202431526 (Juja branch)',
      'This account supports the Centenary Church Project',
      'Email your receipt to sttheresakalimoniparish@gmail.com if you wish',
    ],
  },
  {
    id: 'centenary-mpesa',
    label: 'Centenary Paybill',
    tag: 'Church Building · Jumuiya',
    bg: '#C8922A',
    labelColor: '#1C1A18',
    icon: (
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="4" fill="#C8922A" />
        <text x="20" y="26" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1C1A18" fontFamily="Arial,sans-serif">✝</text>
      </svg>
    ),
    fields: [
      { label: 'Paybill Number', value: '522533', note: '(Centenary project)' },
      { label: 'Account', value: '8055823#Jumuiya', note: 'replace Jumuiya with yours' },
    ],
    steps: [
      'Go to M-Pesa → Lipa na M-Pesa → Paybill',
      'Enter Business No: 522533',
      'Enter Account: 8055823# followed by your Jumuiya name',
      'Enter amount and your M-Pesa PIN',
      'Together let us build a legacy of faith for generations to come',
    ],
  },
]

function PaymentMethods() {
  const [active, setActive] = useState('mpesa')
  const method = PAYMENT_METHODS.find(m => m.id === active)!

  return (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,146,42,0.2)' }}>
      <div className="p-4 sm:p-5 border-b" style={{ borderColor: 'rgba(200,146,42,0.15)' }}>
        <div className="text-xs tracking-widest uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Payment Methods</div>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-150"
              style={{
                backgroundColor: active === m.id ? m.bg : 'rgba(255,255,255,0.06)',
                color: active === m.id ? '#fff' : '#F0E8D8AA',
                border: active === m.id ? 'none' : '1px solid rgba(200,146,42,0.2)',
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active method detail */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ backgroundColor: method.bg, borderRadius: 4 }}>
            {method.icon}
          </div>
          <div>
            <div className="text-sm font-bold text-white" style={{ fontFamily: "'Lora', serif" }}>{method.label}</div>
            <div className="text-[10px] tracking-widest uppercase" style={{ color: '#8A7A70', fontFamily: "'DM Mono', monospace" }}>{method.tag}</div>
          </div>
        </div>

        {/* Fields */}
        <div className="text-[10px] uppercase tracking-widest mb-3 px-0" style={{ color: '#A8FFCC', fontFamily: "'DM Mono', monospace" }}>
          {method.id === 'mpesa' || method.id === 'centenary-mpesa' ? 'Lipa na M-Pesa · Paybill' : 'Account details'}
        </div>
        <div className="flex flex-col gap-2 mb-4">
          {method.fields.map(f => (
            <div key={f.label} className="flex flex-col gap-0.5">
              <span className="text-[10px] tracking-widest uppercase" style={{ color: '#6B6259', fontFamily: "'DM Mono', monospace" }}>{f.label}</span>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-sm font-bold" style={{ color: '#F0E8D8', fontFamily: "'DM Mono', monospace" }}>{f.value}</span>
                {f.note && <span className="text-[10px]" style={{ color: '#5A4E48', fontFamily: "'DM Mono', monospace" }}>{f.note}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="border-t pt-3" style={{ borderColor: 'rgba(200,146,42,0.12)' }}>
          <div className="text-[10px] tracking-widest uppercase mb-2" style={{ color: '#6B6259', fontFamily: "'DM Mono', monospace" }}>How to Pay</div>
          {method.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2.5 py-1 text-xs" style={{ color: '#F0E8D8AA' }}>
              <span className="shrink-0 w-4 h-4 flex items-center justify-center text-[10px] rounded-full mt-0.5" style={{ backgroundColor: method.bg, color: '#fff', fontFamily: "'DM Mono', monospace" }}>
                {i + 1}
              </span>
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const CAUSES = [
  {
    id: 'centenary',
    icon: '✝',
    title: 'Centenary Church Project',
    desc: 'Help build a lasting house of worship — a legacy of faith for generations to come.',
    channel: 'KCB Juja 1202431526 · Paybill 522533',
    color: '#6B1A2A',
  },
  {
    id: 'offertory',
    icon: '♡',
    title: 'Tithe · Donation · Offertory',
    desc: 'Support the day-to-day mission of the parish through giving and offertory.',
    channel: 'Paybill 8622862 · Family Bank Thika',
    color: '#1A3A4A',
  },
  {
    id: 'hospital',
    icon: '◈',
    title: 'Kalimoni Mission Hospital',
    desc: 'Support essential medical care for patients served by the Level 4 hospital run by the HHCJ Sisters.',
    channel: 'Use offertory Paybill or Family Bank',
    color: '#4A3A10',
  },
  {
    id: 'education',
    icon: '♦',
    title: 'Education & School',
    desc: 'Fund scholarships, school supplies, and infrastructure at Kalimoni Comprehensive School.',
    channel: 'Use offertory Paybill or Family Bank',
    color: '#2A1A4A',
  },
]

const AMOUNTS = [25, 50, 100, 250, 500]
const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'KES', symbol: 'KSh', label: 'Kenyan Shilling' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
]

export default function Donation() {
  useSEO({
    title: 'Donate',
    description:
      'Support St. Theresa Kalimoni Parish through official M-Pesa Paybill, Family Bank, and KCB channels — tithe, offertory, hospital, school, and the Centenary Church Project.',
    path: '/donate',
  })
  const [selectedCause, setSelectedCause] = useState('centenary')
  const [amount, setAmount] = useState(1000)
  const [customAmount, setCustomAmount] = useState('')
  const [currency, setCurrency] = useState('KES')
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [stkRef, setStkRef] = useState<string | null>(null)
  const [stkPaid, setStkPaid] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [website, setWebsite] = useState('')

  const curr = CURRENCIES.find(c => c.code === currency)!
  const finalAmount = customAmount ? Number(customAmount) : amount
  const kesAmount = estimateKes(finalAmount || 0, currency)
  const amounts = currency === 'KES' ? [500, 1000, 2500, 5000, 10000] : AMOUNTS

  const handleStk = async () => {
    if (!name || !email || !finalAmount || !phone) {
      setError('Name, email, amount, and a Kenyan mobile number are required for M-Pesa giving.')
      return
    }
    setBusy(true)
    setError(null)
    const cause = CAUSES.find(c => c.id === selectedCause)?.title ?? selectedCause
    const result = await sendDemoStk({
      name,
      email,
      phone,
      amount: finalAmount,
      currency,
      cause,
      frequency,
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setStkRef(result.checkoutRef || null)
  }

  const handleConfirmStk = async (paid: boolean) => {
    if (!stkRef) return
    setBusy(true)
    const result = await confirmDemoStk(stkRef, paid)
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setStkPaid(paid)
    setSubmitted(true)
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !finalAmount) return
    setBusy(true)
    setError(null)
    const cause = CAUSES.find(c => c.id === selectedCause)?.title ?? selectedCause
    const result = await submitInbox({
      kind: 'giving',
      name,
      email,
      subject: `${frequency === 'monthly' ? 'Monthly' : 'One-time'} giving note — ${cause}`,
      body: `Intended gift: ${curr.symbol}${finalAmount} ${currency}\nCause: ${cause}\nFrequency: ${frequency}\nPhone: ${phone || '—'}\n\nThis is a giving note from the website, not a completed payment.`,
      website,
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6" style={{ backgroundColor: '#FAF6F0', paddingTop: 80 }}>
        <div className="max-w-md w-full text-center">
          <div className="text-5xl sm:text-6xl mb-6" style={{ color: '#C8922A' }}>✦</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
            Thank You, {name}!
          </h2>
          <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: '#4A3A30' }}>
            {stkRef ? (
              stkPaid
                ? <>Thank you. Your gift of <strong>KSh {kesAmount.toLocaleString()}</strong> toward <strong>{CAUSES.find(c => c.id === selectedCause)?.title}</strong> has been recorded. Reference <strong>{stkRef}</strong>. May God bless your generosity.</>
                : <>The M-Pesa request was not completed. You can still give using the Paybill or bank details on this page.</>
            ) : (
              <>Thank you, <strong>{name}</strong>. We have received your giving note for
              <strong> {CAUSES.find(c => c.id === selectedCause)?.title}</strong> ({curr.symbol}{finalAmount} {currency}).
              Please complete your gift using M-Pesa or the bank details on this page.</>
            )}
          </p>
          <p className="text-sm mb-8" style={{ color: '#6B6259' }}>
            "Service to God through service to humanity." — Your gift embodies this spirit.
          </p>
          <button
            className="px-7 py-3 font-semibold text-sm transition-all hover:brightness-110 min-h-[48px]"
            style={{ backgroundColor: '#6B1A2A', color: '#F0E8D8' }}
            onClick={() => { setSubmitted(false); setName(''); setEmail('') }}
          >
            Make Another Donation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* HERO */}
      <div className="pt-16 sm:pt-20 px-3 sm:px-5 lg:px-8" style={{ backgroundColor: '#FAF6F0' }}>
      <section
        className="hero-section relative rounded-2xl overflow-hidden pt-12 sm:pt-14 pb-14 sm:pb-20 px-6 sm:px-10 lg:px-16"
        style={{ background: 'linear-gradient(135deg, #4A1019 0%, #6B1A2A 60%, #8B3A1A 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-4xl">
          <div className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Support the Mission</div>
          <h1
            className="font-bold text-white mb-5"
            style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.15 }}
          >
            Your Gift<br />
            <em className="not-italic" style={{ color: '#E8B84B' }}>Changes Lives</em>
          </h1>
          <p className="text-sm sm:text-base md:text-lg max-w-xl leading-relaxed mb-5" style={{ color: '#F0E8D8AA' }}>
            Whether you are in Kenya or across the globe, your donation directly supports
            health, education, charity, and the growth of our faith community in Kalimoni.
          </p>
          <div className="flex flex-wrap gap-2">
            {['M-Pesa Paybill', 'Family Bank', 'KCB Centenary', 'Centenary Paybill'].map(p => (
              <span key={p} className="px-3 py-1 text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#E8B84B', fontFamily: "'DM Mono', monospace", border: '1px solid rgba(232,184,75,0.25)' }}>{p}</span>
            ))}
          </div>
        </div>
      </section>
      </div>

      {/* CAUSES */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Where Your Gift Goes</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-7 sm:mb-8" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>Choose a Cause</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {CAUSES.map(cause => {
              const selected = selectedCause === cause.id
              return (
                <button
                  key={cause.id}
                  onClick={() => setSelectedCause(cause.id)}
                  className="text-left p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 min-h-[160px]"
                  style={{
                    backgroundColor: selected ? cause.color : '#F0E8D8',
                    border: selected ? 'none' : '1px solid #D0C4B0',
                    outline: selected ? `2px solid ${cause.color}` : 'none',
                  }}
                >
                  <div className="flex sm:block gap-4 items-start mb-2 sm:mb-0">
                    <div className="text-xl sm:text-2xl sm:mb-2" style={{ color: selected ? '#E8B84B' : '#C8922A' }}>{cause.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold mb-1 sm:mb-2" style={{ fontFamily: "'Lora', serif", color: selected ? '#fff' : '#4A1019' }}>{cause.title}</div>
                      <div className="text-xs leading-relaxed mb-3" style={{ color: selected ? '#F0E8D8AA' : '#6B6259' }}>{cause.desc}</div>
                    </div>
                  </div>
                  <div className="text-[10px] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace", color: selected ? '#E8B84B' : '#6B6259' }}>
                    {cause.channel}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#1C1A18' }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:gap-12">
          {/* Form */}
          <div className="w-full lg:w-7/12 mb-10 lg:mb-0">
            <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Donation Form</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-7" style={{ fontFamily: "'Lora', serif" }}>
              Give Now — From Anywhere
            </h2>

            <form onSubmit={e => { void handleSubmit(e) }} className="flex flex-col gap-4 sm:gap-5">
              {/* Frequency */}
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Frequency</label>
                <div className="flex gap-2">
                  {(['once', 'monthly'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className="flex-1 py-3 text-sm font-medium transition-all min-h-[48px]"
                      style={{
                        backgroundColor: frequency === f ? '#C8922A' : 'rgba(255,255,255,0.06)',
                        color: frequency === f ? '#FAF6F0' : '#F0E8D8AA',
                        border: frequency === f ? 'none' : '1px solid rgba(200,146,42,0.2)',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {f === 'once' ? 'One-time' : 'Monthly'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Currency</label>
                <select
                  value={currency}
                  onChange={e => {
                    const next = e.target.value
                    setCurrency(next)
                    setCustomAmount('')
                    setAmount(next === 'KES' ? 1000 : 50)
                  }}
                  className="w-full px-4 py-3 text-sm min-h-[48px]"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,146,42,0.25)', color: '#F0E8D8', fontFamily: "'Inter', sans-serif" }}
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code} style={{ backgroundColor: '#1C1A18' }}>
                      {c.symbol} — {c.label} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Amount ({curr.symbol})</label>
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 mb-2">
                  {amounts.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => { setAmount(a); setCustomAmount('') }}
                      className="px-3 sm:px-4 py-2.5 text-sm font-medium transition-all min-h-[44px]"
                      style={{
                        backgroundColor: amount === a && !customAmount ? '#6B1A2A' : 'rgba(255,255,255,0.06)',
                        color: amount === a && !customAmount ? '#E8B84B' : '#F0E8D8AA',
                        border: amount === a && !customAmount ? 'none' : '1px solid rgba(200,146,42,0.2)',
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {curr.symbol}{a}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder={`Custom amount in ${curr.code}`}
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  className="w-full px-4 py-3 text-sm min-h-[48px]"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${customAmount ? '#C8922A' : 'rgba(200,146,42,0.25)'}`,
                    color: '#F0E8D8',
                    fontFamily: "'DM Mono', monospace",
                    outline: 'none',
                  }}
                />
              </div>

              {/* Name & Email side by side on tablet+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 text-sm min-h-[48px]"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,146,42,0.25)', color: '#F0E8D8', fontFamily: "'Inter', sans-serif", outline: 'none' }}
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 text-sm min-h-[48px]"
                      style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,146,42,0.25)', color: '#F0E8D8', fontFamily: "'Inter', sans-serif", outline: 'none' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>M-Pesa phone (Kenya)</label>
                  <input
                    type="tel"
                    placeholder="07xx xxx xxx"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 text-sm min-h-[48px]"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,146,42,0.25)', color: '#F0E8D8', fontFamily: "'Inter', sans-serif", outline: 'none' }}
                  />
                </div>

                {stkRef && !submitted ? (
                  <div className="p-4" style={{ backgroundColor: 'rgba(0,154,61,0.12)', border: '1px solid #009A3D' }}>
                    <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#A8FFCC', fontFamily: "'DM Mono', monospace" }}>M-Pesa on your phone</div>
                    <p className="text-sm mb-3" style={{ color: '#F0E8D8' }}>
                      A giving request for <strong>KSh {kesAmount.toLocaleString()}</strong> has been sent to your number.
                      Complete the M-Pesa prompt when it appears on your phone.
                    </p>
                    <p className="text-[10px] mb-3" style={{ color: '#8A7A70', fontFamily: "'DM Mono', monospace" }}>{stkRef}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={busy} onClick={() => { void handleConfirmStk(true) }} className="px-4 py-3 text-sm font-semibold min-h-[44px]" style={{ backgroundColor: '#009A3D', color: '#fff' }}>
                        I completed payment
                      </button>
                      <button type="button" disabled={busy} onClick={() => { void handleConfirmStk(false) }} className="px-4 py-3 text-sm min-h-[44px]" style={{ border: '1px solid #C8922A', color: '#E8B84B' }}>
                        Cancel request
                      </button>
                    </div>
                  </div>
                ) : null}

                <input tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} className="hidden" aria-hidden="true" />
                {error ? <p className="text-sm" style={{ color: '#E8B84B' }}>{error}</p> : null}
                <p className="text-xs leading-relaxed" style={{ color: '#F0E8D8AA' }}>
                  Official giving is via Lipa na M-Pesa Paybill or bank transfer (details on the right).
                  Optional: send a giving note so the parish office can follow up, or try an M-Pesa phone prompt when available.
                  {currency !== 'KES' ? ` Estimated M-Pesa amount: KSh ${kesAmount.toLocaleString()}.` : ''}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    disabled={busy || Boolean(stkRef)}
                    onClick={() => { void handleStk() }}
                    className="flex-1 py-4 font-bold text-base tracking-wide min-h-[52px]"
                    style={{ backgroundColor: '#009A3D', color: '#fff', fontFamily: "'Lora', serif" }}
                  >
                    {busy && !stkRef ? 'Sending to your phone…' : `M-Pesa prompt · KSh ${kesAmount.toLocaleString()}`}
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 py-4 font-bold text-base tracking-wide min-h-[52px]"
                    style={{ backgroundColor: '#C8922A', color: '#1C1A18', fontFamily: "'Lora', serif" }}
                  >
                    {busy ? 'Sending…' : 'Send a giving note'}
                  </button>
                </div>
            </form>
          </div>

          {/* Right sidebar */}
          <div className="w-full lg:w-5/12 flex flex-col gap-4">
            {(() => {
              const cause = CAUSES.find(c => c.id === selectedCause)!
              return (
                <div className="p-5 sm:p-6" style={{ backgroundColor: cause.color }}>
                  <div className="text-2xl sm:text-3xl mb-3" style={{ color: '#E8B84B' }}>{cause.icon}</div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2" style={{ fontFamily: "'Lora', serif" }}>{cause.title}</h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: '#F0E8D8AA' }}>{cause.desc}</p>
                  <div className="text-[10px] tracking-widest uppercase mb-1" style={{ color: '#E8B84B88', fontFamily: "'DM Mono', monospace" }}>
                    Preferred channel
                  </div>
                  <div className="text-xs font-medium" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>
                    {cause.channel}
                  </div>
                </div>
              )
            })()}

            <div className="p-5 sm:p-6" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,146,42,0.2)' }}>
              <h4 className="text-sm font-bold text-white mb-4" style={{ fontFamily: "'Lora', serif" }}>Why Give to Kalimoni?</h4>
              {[
                'Directly fund a Level 4 hospital serving thousands annually',
                'Support education for children at Kalimoni Comprehensive School',
                'Enable Vincentian works of charity for the poor',
                'Help build and maintain parish structures and outstations',
                `Partner with ${JUMUIYA_COUNT} Jumuiyas living the Gospel together`,
              ].map(reason => (
                <div key={reason} className="flex items-start gap-3 py-2 text-xs border-b" style={{ color: '#F0E8D8AA', borderColor: 'rgba(200,146,42,0.12)' }}>
                  <span style={{ color: '#C8922A', marginTop: 2 }}>✦</span>
                  {reason}
                </div>
              ))}
            </div>

            {/* Payment Methods */}
            <PaymentMethods />
          </div>
        </div>
      </section>
    </div>
  )
}
