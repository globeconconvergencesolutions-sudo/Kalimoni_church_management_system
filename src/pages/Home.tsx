import { useState, useEffect, useRef, type TouchEvent as RTouchEvent, type FormEvent } from 'react'
import { Link } from 'react-router'
import { POSTS } from '../data/blog'
import { useSEO } from '../hooks/useSEO'
import officialLogo from '../imports/St._Theresa_Catholic_Church__Kalimoni_-_Logo.png'

const BLOG_PREVIEW = POSTS.slice(0, 3)

const HERO_STATS = [
  { value: '1927', label: 'Year Established' },
  { value: '72', label: 'Jumuiyas' },
  { value: '3+', label: 'Daughter Parishes' },
  { value: '99+', label: 'Years of Faith' },
]

const QUICK_LINKS = [
  { to: '/about', title: 'About Us', desc: 'Our vision, mission, and identity as a Catholic community in Juja.', icon: '✦', bg: '#6B1A2A' },
  { to: '/ministries', title: 'Ministries', desc: 'CWA, CMA, YCA, YSC, PMC — find your place in the parish family.', icon: '◈', bg: '#4A3A10' },
  { to: '/events', title: 'Events', desc: 'Upcoming feast days, holy days, and parish celebrations.', icon: '⊞', bg: '#1A3A4A' },
  { to: '/donate', title: 'Support Us', desc: 'Partner with our mission — every gift transforms a life in Kalimoni.', icon: '♡', bg: '#2A1A4A' },
]

const NEWS = [
  {
    date: 'Good Friday 2025',
    category: 'Youth',
    headline: 'YSC & YCA erect beautiful crucifix at Way of the Cross',
    excerpt: 'The Parish Way of the Cross concluded at the foot of a magnificent crucifix, highlighting the active role of youth in parish life.',
    img: 'photo-1476873282730-9018f17bdf4e',
  },
  {
    date: 'February 2025',
    category: 'Celebration',
    headline: 'Divine Mercy Chapel consecrated by the CWA',
    excerpt: 'A new spiritual landmark was added to the parish grounds through the extraordinary efforts of the Catholic Women Association.',
    img: 'photo-1625702929485-984787146d49',
  },
  {
    date: 'December 2024',
    category: 'Marian Devotion',
    headline: 'New Grotto consecrated as centre for personal prayer',
    excerpt: 'The Catholic Men Association completed the Grotto project, which has quickly become a beloved space for Marian devotion.',
    img: 'photo-1633368516160-feaa83f981dd',
  },
]

const PHOTO_SLIDES = [
  { img: 'photo-1622598453695-4fbaf151aadc', caption: 'Parish Community at Sunday Eucharist', sub: 'Joyful worship at the heart of Kalimoni' },
  { img: 'photo-1720186576697-24c1496a07e1', caption: 'A Faith Community United in Prayer', sub: 'Every Sunday, hundreds gather in praise' },
  { img: 'photo-1563902341721-029085ad9347', caption: 'Serving God, Serving Humanity', sub: 'The Vincentian spirit lived out daily' },
  { img: 'photo-1759178124741-8d3a8aaab778', caption: 'St. Theresa Parish, Kalimoni', sub: 'A sacred home since 1912' },
  { img: 'photo-1494548162494-384bba4ab999', caption: 'Light at the End of Every Day', sub: 'Hope, faith, and community guide our way' },
]

const MINISTRIES = [
  { to: '/ministries', label: 'Catholic Women Association', desc: 'CWA — women of faith shaping parish life through service, devotion, and community care.', img: 'photo-1609234656388-0ff363383899', accent: '#C8922A', tag: 'CWA' },
  { to: '/ministries', label: 'Catholic Men Association', desc: 'CMA — men united in prayer, charity, and building up the physical and spiritual parish.', img: 'photo-1622598453695-4fbaf151aadc', accent: '#6B1A2A', tag: 'CMA' },
  { to: '/ministries', label: 'Young Catholic Adults', desc: 'YCA — faith-filled young adults growing in discipleship, fellowship, and apostolic service.', img: 'photo-1781263378223-1e09658a7567', accent: '#4A3A10', tag: 'YCA' },
  { to: '/ministries', label: 'Youths Serving Christ', desc: 'YSC — the vibrant youth ministry of St. Theresa, alive in worship, outreach, and joy.', img: 'photo-1547496613-4e19af6736dc', accent: '#1A3A4A', tag: 'YSC' },
]

