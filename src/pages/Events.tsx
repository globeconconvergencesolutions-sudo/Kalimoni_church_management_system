import { useState } from 'react'
import { Link } from 'react-router'
import { useSEO } from '../hooks/useSEO'
import { usePublishedEvents } from '../hooks/usePublishedEvents'
import { useMassSchedule } from '../hooks/useMassSchedule'

export default function Events() {
  useSEO({
    title: 'Events Calendar',
    description: 'Upcoming events, feast days, and parish activities at St. Theresa Parish, Kalimoni. Mass schedule, holy days of obligation, and ministry gatherings.',
    path: '/events',
  })
  const [activeMonth, setActiveMonth] = useState('All')
  const { events } = usePublishedEvents()
  const { list: massRegular } = useMassSchedule()
  const months = ['All', ...Array.from(new Set(events.map(e => e.month)))]

  const filtered = activeMonth === 'All' ? events : events.filter(e => e.month === activeMonth)

  return (
    <div>
      {/* HERO */}
      <div className="pt-16 sm:pt-20 px-3 sm:px-5 lg:px-8" style={{ backgroundColor: '#FAF6F0' }}>
      <section
        className="hero-section relative rounded-2xl overflow-hidden pt-12 sm:pt-14 pb-14 sm:pb-20 px-6 sm:px-10 lg:px-16"
        style={{ background: 'linear-gradient(135deg, #4A1019 0%, #6B1A2A 60%, #8B3A1A 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #C8922A 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-4xl">
          <div className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Parish Calendar</div>
          <h1
            className="font-bold text-white mb-5"
            style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.15 }}
          >
            Events &<br />
            <em className="not-italic" style={{ color: '#E8B84B' }}>Parish Calendar</em>
          </h1>
          <p className="text-sm sm:text-base max-w-xl leading-relaxed" style={{ color: '#F0E8D8AA' }}>
            Upcoming feast days, holy days, ministry gatherings, and parish celebrations
            at St. Theresa Catholic Church, Kalimoni.
          </p>
        </div>
      </section>
      </div>

      {/* CALENDAR CONTENT */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:gap-12">
          {/* Events list */}
          <div className="w-full lg:w-8/12">
            {/* Month filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap mb-8">
              {months.map(m => (
                <button
                  key={m}
                  onClick={() => setActiveMonth(m)}
                  className="flex-shrink-0 px-3 sm:px-4 py-2 text-xs tracking-wide transition-all duration-200 min-h-[38px]"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    backgroundColor: activeMonth === m ? '#6B1A2A' : '#F0E8D8',
                    color: activeMonth === m ? '#E8B84B' : '#6B6259',
                    border: activeMonth === m ? 'none' : '1px solid #D0C4B0',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Events */}
            <div className="flex flex-col gap-3">
              {filtered.map(ev => (
                <div
                  key={ev.id}
                  className="flex gap-4 sm:gap-5 overflow-hidden transition-transform hover:-translate-y-0.5 duration-200"
                  style={{ backgroundColor: '#F0E8D8' }}
                >
                  {/* Date badge */}
                  <div
                    className="shrink-0 flex flex-col items-center justify-center px-3 sm:px-4 py-4 min-w-[56px] sm:min-w-[64px]"
                    style={{ backgroundColor: ev.color }}
                  >
                    <span className="text-[10px] tracking-widest uppercase" style={{ color: '#E8B84B88', fontFamily: "'DM Mono', monospace" }}>
                      {ev.date.split(' ')[0]}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-white leading-none" style={{ fontFamily: "'Lora', serif" }}>
                      {ev.date.split(' ')[1].replace(',', '')}
                    </span>
                    <span className="text-[10px] tracking-widest" style={{ color: '#E8B84B88', fontFamily: "'DM Mono', monospace" }}>
                      {ev.date.split(' ')[2]}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 py-4 pr-4 sm:pr-5">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className="text-[10px] tracking-widest uppercase px-2 py-0.5"
                        style={{ backgroundColor: ev.color + '22', color: ev.color, fontFamily: "'DM Mono', monospace", border: `1px solid ${ev.color}44` }}
                      >
                        {ev.category}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold mb-1" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>{ev.title}</h3>
                    <div className="flex items-center gap-1.5 mb-2 text-xs" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>
                      {ev.time}
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#6B6259' }}>{ev.desc}</p>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <div className="text-3xl mb-3 opacity-20" style={{ color: '#C8922A' }}>✦</div>
                  <p className="text-sm" style={{ color: '#8A7A70' }}>No events for this month yet. Check back soon.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-4/12 mt-10 lg:mt-0 flex flex-col gap-4">
            {/* Mass schedule */}
            <div className="p-5 sm:p-6" style={{ backgroundColor: '#6B1A2A' }}>
              <div className="text-xs tracking-widest uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Mass Schedule</div>
              {massRegular.map(m => (
                <div key={m.label} className="flex flex-col sm:flex-row sm:justify-between py-2.5 border-b gap-1 text-sm" style={{ borderColor: 'rgba(240,232,216,0.15)' }}>
                  <span style={{ color: '#F0E8D8BB' }}>{m.label}</span>
                  <span style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem' }}>{m.times}</span>
                </div>
              ))}
              <div className="mt-3 text-xs" style={{ color: '#F0E8D8AA', fontFamily: "'DM Mono', monospace" }}>Fr. Joseph Shijo — Parish Priest</div>
            </div>

            {/* Contact info */}
            <div className="p-5 sm:p-6" style={{ backgroundColor: '#F0E8D8' }}>
              <div className="text-xs tracking-widest uppercase mb-4" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Parish Contact</div>
              <div className="flex flex-col gap-3 text-sm" style={{ color: '#4A3A30' }}>
                <a href="tel:+254704358594" className="flex items-center gap-2 hover:underline" style={{ color: '#6B1A2A' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.25 11a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" /></svg>
                  +254 704 358594
                </a>
                <a href="mailto:sttheresakalimoniparish@gmail.com" className="flex items-center gap-2 hover:underline" style={{ color: '#6B1A2A' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  sttheresakalimoniparish@gmail.com
                </a>
                <a href="https://maps.app.goo.gl/YsuSCqxiaqpSj78L8" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline" style={{ color: '#6B1A2A' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" /><circle cx="12" cy="8" r="2.5" /></svg>
                  Get Directions
                </a>
              </div>
            </div>

            {/* Social */}
            <div className="p-5 sm:p-6" style={{ backgroundColor: '#4A3A10' }}>
              <div className="text-xs tracking-widest uppercase mb-3" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Stay Connected</div>
              <p className="text-xs mb-4" style={{ color: '#F0E8D8AA' }}>Follow the parish Facebook page for real-time event updates, live announcements, and community news.</p>
              <a
                href="https://www.facebook.com/profile.php?id=61552240605615"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm font-medium transition-all hover:opacity-80"
                style={{ color: '#E8B84B', fontFamily: "'Inter', sans-serif" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                Follow on Facebook →
              </a>
            </div>

            <Link
              to="/contact"
              className="p-5 sm:p-6 text-center transition-all hover:brightness-110"
              style={{ backgroundColor: '#6B1A2A', color: '#F0E8D8', fontFamily: "'Lora', serif" }}
            >
              <div className="text-xs tracking-widest uppercase mb-2" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Questions?</div>
              <span className="text-sm font-bold">Contact the Parish Office →</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
