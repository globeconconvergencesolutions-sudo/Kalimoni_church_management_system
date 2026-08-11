import { useState } from 'react'
import { Link } from 'react-router'
import { useSEO } from '../hooks/useSEO'

const MINISTRIES = [
  {
    id: 'cwa',
    short: 'CWA',
    name: 'Catholic Women Association',
    tagline: 'Women of Faith, Service & Devotion',
    color: '#6B1A2A',
    accent: '#E8B84B',
    img: 'photo-1609234656388-0ff363383899',
    desc: 'The Catholic Women Association is the backbone of St. Theresa Parish. These women of deep faith serve God through prayer, charity, and tireless community service — from the chapel to the hospital ward.',
    highlights: [
      'Led the consecration of the Divine Mercy Chapel (2025)',
      'Weekly Rosary groups and Marian devotion',
      'Charity drives for widows, orphans, and the sick',
      'Catering and hospitality for all major parish events',
      'Active in all 72 Jumuiyas across the parish',
    ],
    meetDay: 'Every Saturday after 7:00 AM Mass',
  },
  {
    id: 'cma',
    short: 'CMA',
    name: 'Catholic Men Association',
    tagline: 'Men United in Prayer and Service',
    color: '#1A3A4A',
    accent: '#E8B84B',
    img: 'photo-1622598453695-4fbaf151aadc',
    desc: 'The Catholic Men Association unites the men of the parish in spiritual growth, charitable works, and the physical upkeep of the parish. Their dedication is visible in every stone of the parish grounds.',
    highlights: [
      'Built and maintain the beloved Marian Grotto',
      'Parish construction and maintenance projects',
      'Monthly men\'s retreat and faith formation',
      'Support for bereaved families across the parish',
      'Leadership in Jumuiya Small Christian Communities',
    ],
    meetDay: 'First Sunday of every month',
  },
  {
    id: 'yca',
    short: 'YCA',
    name: 'Young Catholic Adults',
    tagline: 'Faith-Filled Youth in Discipleship',
    color: '#4A3A10',
    accent: '#E8B84B',
    img: 'photo-1781263378223-1e09658a7567',
    desc: 'The Young Catholic Adults ministry nurtures the faith of post-secondary young people through fellowship, apostolic service, and ongoing formation in Catholic social teaching and spirituality.',
    highlights: [
      'Annual YCA leadership and faith retreat',
      'Community outreach and social apostolate',
      'Monthly fellowship evenings and faith sharing',
      'Participation in archdiocesan youth events',
      'Mentorship and engagement with secondary students',
    ],
    meetDay: 'Every Sunday after 9:30 AM Mass',
  },
  {
    id: 'ysc',
    short: 'YSC',
    name: 'Youths Serving Christ',
    tagline: 'Alive in Worship, Outreach & Joy',
    color: '#2A1A4A',
    accent: '#E8B84B',
    img: 'photo-1547496613-4e19af6736dc',
    desc: "YSC is St. Theresa's vibrant youth ministry — where young people encounter Christ in a community of joy, discipleship, and service. YSC members are the future of the parish and the Church.",
    highlights: [
      'Erected the Way of the Cross crucifix at Good Friday 2025',
      'Lively choir and liturgical music ministry',
      'School outreach and peer evangelisation',
      'Annual YSC camp and spiritual formation weekend',
      'Drama, arts, and cultural celebrations',
    ],
    meetDay: 'Every Friday evening · 6:00 PM',
  },
  {
    id: 'pmc',
    short: 'PMC',
    name: 'Pontifical Missionary Childhood',
    tagline: 'Children Praying for Children Worldwide',
    color: '#3A1A2A',
    accent: '#E8B84B',
    img: 'photo-1632932693914-89b90ae3d16d',
    desc: 'The Pontifical Missionary Childhood (also known as Holy Childhood) forms the youngest members of the parish in a spirit of prayer and solidarity with children around the world who lack access to faith and education.',
    highlights: [
      'Missionary prayer for children in need worldwide',
      'First Holy Communion preparation and support',
      'Monthly children\'s Mass and catechesis',
      'Charity collections for mission projects',
      'Formation in Catholic Social Teaching from an early age',
    ],
    meetDay: 'Every Sunday after 7:30 AM Mass (children)',
  },
]