const TESTIMONIALS = [
  { quote: "St. Theresa Parish has been the anchor of our family for over twenty years. The Vincentian Fathers do not merely preach — they live the Gospel with us, side by side.", name: 'Wambui N.', role: 'Parish Council Member, Kalimoni', initial: 'W' },
  { quote: "Even from thousands of miles away in the UK, I keep faith with my home parish. Knowing the Sisters are caring for the sick and the school is nurturing our children gives me deep peace.", name: 'Joseph M.', role: 'Kenyan Diaspora, United Kingdom', initial: 'J' },
  { quote: "The 72 Jumuiyas are the heartbeat of this parish. Our small community prays together, supports each other in need, and walks together with Christ.", name: 'Mercy A.', role: 'Jumuiya Leader, Ruiru Deanery', initial: 'M' },
  { quote: "The Grotto built by our men's association has become the most visited corner of the parish grounds. It reminds us that prayer is the foundation of every good work.", name: 'Peter K.', role: 'Catholic Men Association, Kalimoni', initial: 'P' },
]

const EVENTS = [
  { date: 'Oct 1, 2025', title: 'Parish Feast Day', desc: "Solemnity of St. Theresa of Lisieux — the parish's patronal feast. Mass & celebration.", color: '#6B1A2A', icon: '✦' },
  { date: 'Oct 7, 2025', title: 'Our Lady of the Rosary', desc: 'Special Rosary procession and Mass in honour of Our Lady. All parishioners invited.', color: '#4A3A10', icon: '◎' },
  { date: 'Nov 2, 2025', title: 'All Souls Day', desc: 'Mass for the faithful departed. Jumuiyas invited to join the special commemorative liturgy.', color: '#2A1A4A', icon: '✝' },
  { date: 'Nov 21, 2025', title: 'Christ the King', desc: 'Solemnity of Our Lord Jesus Christ, King of the Universe. Parish celebrations and procession.', color: '#1A3A4A', icon: '❧' },
  { date: 'Dec 8, 2025', title: 'Immaculate Conception', desc: 'Holy Day of Obligation. Masses at 7:00 AM, 9:00 AM and 11:00 AM. Grotto devotions at noon.', color: '#3A1A2A', icon: '♦' },
  { date: 'Dec 25, 2025', title: 'Christmas Day', desc: 'Midnight Mass, 7:00 AM and 9:00 AM. Celebrate the birth of our Lord with the whole community.', color: '#4A1019', icon: '★' },
]

const AFFILIATIONS = [
  { title: 'Catholic Archdiocese of Nairobi', sub: 'Under His Grace, the Archbishop of Nairobi', icon: '✝' },
  { title: 'Ruiru Deanery', sub: 'Serving the broader Ruiru community', icon: '◈' },
  { title: 'Vincentian Congregation', sub: 'Pontifical Right · Founded 1904 · India', icon: '✦' },
  { title: 'HHCJ Sisters', sub: 'Handmaids of the Holy Child Jesus', icon: '♡' },
  { title: 'Level 4 Mission Hospital', sub: 'Kalimoni — serving thousands annually', icon: '⊕' },
  { title: 'Est. 1927', sub: 'Nearly 100 years of faithful service', icon: '◆' },
]

// Kenya = UTC+3. Compute next mass from current time.
function computeNextMass(): { displayDay: string; time: string; isImminent: boolean } {
  const now = new Date()
  const kenyaDate = new Date(now.getTime() + 3 * 60 * 60 * 1000)
  const dow = kenyaDate.getUTCDay()
  const currentMin = kenyaDate.getUTCHours() * 60 + kenyaDate.getUTCMinutes()

  // [dayOfWeek, minutesFromMidnight, displayTime]
  const MASSES: [number, number, string][] = [
    [0, 450, '7:30 AM'], [0, 570, '9:30 AM'],  // Sunday
    [1, 1080, '6:00 PM'],                        // Monday evening
    [2, 420, '7:00 AM'],                         // Tuesday morning
    [3, 1080, '6:00 PM'],                        // Wednesday evening
    [4, 420, '7:00 AM'],                         // Thursday morning
    [5, 420, '7:00 AM'],                         // Friday morning
    [6, 420, '7:00 AM'],                         // Saturday morning
  ]

  for (let offset = 0; offset < 8; offset++) {
    const targetDay = (dow + offset) % 7
    for (const [massDay, massMin, time] of MASSES) {
      if (massDay !== targetDay) continue
      if (offset === 0 && massMin <= currentMin) continue
      const diffMin = offset * 24 * 60 + massMin - currentMin
      const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const displayDay = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : DAY_NAMES[targetDay]
      return { displayDay, time, isImminent: diffMin <= 90 }
    }
  }
  return { displayDay: 'Sunday', time: '7:00 AM', isImminent: false }
}

