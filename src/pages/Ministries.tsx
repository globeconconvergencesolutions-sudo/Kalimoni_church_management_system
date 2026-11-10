import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useSEO } from '../hooks/useSEO'
import { useSiteMedia } from '../hooks/useSiteMedia'
import { parishWhatsAppUrl } from '../data/parishLocation'

function MinistriesCtaActions() {
  const whatsapp = parishWhatsAppUrl('Hello Fr. I would like to join a parish ministry.')
  return (
    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
      <Link
        to="/contact"
        className="px-7 py-3.5 font-bold text-sm tracking-wide transition-all hover:brightness-110 active:scale-95 text-center min-h-[48px] flex items-center justify-center"
        style={{ backgroundColor: '#C8922A', color: '#1C1A18', fontFamily: "'Lora', serif" }}
      >
        Contact the Parish
      </Link>
      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="px-7 py-3.5 text-sm font-medium tracking-wide border transition-all hover:bg-white/10 text-center min-h-[48px] flex items-center justify-center gap-2"
          style={{ border: '1px solid rgba(240,232,216,0.35)', color: '#F0E8D8', fontFamily: "'Inter', sans-serif" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          WhatsApp Us
        </a>
      ) : (
        <Link
          to="/contact"
          className="px-7 py-3.5 text-sm font-medium tracking-wide border transition-all hover:bg-white/10 text-center min-h-[48px] flex items-center justify-center"
          style={{ border: '1px solid rgba(240,232,216,0.35)', color: '#F0E8D8', fontFamily: "'Inter', sans-serif" }}
        >
          Parish Office
        </Link>
      )}
    </div>
  )
}