export default function Ministries() {
  useSEO({
    title: 'Parish Ministries',
    description: 'Discover the ministries of St. Theresa Parish, Kalimoni — CWA, CMA, YCA, YSC, and PMC. Serving God through service to each other since 1927.',
    path: '/ministries',
  })
  const [active, setActive] = useState('cwa')
  const ministry = MINISTRIES.find(m => m.id === active)!

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
          <div className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Parish Ministries</div>
          <h1
            className="font-bold text-white mb-5"
            style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.15 }}
          >
            Serving God Through<br />
            <em className="not-italic" style={{ color: '#E8B84B' }}>Serving Each Other</em>
          </h1>
          <p className="text-sm sm:text-base max-w-xl leading-relaxed" style={{ color: '#F0E8D8AA' }}>
            St. Theresa Parish, Kalimoni is alive with lay ministries that bring faith into action —
            from the youngest child to the most experienced elder, there is a place for everyone.
          </p>
        </div>
      </section>
      </div>

      {/* MINISTRY SELECTOR */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-6xl mx-auto">
          {/* Tab buttons — horizontal scroll, never wrap */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-8 sm:mb-10" style={{ scrollbarWidth: 'none' }}>
            {MINISTRIES.map(m => (
              <button
                key={m.id}
                onClick={() => setActive(m.id)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs tracking-wide transition-all duration-200 min-h-[44px]"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  backgroundColor: active === m.id ? m.color : '#F0E8D8',
                  color: active === m.id ? '#E8B84B' : '#6B6259',
                  border: active === m.id ? 'none' : '1px solid #D0C4B0',
                }}
              >
                <span className="font-bold">{m.short}</span>
                <span className="hidden sm:inline opacity-70">{m.name}</span>
              </button>
            ))}
          </div>

          {/* Active ministry card */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
            <div className="w-full lg:w-1/2 overflow-hidden" style={{ minHeight: 280 }}>
              <img
                src={`https://images.unsplash.com/${ministry.img}?w=800&h=560&fit=crop&auto=format`}
                alt={ministry.name}
                className="w-full h-full object-cover"
                style={{ height: 'clamp(220px, 40vw, 420px)', backgroundColor: '#D0C4B0' }}
              />
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <div className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>{ministry.short}</div>
              <h2
                className="text-2xl sm:text-3xl font-bold mb-2"
                style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}
              >
                {ministry.name}
              </h2>
              <p className="text-sm sm:text-base italic mb-5" style={{ color: '#8A7A70', fontFamily: "'Lora', serif" }}>{ministry.tagline}</p>
              <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: '#4A3A30' }}>{ministry.desc}</p>
              <div className="flex flex-col gap-2 mb-6">
                {ministry.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm" style={{ color: '#4A3A30' }}>
                    <span className="shrink-0 mt-0.5 text-xs" style={{ color: '#C8922A' }}>✦</span>
                    {h}
                  </div>
                ))}
              </div>
              <div
                className="p-4 text-xs flex items-center gap-3"
                style={{ backgroundColor: '#F0E8D8', borderLeft: `3px solid ${ministry.color}`, fontFamily: "'DM Mono', monospace", color: '#6B6259' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8922A" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>
                <span><strong style={{ color: '#4A3A30' }}>Meets:</strong> {ministry.meetDay}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MINISTRY GRID OVERVIEW */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#F0E8D8' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>All Ministries</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
            Every Member Has a Home
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MINISTRIES.map(m => (
              <button
                key={m.id}
                onClick={() => { setActive(m.id); window.scrollTo({ top: 300, behavior: 'smooth' }) }}
                className="text-left p-5 sm:p-6 transition-all hover:-translate-y-0.5 duration-200"
                style={{ backgroundColor: m.color }}
              >
                <div className="text-xs tracking-widest uppercase mb-2" style={{ color: '#E8B84B99', fontFamily: "'DM Mono', monospace" }}>{m.short}</div>
                <h3 className="text-base font-bold text-white mb-2" style={{ fontFamily: "'Lora', serif" }}>{m.name}</h3>
                <p className="text-xs leading-relaxed mb-3" style={{ color: '#F0E8D8AA' }}>{m.tagline}</p>
                <span className="text-xs" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Learn more →</span>
              </button>
            ))}
            {/* Vincentians & Sisters */}
            <Link to="/vincentians" className="text-left p-5 sm:p-6 transition-all hover:-translate-y-0.5 duration-200" style={{ backgroundColor: '#0F2D3A' }}>
              <div className="text-xs tracking-widest uppercase mb-2" style={{ color: '#E8B84B99', fontFamily: "'DM Mono', monospace" }}>Clergy</div>
              <h3 className="text-base font-bold text-white mb-2" style={{ fontFamily: "'Lora', serif" }}>Vincentian Fathers</h3>
              <p className="text-xs leading-relaxed mb-3" style={{ color: '#F0E8D8AA' }}>Missionary priests serving since 2000</p>
              <span className="text-xs" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Learn more →</span>
            </Link>
            <Link to="/sisters" className="text-left p-5 sm:p-6 transition-all hover:-translate-y-0.5 duration-200" style={{ backgroundColor: '#2A0F1A' }}>
              <div className="text-xs tracking-widest uppercase mb-2" style={{ color: '#E8B84B99', fontFamily: "'DM Mono', monospace" }}>Religious Sisters</div>
              <h3 className="text-base font-bold text-white mb-2" style={{ fontFamily: "'Lora', serif" }}>HHCJ Sisters</h3>
              <p className="text-xs leading-relaxed mb-3" style={{ color: '#F0E8D8AA' }}>Healthcare, education, and pastoral care</p>
              <span className="text-xs" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Learn more →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* JOIN CTA */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#1C1A18' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Get Involved</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Lora', serif" }}>Find Your Ministry</h2>
            <p className="text-sm mt-2 max-w-md" style={{ color: '#F0E8D8AA' }}>
              Contact the parish office or speak to Fr. Joseph Shijo after any Mass to discover where your gifts are needed.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/contact"
              className="px-7 py-3.5 font-bold text-sm tracking-wide transition-all hover:brightness-110 active:scale-95 text-center min-h-[48px] flex items-center justify-center"
              style={{ backgroundColor: '#C8922A', color: '#1C1A18', fontFamily: "'Lora', serif" }}
            >
              Contact the Parish
            </Link>
            <a
              href="https://wa.me/254704358594?text=Hello%20Fr.%20I%20would%20like%20to%20join%20a%20parish%20ministry."
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 text-sm font-medium tracking-wide border transition-all hover:bg-white/10 text-center min-h-[48px] flex items-center justify-center gap-2"
              style={{ border: '1px solid rgba(240,232,216,0.35)', color: '#F0E8D8', fontFamily: "'Inter', sans-serif" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