function NextMassStrip() {
  const [massInfo, setMassInfo] = useState(computeNextMass)

  useEffect(() => {
    const id = setInterval(() => setMassInfo(computeNextMass()), 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="px-4 sm:px-6 md:px-10 lg:px-16 py-3 sm:py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4"
      style={{ backgroundColor: '#1C1A18', borderBottom: '1px solid rgba(200,146,42,0.15)' }}
    >
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <span
          className="block w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: massInfo.isImminent ? '#E8B84B' : '#C8922A' }}
        />
        <span className="text-xs tracking-[0.2em] uppercase" style={{ color: '#8A7A70', fontFamily: "'DM Mono', monospace" }}>
          Next Mass
        </span>
        <span className="text-sm font-semibold" style={{ color: '#F0E8D8', fontFamily: "'Lora', serif" }}>
          {massInfo.displayDay} · {massInfo.time}
        </span>
        {massInfo.isImminent && (
          <span className="text-[10px] tracking-widest uppercase px-2 py-0.5" style={{ backgroundColor: '#E8B84B22', color: '#E8B84B', border: '1px solid #E8B84B44', fontFamily: "'DM Mono', monospace" }}>
            Starting soon
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs" style={{ color: '#5A4E48', fontFamily: "'DM Mono', monospace" }}>
        <span className="hidden sm:inline">Sun 7:30·9:30 AM &nbsp;·&nbsp; Mon/Wed 6 PM &nbsp;·&nbsp; Tue/Thu/Fri/Sat 7 AM</span>
        <span className="sm:hidden">Sun 7:30·9:30 AM · Mon/Wed 6 PM · Daily 7 AM</span>
        <Link to="/contact" className="hover:text-white transition-colors underline underline-offset-2 decoration-dotted whitespace-nowrap">
          Mass schedule →
        </Link>
      </div>
    </div>
  )
}

function EventsStrip() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' })
  }

  return (
    <section className="py-10 sm:py-12 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-5 gap-4">
          <div>
            <div className="text-xs tracking-[0.25em] uppercase mb-1.5" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Parish Calendar</div>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>Upcoming Events</h2>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => scroll('left')} className="w-9 h-9 flex items-center justify-center transition-all hover:scale-105" style={{ backgroundColor: '#F0E8D8', color: '#6B1A2A', border: '1px solid #D0C4B0' }} aria-label="Scroll left">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button onClick={() => scroll('right')} className="w-9 h-9 flex items-center justify-center transition-all hover:scale-105" style={{ backgroundColor: '#6B1A2A', color: '#E8B84B' }} aria-label="Scroll right">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' }}
        >
          {EVENTS.map((ev, i) => (
            <div
              key={i}
              className="shrink-0 snap-start p-4 sm:p-5 flex flex-col gap-2 transition-transform hover:-translate-y-0.5 duration-200"
              style={{ width: 'clamp(220px, 36vw, 280px)', backgroundColor: ev.color, minHeight: 150 }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] tracking-widest uppercase" style={{ color: '#E8B84B99', fontFamily: "'DM Mono', monospace" }}>{ev.date}</span>
                <span style={{ color: '#E8B84B', fontSize: '0.8rem' }}>{ev.icon}</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-snug" style={{ fontFamily: "'Lora', serif" }}>{ev.title}</h3>
              <p className="text-xs leading-relaxed flex-1" style={{ color: '#F0E8D8AA' }}>{ev.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PhotoCarousel() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setActive(i => (i + 1) % PHOTO_SLIDES.length), 5500)
    return () => clearInterval(id)
  }, [paused])

  const prev = () => setActive(i => (i - 1 + PHOTO_SLIDES.length) % PHOTO_SLIDES.length)
  const next = () => setActive(i => (i + 1) % PHOTO_SLIDES.length)

  const onTouchStart = (e: RTouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: RTouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -40) next(); else if (dx > 40) prev()
    touchStartX.current = null
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: 'clamp(280px, 52vw, 580px)', backgroundColor: '#1C1A18' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {PHOTO_SLIDES.map((slide, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: active === i ? 1 : 0, pointerEvents: active === i ? 'auto' : 'none' }}>
          <img src={`https://images.unsplash.com/${slide.img}?w=1600&h=700&fit=crop&auto=format`} alt={slide.caption} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,10,15,0.85) 0%, rgba(28,10,15,0.2) 55%, transparent 100%)' }} />
        </div>
      ))}
      <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 md:px-14 pb-8 sm:pb-12">
        <div className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Parish Life</div>
        <h3 className="font-bold text-white mb-1" style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.1rem, 3.5vw, 2rem)' }}>{PHOTO_SLIDES[active].caption}</h3>
        <p className="text-xs sm:text-sm" style={{ color: '#F0E8D8BB' }}>{PHOTO_SLIDES[active].sub}</p>
      </div>
      <button onClick={prev} className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all hover:scale-110 active:scale-95" style={{ backgroundColor: 'rgba(28,26,24,0.65)', color: '#E8B84B', border: '1px solid rgba(200,146,42,0.3)' }} aria-label="Previous slide">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <button onClick={next} className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all hover:scale-110 active:scale-95" style={{ backgroundColor: 'rgba(28,26,24,0.65)', color: '#E8B84B', border: '1px solid rgba(200,146,42,0.3)' }} aria-label="Next slide">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
      </button>
      <div className="absolute bottom-4 right-4 sm:right-8 md:right-14 flex gap-2 items-center">
        {PHOTO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} className="transition-all duration-300" style={{ width: active === i ? 24 : 8, height: 4, backgroundColor: active === i ? '#C8922A' : 'rgba(240,232,216,0.35)', border: 'none' }} aria-label={`Go to slide ${i + 1}`} />
        ))}
      </div>
    </section>
  )
}