const MINISTRIES = [
  {
    id: 'cwa',
    short: 'CWA',
    name: 'Catholic Women Association',
    tagline: 'Women of Faith, Service & Devotion',
    color: '#6B1A2A',
    accent: '#E8B84B',
    img: 'photo-1609234656388-0ff363383899',
    desc: 'The Catholic Women Association is the backbone of St. Theresa Kalimoni Parish. These women of deep faith serve God through prayer, charity, and tireless community service — from the chapel to the hospital ward.',
    highlights: [
      'Led the consecration of the Divine Mercy Chapel (2025)',
      'Weekly Rosary groups and Marian devotion',
      'Charity drives for widows, orphans, and the sick',
      'Catering and hospitality for all major parish events',
      'Active in all 40 Jumuiyas across the parish',
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
    desc: "YSC is St. Theresa Kalimoni Parish's vibrant youth ministry — where young people encounter Christ in a community of joy, discipleship, and service. YSC members are the future of the parish and the Church.",
    highlights: [
      'Erected the Way of the Cross crucifix on Good Friday 2025',
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
  {
    id: 'mym',
    short: 'MYM',
    name: 'Missionary Youth Movement',
    tagline: 'Young Missionaries of the Parish',
    color: '#2A3A1A',
    accent: '#E8B84B',
    img: 'photo-1547496613-4e19af6736dc',
    desc: 'The Missionary Youth Movement forms young people as missionaries in their homes, schools, and Jumuiyas — carrying the Gospel with courage and joy across St. Theresa Kalimoni Parish.',
    highlights: [
      'Mission awareness and outreach among youth',
      'Support for parish evangelisation programmes',
      'Partnership with YSC and YCA in community service',
      'Prayer for the missions of the Church',
      'Leadership formation for young missionaries',
    ],
    meetDay: 'As announced by the parish youth office',
  },
  {
    id: 'sacred-heart',
    short: 'SH',
    name: 'Sacred Heart',
    tagline: 'Devotion to the Heart of Jesus',
    color: '#4A1019',
    accent: '#E8B84B',
    img: 'photo-1609234656388-0ff363383899',
    desc: 'The Sacred Heart apostolate nurtures devotion to the Heart of Jesus through prayer, reparation, and works of mercy — a quiet strength in the spiritual life of the parish.',
    highlights: [
      'First Friday devotion and Sacred Heart prayer',
      'Acts of reparation and Eucharistic adoration',
      'Visits and prayer for the sick',
      'Formation in the spirituality of the Sacred Heart',
      'Witness of charity in Jumuiya life',
    ],
    meetDay: 'First Fridays and as scheduled by the group',
  },
]

function MinistryRail({
  active,
  onSelect,
}: {
  active: string
  onSelect: (id: string) => void
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const syncOverflow = () => {
    const el = scrollerRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCanLeft(el.scrollLeft > 4)
    setCanRight(max > 4 && el.scrollLeft < max - 4)
  }

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    syncOverflow()
    const onScroll = () => syncOverflow()
    el.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(() => syncOverflow())
    ro.observe(el)
    window.addEventListener('resize', syncOverflow)
    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
      window.removeEventListener('resize', syncOverflow)
    }
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const btn = el.querySelector<HTMLElement>(`[data-ministry-id="${active}"]`)
    if (!btn) return
    const left = btn.offsetLeft - (el.clientWidth - btn.offsetWidth) / 2
    el.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [active])

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.max(180, el.clientWidth * 0.55), behavior: 'smooth' })
  }

  const needsScroll = canLeft || canRight

  return (
    <div className="mb-8 sm:mb-10">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <div className="text-xs tracking-[0.25em] uppercase mb-1" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
            Choose a ministry
          </div>
          <p className="text-xs sm:text-sm" style={{ color: '#6B6259' }}>
            {MINISTRIES.length} lay groups{needsScroll ? ' · use arrows or swipe' : ' of the parish'}
          </p>
        </div>
        {needsScroll ? (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              aria-label="Scroll ministries left"
              disabled={!canLeft}
              onClick={() => scrollByDir(-1)}
              className="w-10 h-10 flex items-center justify-center transition-all duration-200 disabled:opacity-35 hover:brightness-110"
              style={{
                backgroundColor: canLeft ? '#6B1A2A' : '#EDE4D4',
                color: canLeft ? '#E8B84B' : '#8A7A70',
                border: '1px solid rgba(200,146,42,0.35)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button
              type="button"
              aria-label="Scroll ministries right"
              disabled={!canRight}
              onClick={() => scrollByDir(1)}
              className="w-10 h-10 flex items-center justify-center transition-all duration-200 disabled:opacity-35 hover:brightness-110"
              style={{
                backgroundColor: canRight ? '#6B1A2A' : '#EDE4D4',
                color: canRight ? '#E8B84B' : '#8A7A70',
                border: '1px solid rgba(200,146,42,0.35)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        ) : null}
      </div>

      <div
        className="relative p-2 sm:p-2.5"
        style={{
          backgroundColor: '#F0E8D8',
          border: '1px solid #D0C4B0',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-2 left-2 w-8 sm:w-10 z-10 transition-opacity duration-200"
          style={{
            opacity: canLeft ? 1 : 0,
            background: 'linear-gradient(to right, #F0E8D8 15%, transparent)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-2 right-2 w-8 sm:w-10 z-10 transition-opacity duration-200"
          style={{
            opacity: canRight ? 1 : 0,
            background: 'linear-gradient(to left, #F0E8D8 15%, transparent)',
          }}
        />

        <div
          ref={scrollerRef}
          role="tablist"
          aria-label="Parish ministries"
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {MINISTRIES.map(m => {
            const selected = active === m.id
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={selected}
                data-ministry-id={m.id}
                onClick={() => onSelect(m.id)}
                className="snap-start flex-1 basis-[8.5rem] min-w-[8.5rem] sm:min-w-[9.25rem] text-left px-3.5 py-3.5 transition-all duration-200 min-h-[72px] hover:-translate-y-0.5"
                style={{
                  backgroundColor: selected ? m.color : '#FAF6F0',
                  color: selected ? '#fff' : '#4A3A30',
                  border: selected ? `1px solid ${m.color}` : '1px solid #D8CCB8',
                  boxShadow: selected ? `inset 0 -3px 0 ${m.accent}` : 'none',
                }}
              >
                <div
                  className="text-[11px] tracking-[0.18em] uppercase mb-1.5"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    color: selected ? m.accent : '#C8922A',
                  }}
                >
                  {m.short}
                </div>
                <div
                  className="text-xs leading-snug font-medium line-clamp-2"
                  style={{ fontFamily: "'Lora', serif", color: selected ? '#F0E8D8' : '#4A1019' }}
                >
                  {m.name}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Ministries() {
  useSEO({
    title: 'Parish Ministries',
    description: 'Discover the ministries of St. Theresa Kalimoni Parish — CWA, CMA, YCA, YSC, PMC, MYM, and Sacred Heart. Serving God through service to each other since 1927.',
    path: '/ministries',
  })
  const [active, setActive] = useState('cwa')
  const site = useSiteMedia()
  const location = useLocation()
  const ministry = MINISTRIES.find(m => m.id === active)!
  const detailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const slot = new URLSearchParams(location.search).get('mediaSlot') || ''
    const match = /^ministries\.(.+)$/.exec(slot)
    if (match && MINISTRIES.some(m => m.id === match[1])) setActive(match[1])
  }, [location.search])

  const selectMinistry = (id: string, scrollToDetail = false) => {
    setActive(id)
    if (scrollToDetail) {
      requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
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
          <div className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Parish Ministries</div>
          <h1
            className="font-bold text-white mb-5"
            style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.15 }}
          >
            Serving God Through<br />
            <em className="not-italic" style={{ color: '#E8B84B' }}>Serving Each Other</em>
          </h1>
          <p className="text-sm sm:text-base max-w-xl leading-relaxed" style={{ color: '#F0E8D8AA' }}>
            St. Theresa Kalimoni Parish is alive with lay ministries that bring faith into action —
            from the youngest child to the most experienced elder, there is a place for everyone.
          </p>
        </div>
      </section>
      </div>

      {/* MINISTRY SELECTOR */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-6xl mx-auto">
          <MinistryRail active={active} onSelect={selectMinistry} />

          {/* Active ministry detail */}
          <div ref={detailRef} className="flex flex-col lg:flex-row gap-6 lg:gap-10">
            <div
              id={`media-slot-ministries__${ministry.id}`}
              data-media-slot={`ministries.${ministry.id}`}
              className="w-full lg:w-1/2 overflow-hidden"
              style={{ minHeight: 280 }}
            >
              <img
                key={ministry.id}
                src={site.src(`ministries.${ministry.id}`, ministry.img, 800, 560)}
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
                onClick={() => selectMinistry(m.id, true)}
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
              Contact the parish office or speak to Rev. Fr. Joseph Shijo after any Mass to discover where your gifts are needed.
            </p>
          </div>
          <MinistriesCtaActions />
        </div>
      </section>
    </div>
  )
}
