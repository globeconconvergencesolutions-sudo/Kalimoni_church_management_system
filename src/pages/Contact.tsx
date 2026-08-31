import { useState } from 'react'
import { useSEO } from '../hooks/useSEO'
import { useMassSchedule } from '../hooks/useMassSchedule'

const OFFICE_HOURS = [
  { day: 'Monday – Friday', hours: '8:00 AM – 5:00 PM EAT' },
  { day: 'Saturday', hours: '8:00 AM – 1:00 PM EAT' },
  { day: 'Sunday', hours: 'After Masses' },
]

const inputStyle = {
  backgroundColor: '#F0E8D8',
  border: '1px solid #D0C4B0',
  color: '#1C1A18',
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
} as const

export default function Contact() {
  useSEO({ title: 'Contact Us', description: 'Get in touch with St. Theresa Parish, Kalimoni. We welcome messages from parishioners, Kenyan diaspora, and international partners worldwide.', path: '/contact' })
  const { list: massSchedule } = useMassSchedule()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) return
    setSent(true)
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
          <div className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Get in Touch</div>
          <h1
            className="font-bold text-white mb-5"
            style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.15 }}
          >
            We'd Love to<br />
            <em className="not-italic" style={{ color: '#E8B84B' }}>Hear from You</em>
          </h1>
          <p className="text-sm sm:text-base max-w-xl leading-relaxed" style={{ color: '#F0E8D8AA' }}>
            Whether you are a parishioner, a visitor, a Kenyan abroad, or a partner from
            anywhere in the world — we welcome your message.
          </p>
        </div>
      </section>
      </div>

      {/* CONTACT GRID */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:gap-12">
          {/* Form */}
          <div className="w-full lg:w-7/12 mb-10 lg:mb-0">
            <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Send a Message</div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-7" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
              Contact the Parish
            </h2>

            {sent ? (
              <div className="p-6 sm:p-8 text-center" style={{ backgroundColor: '#F0E8D8' }}>
                <div className="text-4xl mb-4" style={{ color: '#C8922A' }}>✦</div>
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>Message Received!</h3>
                <p className="text-sm mb-5" style={{ color: '#4A3A30' }}>
                  Thank you, <strong>{name}</strong>. We will respond to you at <strong>{email}</strong> as soon as possible.
                </p>
                <button
                  onClick={() => { setSent(false); setName(''); setEmail(''); setMessage(''); setCountry(''); setSubject('') }}
                  className="px-6 py-3 text-sm font-semibold min-h-[48px]"
                  style={{ backgroundColor: '#6B1A2A', color: '#F0E8D8' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Full Name *</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className="w-full px-4 py-3 text-sm min-h-[48px]" style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Email Address *</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-4 py-3 text-sm min-h-[48px]" style={inputStyle} />
                  </div>
                </div>
                {/* Country + Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Country</label>
                    <input type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="Your country" className="w-full px-4 py-3 text-sm min-h-[48px]" style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Subject</label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full px-4 py-3 text-sm min-h-[48px]"
                      style={{ ...inputStyle, color: subject ? '#1C1A18' : '#6B6259' }}
                    >
                      <option value="">Select a subject</option>
                      <option>General Inquiry</option>
                      <option>Donations & Giving</option>
                      <option>Pastoral Support</option>
                      <option>Hospital (HHCJ)</option>
                      <option>School Admissions</option>
                      <option>Prayer Request</option>
                      <option>Media & Partnership</option>
                    </select>
                  </div>
                </div>
                {/* Message */}
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Message *</label>
                  <textarea required rows={5} value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message here..." className="w-full px-4 py-3 text-sm resize-none" style={inputStyle} />
                </div>
                <button type="submit" className="py-4 font-bold tracking-wide transition-all hover:brightness-110 active:scale-95 min-h-[52px]" style={{ backgroundColor: '#6B1A2A', color: '#F0E8D8', fontFamily: "'Lora', serif" }}>
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Info panels */}
          <div className="w-full lg:w-5/12 flex flex-col gap-4">
            <div className="p-5 sm:p-6" style={{ backgroundColor: '#F0E8D8' }}>
              <div className="text-xs tracking-widest uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Parish Location</div>
              <div className="flex flex-col gap-1.5 text-sm" style={{ color: '#4A3A30' }}>
                <div><strong>St. Theresa Catholic Church</strong></div>
                <div>P.O. BOX 141, Kalimoni 01001</div>
                <div>Juja, Kiambu County, Kenya</div>
                <div className="pt-1" style={{ color: '#6B6259' }}>Ruiru Deanery</div>
                <div style={{ color: '#6B6259' }}>Catholic Archdiocese of Nairobi</div>
                <div className="pt-2 flex flex-col gap-1.5">
                  <a href="tel:+254704358594" className="flex items-center gap-2 text-sm font-medium transition-colors hover:underline" style={{ color: '#6B1A2A' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.25 11a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" /></svg>
                    +254 704 358594
                  </a>
                  <a href="mailto:sttheresakalimoniparish@gmail.com" className="flex items-center gap-2 text-sm font-medium transition-colors hover:underline" style={{ color: '#6B1A2A' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    sttheresakalimoniparish@gmail.com
                  </a>
                  <a href="https://maps.app.goo.gl/YsuSCqxiaqpSj78L8" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium transition-colors hover:underline" style={{ color: '#6B1A2A' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" /><circle cx="12" cy="8" r="2.5" /></svg>
                    View on Google Maps
                  </a>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6" style={{ backgroundColor: '#6B1A2A' }}>
              <div className="text-xs tracking-widest uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Mass Schedule</div>
              {massSchedule.map(m => (
                <div key={m.label} className="flex flex-col sm:flex-row sm:justify-between py-2.5 border-b gap-1 text-sm" style={{ borderColor: 'rgba(240,232,216,0.15)' }}>
                  <span style={{ color: '#F0E8D8BB' }}>{m.label}</span>
                  <span style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem' }}>{m.times}</span>
                </div>
              ))}
            </div>

            <div className="p-5 sm:p-6" style={{ backgroundColor: '#4A3A10' }}>
              <div className="text-xs tracking-widest uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Parish Office Hours</div>
              {OFFICE_HOURS.map(o => (
                <div key={o.day} className="flex flex-col sm:flex-row sm:justify-between py-2.5 border-b gap-1 text-sm" style={{ borderColor: 'rgba(240,232,216,0.15)' }}>
                  <span style={{ color: '#F0E8D8BB' }}>{o.day}</span>
                  <span style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem' }}>{o.hours}</span>
                </div>
              ))}
              <div className="mt-3 text-xs" style={{ color: '#F0E8D8AA', fontFamily: "'DM Mono', monospace" }}>EAT = East Africa Time (UTC+3)</div>
            </div>

            <div className="p-4 sm:p-5 text-xs leading-relaxed flex items-start gap-2.5" style={{ backgroundColor: '#F0E8D8', border: '1px solid #C8922A44', color: '#4A3A30' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8922A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>We welcome messages from Kenyan diaspora and international partners.
              Our parish community spans continents through faith and generosity.</span>
            </div>
          </div>
        </div>
      </section>
      {/* GOOGLE MAPS EMBED */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 pb-12 sm:pb-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Find Us</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-5" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>How to Get Here</h2>
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            <div className="w-full md:w-2/3 overflow-hidden" style={{ height: 'clamp(260px, 40vw, 400px)' }}>
              <iframe
                title="St. Theresa Parish Kalimoni Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.6!2d37.01!3d-1.10!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f3fa000000001%3A0x1!2sKalimoni%2C+Juja%2C+Kenya!5e0!3m2!1sen!2ske!4v1"
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="w-full md:w-1/3 flex flex-col gap-3">
              <div className="p-4 sm:p-5 text-sm flex-1" style={{ backgroundColor: '#F0E8D8' }}>
                <div className="text-xs tracking-widest uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Getting There</div>
                <div className="flex flex-col gap-2.5" style={{ color: '#4A3A30' }}>
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 text-xs" style={{ color: '#C8922A' }}>✦</span>
                    <span>From Thika Road: take the Juja exit, proceed towards Kalimoni market. The church is clearly visible from the main road.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 text-xs" style={{ color: '#C8922A' }}>✦</span>
                    <span>Matatu routes from Nairobi: 145 (Thika Road) then connect to Juja/Kalimoni.</span>
                  </div>
                </div>
              </div>
              <a
                href="https://maps.app.goo.gl/YsuSCqxiaqpSj78L8"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 text-sm font-bold tracking-wide transition-all hover:brightness-110 min-h-[48px]"
                style={{ backgroundColor: '#6B1A2A', color: '#F0E8D8', fontFamily: "'Lora', serif" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" /><circle cx="12" cy="8" r="2.5" /></svg>
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