function MinistriesSlider() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setActive(i => (i + 1) % MINISTRIES.length), 4500)
    return () => clearInterval(id)
  }, [paused])

  const prev = () => setActive(i => (i - 1 + MINISTRIES.length) % MINISTRIES.length)
  const next = () => setActive(i => (i + 1) % MINISTRIES.length)

  const onTouchStart = (e: RTouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: RTouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -40) next(); else if (dx > 40) prev()
    touchStartX.current = null
  }

  const m = MINISTRIES[active]

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <div className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Our Ministries</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>Faith in Action</h2>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={prev} className="w-10 h-10 flex items-center justify-center transition-all hover:scale-105 active:scale-95" style={{ backgroundColor: '#F0E8D8', color: '#6B1A2A', border: '1px solid #D0C4B0' }} aria-label="Previous ministry">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button onClick={next} className="w-10 h-10 flex items-center justify-center transition-all hover:scale-105 active:scale-95" style={{ backgroundColor: '#6B1A2A', color: '#E8B84B', border: 'none' }} aria-label="Next ministry">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-4" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <Link to={m.to} className="relative overflow-hidden group flex-1" style={{ minHeight: 'clamp(220px, 40vw, 360px)', backgroundColor: '#1C1A18' }}>
            <img src={`https://images.unsplash.com/${m.img}?w=900&h=500&fit=crop&auto=format`} alt={m.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ opacity: 0.55 }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(28,10,15,0.9) 0%, rgba(28,10,15,0.5) 60%, transparent 100%)' }} />
            <div className="relative p-5 sm:p-8 flex flex-col h-full justify-between" style={{ minHeight: 'clamp(220px, 40vw, 360px)' }}>
              <div className="inline-block text-[10px] tracking-[0.25em] uppercase px-2.5 py-1 self-start" style={{ backgroundColor: m.accent + '33', color: m.accent, border: `1px solid ${m.accent}55`, fontFamily: "'DM Mono', monospace" }}>{m.tag}</div>
              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Lora', serif" }}>{m.label}</h3>
                <p className="text-sm leading-relaxed max-w-md mb-5" style={{ color: '#F0E8D8AA' }}>{m.desc}</p>
                <span className="text-xs tracking-widest uppercase flex items-center gap-2 transition-all group-hover:gap-3" style={{ color: m.accent, fontFamily: "'DM Mono', monospace" }}>Learn more →</span>
              </div>
            </div>
          </Link>
          <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0" style={{ flexShrink: 0 }}>
            {MINISTRIES.map((min, i) => (
              <button key={i} onClick={() => setActive(i)} className="relative overflow-hidden group transition-all duration-200 shrink-0" style={{ width: 'clamp(90px, 18vw, 120px)', height: 'clamp(60px, 10vw, 80px)', border: active === i ? `2px solid ${MINISTRIES[i].accent}` : '2px solid transparent', opacity: active === i ? 1 : 0.55 }}>
                <img src={`https://images.unsplash.com/${min.img}?w=240&h=160&fit=crop&auto=format`} alt={min.label} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0" style={{ backgroundColor: 'rgba(28,10,15,0.45)' }} />
                <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 text-[9px] tracking-wide font-medium text-white truncate" style={{ fontFamily: "'DM Mono', monospace", backgroundColor: 'rgba(0,0,0,0.5)' }}>{min.label}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-5 items-center">
          {MINISTRIES.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} className="transition-all duration-300" style={{ width: active === i ? 28 : 8, height: 4, backgroundColor: active === i ? '#C8922A' : '#D0C4B0', border: 'none' }} aria-label={`Go to ministry ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSlider() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setActive(i => (i + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(id)
  }, [paused])

  const prev = () => setActive(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  const next = () => setActive(i => (i + 1) % TESTIMONIALS.length)

  const onTouchStart = (e: RTouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: RTouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -40) next(); else if (dx > 40) prev()
    touchStartX.current = null
  }

  return (
    <section className="py-14 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16 relative overflow-hidden" style={{ backgroundColor: '#4A1019' }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="absolute top-0 right-0 opacity-[0.05]" style={{ fontSize: 'clamp(120px, 25vw, 320px)', color: '#E8B84B', fontFamily: 'Georgia, serif', lineHeight: 1, userSelect: 'none', transform: 'translate(10%, -30%)' }}>"</div>
      <div className="relative max-w-4xl mx-auto">
        <div className="text-xs tracking-[0.25em] uppercase mb-3 text-center" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Voices of the Parish</div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-10 sm:mb-12" style={{ fontFamily: "'Lora', serif" }}>What Our Community Says</h2>
        <div className="relative" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="transition-all duration-700" style={{ opacity: active === i ? 1 : 0, position: active === i ? 'relative' : 'absolute', top: 0, left: 0, right: 0, pointerEvents: active === i ? 'auto' : 'none' }}>
              <blockquote className="text-lg sm:text-xl md:text-2xl italic text-center leading-relaxed mb-8" style={{ fontFamily: "'Lora', serif", color: '#F0E8D8', lineHeight: 1.7 }}>"{t.quote}"</blockquote>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: '#C8922A', color: '#FAF6F0', fontFamily: "'Lora', serif" }}>{t.initial}</div>
                <div className="text-center sm:text-left">
                  <div className="text-sm font-semibold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>{t.name}</div>
                  <div className="text-xs" style={{ color: '#E8B84B99', fontFamily: "'DM Mono', monospace" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-5 mt-10">
          <button onClick={prev} className="w-10 h-10 flex items-center justify-center transition-all hover:scale-110 active:scale-95" style={{ backgroundColor: 'rgba(240,232,216,0.1)', color: '#E8B84B', border: '1px solid rgba(200,146,42,0.3)' }} aria-label="Previous testimonial">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="flex gap-2 items-center">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className="transition-all duration-300" style={{ width: active === i ? 28 : 8, height: 8, backgroundColor: active === i ? '#C8922A' : 'rgba(200,146,42,0.3)', border: 'none', borderRadius: active === i ? 4 : '50%' }} aria-label={`Go to testimonial ${i + 1}`} />
            ))}
          </div>
          <button onClick={next} className="w-10 h-10 flex items-center justify-center transition-all hover:scale-110 active:scale-95" style={{ backgroundColor: 'rgba(240,232,216,0.1)', color: '#E8B84B', border: '1px solid rgba(200,146,42,0.3)' }} aria-label="Next testimonial">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>
    </section>
  )
}

function TrustBand() {
  return (
    <section className="py-10 sm:py-12 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#F0E8D8', borderTop: '1px solid #D0C4B0' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-xs tracking-[0.3em] uppercase text-center mb-6" style={{ color: '#8A7A70', fontFamily: "'DM Mono', monospace" }}>
          Institutional Affiliations & Credentials
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {AFFILIATIONS.map((a, i) => (
            <div
              key={i}
              className="p-3 sm:p-4 text-center flex flex-col items-center gap-2 transition-transform hover:-translate-y-0.5 duration-200"
              style={{ backgroundColor: '#FAF6F0', borderTop: '2px solid #C8922A22' }}
            >
              <span className="text-lg sm:text-xl" style={{ color: '#C8922A' }}>{a.icon}</span>
              <div className="text-[11px] sm:text-xs font-semibold leading-tight" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>{a.title}</div>
              <div className="text-[9px] sm:text-[10px] leading-snug" style={{ color: '#8A7A70', fontFamily: "'DM Mono', monospace" }}>{a.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsletterCTA() {
  const [email, setEmail] = useState('')
  const [type, setType] = useState<'newsletter' | 'prayer'>('newsletter')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#F0E8D8' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:gap-12 lg:gap-16 items-start">
        {/* Donate block */}
        <div className="w-full md:w-1/2 mb-10 md:mb-0">
          <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Support Our Mission</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
            Your Gift Changes Lives<br />in Kalimoni
          </h2>
          <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: '#4A3A30' }}>
            From funding the Kalimoni Mission Hospital to supporting the education of children
            in our schools, every donation — wherever you are in the world — brings light to
            someone in our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/donate" className="text-center py-4 px-8 font-bold text-base tracking-wide transition-all hover:brightness-110 min-h-[52px] flex items-center justify-center" style={{ backgroundColor: '#6B1A2A', color: '#F0E8D8', fontFamily: "'Lora', serif" }}>
              Make a Donation
            </Link>
            <Link to="/contact" className="text-center py-4 px-6 font-medium text-sm tracking-wide border transition-all min-h-[52px] flex items-center justify-center" style={{ border: '1px solid #C8922A', color: '#6B1A2A', fontFamily: "'Inter', sans-serif" }}>
              Get in Touch
            </Link>
          </div>
        </div>

        {/* Newsletter / Prayer block */}
        <div className="w-full md:w-1/2">
          <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Stay Connected</div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
            Join Our Community
          </h3>
          <p className="text-sm leading-relaxed mb-5" style={{ color: '#6B6259' }}>
            Receive parish news and events, or submit a prayer intention — we pray for all requests during daily Mass.
          </p>

          {submitted ? (
            <div className="p-5 sm:p-6 text-center" style={{ backgroundColor: '#FAF6F0', borderTop: '3px solid #C8922A' }}>
              <div className="text-2xl mb-2" style={{ color: '#C8922A' }}>✦</div>
              <p className="text-sm font-semibold" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
                {type === 'newsletter' ? 'You\'re subscribed!' : 'Prayer intention received.'}
              </p>
              <p className="text-xs mt-1" style={{ color: '#6B6259' }}>
                {type === 'newsletter' ? 'Parish news will be delivered to your inbox.' : 'We will remember your intention at Mass.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex gap-2">
                {(['newsletter', 'prayer'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className="flex-1 py-2.5 text-xs tracking-widest uppercase transition-all min-h-[40px]"
                    style={{ fontFamily: "'DM Mono', monospace", backgroundColor: type === t ? '#6B1A2A' : '#FAF6F0', color: type === t ? '#E8B84B' : '#8A7A70', border: type === t ? 'none' : '1px solid #D0C4B0' }}
                  >
                    {t === 'newsletter' ? 'Parish News' : 'Prayer Request'}
                  </button>
                ))}
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={type === 'newsletter' ? 'your@email.com' : 'your@email.com for response'}
                className="w-full px-4 py-3 text-sm min-h-[48px]"
                style={{ backgroundColor: '#FAF6F0', border: '1px solid #D0C4B0', color: '#1C1A18', fontFamily: "'Inter', sans-serif", outline: 'none' }}
              />
              {type === 'prayer' && (
                <textarea
                  rows={3}
                  placeholder="Share your prayer intention..."
                  className="w-full px-4 py-3 text-sm resize-none"
                  style={{ backgroundColor: '#FAF6F0', border: '1px solid #D0C4B0', color: '#1C1A18', fontFamily: "'Inter', sans-serif", outline: 'none' }}
                />
              )}
              <button type="submit" className="py-3.5 font-semibold text-sm tracking-wide transition-all hover:brightness-110 active:scale-95 min-h-[48px]" style={{ backgroundColor: '#C8922A', color: '#FAF6F0', fontFamily: "'Inter', sans-serif" }}>
                {type === 'newsletter' ? 'Subscribe to Parish News' : 'Submit Prayer Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  useSEO({
    title: 'St. Theresa Parish, Kalimoni',
    description: 'Catholic parish serving Kalimoni, Juja, Kiambu County, Kenya since 1912. 72 Jumuiyas, Vincentian Fathers, HHCJ Sisters, Kalimoni Hospital, and Parish School.',
    path: '/',
  })

  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActiveTab(t => (t + 1) % NEWS.length), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      {/* HERO */}
      <div className="pt-14 sm:pt-16 px-3 sm:px-5 lg:px-8" style={{ backgroundColor: '#0C0306' }}>
      <section
        className="hero-section relative overflow-hidden rounded-2xl min-h-[90vh]"
        style={{ background: 'linear-gradient(155deg, #0D0408 0%, #2A0810 38%, #1C0A06 72%, #0E0305 100%)' }}
      >
        {/* Background: candle photo, very subtle texture */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1476873282730-9018f17bdf4e?w=800&h=600&fit=crop&auto=format"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            style={{ opacity: 0.11 }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(13,4,8,0.55) 0%, rgba(13,4,8,0.1) 45%, rgba(13,4,8,0.72) 100%)' }}
          />
        </div>

        {/* Dot grid texture */}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        {/* Gold cross watermark */}
        <div
          className="absolute top-0 right-0 bottom-0 flex items-center pr-4 sm:pr-10 pointer-events-none select-none overflow-hidden"
          style={{ opacity: 0.055 }}
        >
          <span style={{ fontSize: 'clamp(240px, 52vw, 740px)', color: '#C8922A', fontFamily: 'Georgia, serif', lineHeight: 1 }}>✝</span>
        </div>

        {/* CENTER: asymmetric two-column */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-14 px-6 sm:px-10 lg:px-16 pt-20 sm:pt-24 pb-16 sm:pb-20">

          {/* LEFT: giant heading */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-7 sm:mb-9">
              <span
                className="h-px shrink-0 block"
                style={{ width: 26, backgroundColor: '#C8922A' }}
              />
              <span
                className="text-[8px] tracking-[0.35em] uppercase"
                style={{ color: 'rgba(200,146,42,0.62)', fontFamily: "'DM Mono', monospace" }}
              >
                <span className="hidden sm:inline">Ruiru Deanery · </span>Archdiocese of Nairobi
              </span>
            </div>

            <h1
              className="font-bold text-white"
              style={{
                fontFamily: "'Lora', serif",
                fontSize: 'clamp(3.6rem, 10.5vw, 7.8rem)',
                lineHeight: 0.91,
                letterSpacing: '-0.036em',
              }}
            >
              <span className="block">St.</span>
              <span className="block">Theresa</span>
              <em
                className="block not-italic font-normal"
                style={{ color: '#E8B84B', fontSize: '119px', lineHeight: 1.0 }}
              >
                Parish,
              </em>
              <span
                className="block font-light"
                style={{ color: 'rgba(255,255,255,0.26)', fontSize: '0.64em', lineHeight: 1.28 }}
              >
                Kalimoni
              </span>
            </h1>
          </div>

          {/* RIGHT: body + CTAs + stats */}
          <div className="lg:w-[350px] xl:w-[390px] shrink-0">
            <p
              className="text-sm sm:text-base leading-loose mb-7 sm:mb-8"
              style={{ color: 'rgba(240,232,216,0.5)', fontFamily: "'Inter', sans-serif", marginLeft: '-3px' }}
            >
              Over a century of faith, charity, and community in the heart of Juja —
              serving God through service to all of humanity.
            </p>

            <div className="flex flex-wrap gap-2.5 mb-9 sm:mb-11">
              <Link
                to="/about"
                className="px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:scale-95 min-h-[46px] flex items-center"
                style={{ backgroundColor: '#C8922A', color: '#FAF6F0', fontFamily: "'Inter', sans-serif" }}
              >
                Our Story
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5 min-h-[46px] flex items-center"
                style={{ border: '1px solid rgba(200,146,42,0.25)', color: 'rgba(240,232,216,0.7)', fontFamily: "'Inter', sans-serif" }}
              >
                Visit Us
              </Link>
              <Link
                to="/donate"
                className="px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5 min-h-[46px] flex items-center"
                style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,232,216,0.35)', fontFamily: "'Inter', sans-serif" }}
              >
                Donate
              </Link>
            </div>

            <div
              className="grid grid-cols-2 gap-5 sm:gap-6 pt-6 sm:pt-7"
              style={{ borderTop: '1px solid rgba(200,146,42,0.1)' }}
            >
              {HERO_STATS.map(s => (
                <div
                  key={s.label}
                  className="group transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div
                    className="text-2xl sm:text-3xl font-bold text-white mb-1"
                    style={{ fontFamily: "'Lora', serif", letterSpacing: '-0.04em' }}
                  >
                    {s.value}
                  </div>
                  <div
                    className="text-[8px] tracking-[0.22em] uppercase"
                    style={{ color: 'rgba(200,146,42,0.52)', fontFamily: "'DM Mono', monospace" }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM: scroll indicator */}
        <div
          className="absolute bottom-7 left-6 sm:left-10 lg:left-16 z-10 flex items-center gap-2.5"
          style={{ opacity: 0.2 }}
        >
          <div className="w-px h-6" style={{ background: 'linear-gradient(to bottom, #C8922A, transparent)' }} />
          <span
            className="text-[7px] tracking-[0.38em] uppercase text-white"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Scroll
          </span>
        </div>

      </section>
      </div>

      {/* NEXT MASS STRIP */}
      <NextMassStrip />

      {/* PHOTO CAROUSEL */}
      <PhotoCarousel />

      {/* QUICK LINKS GRID */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#1C1A18' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Explore the Parish</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 sm:mb-10" style={{ fontFamily: "'Lora', serif" }}>Welcome to Our Community</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {QUICK_LINKS.map(card => (
              <Link
                key={card.to}
                to={card.to}
                className="group relative overflow-hidden flex flex-col justify-between p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                style={{ backgroundColor: card.bg, minHeight: 196 }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 65%)' }}
                />
                <div className="relative">
                  <div className="text-xl mb-5" style={{ color: 'rgba(232,184,75,0.8)' }}>{card.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Lora', serif" }}>{card.title}</h3>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(240,232,216,0.5)', fontFamily: "'Inter', sans-serif" }}>{card.desc}</p>
                </div>
                <div
                  className="relative flex items-center gap-2 text-[9px] tracking-[0.22em] uppercase mt-5 transition-all duration-300 group-hover:gap-3.5"
                  style={{ color: 'rgba(232,184,75,0.65)', fontFamily: "'DM Mono', monospace" }}
                >
                  <span>Explore</span><span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS STRIP */}
      <EventsStrip />

      {/* MINISTRIES SLIDER */}
      <MinistriesSlider />

      {/* NEWS — Tabbed */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#1C1A18' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Latest from the Parish</div>
          <div className="flex flex-col lg:flex-row lg:gap-12 items-start">
            <div className="w-full lg:w-1/2 mb-6 lg:mb-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 sm:mb-6 text-white" style={{ fontFamily: "'Lora', serif" }}>Recent Highlights</h2>
              <div className="flex gap-2 mb-5 sm:mb-6 flex-wrap">
                {NEWS.map((n, i) => (
                  <button key={i} onClick={() => setActiveTab(i)} className="px-3 py-2 text-xs tracking-wide transition-all duration-200 min-h-[40px]" style={{ fontFamily: "'DM Mono', monospace", backgroundColor: activeTab === i ? '#C8922A' : 'rgba(255,255,255,0.07)', color: activeTab === i ? '#FAF6F0' : '#8A7A70', border: activeTab === i ? 'none' : '1px solid rgba(200,146,42,0.2)' }}>
                    {n.category}
                  </button>
                ))}
              </div>
              <div className="p-5 sm:p-6" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderLeft: '2px solid #C8922A', borderTop: '1px solid rgba(200,146,42,0.1)' }}>
                <div className="text-xs tracking-widest uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>{NEWS[activeTab].date}</div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-white" style={{ fontFamily: "'Lora', serif" }}>{NEWS[activeTab].headline}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#F0E8D8AA' }}>{NEWS[activeTab].excerpt}</p>
              </div>
            </div>
            <div className="w-full lg:w-1/2 relative overflow-hidden" style={{ height: 260, backgroundColor: '#D0C4B0' }}>
              {NEWS.map((n, i) => (
                <img key={i} src={`https://images.unsplash.com/${n.img}?w=700&h=480&fit=crop&auto=format`} alt={n.headline} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700" style={{ opacity: activeTab === i ? 1 : 0 }} />
              ))}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(74,16,25,0.5) 0%, transparent 60%)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Mission banner */}
      <section
        className="py-20 sm:py-24 md:py-28 px-4 sm:px-6 md:px-10 lg:px-16 relative overflow-hidden"
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1609234656388-0ff363383899?w=1600&h=600&fit=crop&auto=format)`, backgroundSize: 'cover', backgroundPosition: 'center 30%' }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(28,8,15,0.82) 0%, rgba(74,16,25,0.88) 100%)' }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-6 sm:mb-8">
            <span className="block h-px w-8 sm:w-12" style={{ backgroundColor: 'rgba(200,146,42,0.5)' }} />
            <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>The Vincentian Spirit</span>
            <span className="block h-px w-8 sm:w-12" style={{ backgroundColor: 'rgba(200,146,42,0.5)' }} />
          </div>
          <blockquote className="text-2xl sm:text-3xl md:text-[2.6rem] italic text-white leading-[1.3] mb-5 sm:mb-6" style={{ fontFamily: "'Lora', serif" }}>
            "Service to God through<br className="hidden sm:block" /> service to humanity."
          </blockquote>
          <p className="text-xs tracking-[0.2em] uppercase mb-8 sm:mb-10" style={{ color: 'rgba(200,146,42,0.7)', fontFamily: "'DM Mono', monospace" }}>
            Guiding St. Theresa Parish, Kalimoni since 2000
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
            <Link
              to="/about"
              className="px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 hover:brightness-110 active:scale-95 min-h-[48px] flex items-center justify-center"
              style={{ backgroundColor: '#C8922A', color: '#FAF6F0', fontFamily: "'Inter', sans-serif" }}
            >
              Discover Our Story
            </Link>
            <Link
              to="/contact"
              className="px-7 py-3.5 text-sm font-medium tracking-wide transition-all duration-200 hover:bg-white/10 min-h-[48px] flex items-center justify-center"
              style={{ border: '1px solid rgba(240,232,216,0.3)', color: '#F0E8D8', fontFamily: "'Inter', sans-serif" }}
            >
              Visit the Parish
            </Link>
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <div className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Parish Blog</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>Stories & Reflections</h2>
            </div>
            <Link to="/blog" className="text-sm font-semibold tracking-wide flex items-center gap-2 transition-opacity hover:opacity-70 whitespace-nowrap" style={{ color: '#C8922A', fontFamily: "'Inter', sans-serif" }}>All Posts →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BLOG_PREVIEW.map(post => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
                style={{ backgroundColor: '#F0E8D8', boxShadow: '0 1px 0 rgba(200,146,42,0.08)' }}
              >
                <div style={{ height: 190, overflow: 'hidden', backgroundColor: '#D0C4B0' }}>
                  <img
                    src={`https://images.unsplash.com/${post.coverImg}?w=500&h=300&fit=crop&auto=format`}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <div className="text-[9px] tracking-[0.25em] uppercase mb-2.5" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>{post.category}</div>
                  <h3 className="text-sm sm:text-base font-bold leading-snug mb-auto" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>{post.title}</h3>
                  <div className="flex items-center justify-between mt-4 pt-3.5" style={{ borderTop: '1px solid rgba(200,146,42,0.12)' }}>
                    <span className="text-[9px] tracking-wide" style={{ color: '#9A8A80', fontFamily: "'DM Mono', monospace" }}>{post.date} · {post.readTime}</span>
                    <span className="text-[9px] tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Read →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SLIDER */}
      <TestimonialsSlider />

      {/* TRUST BAND */}
      <TrustBand />

      {/* NEWSLETTER + DONATE CTA */}
      <NewsletterCTA />
    </div>
  )
}
