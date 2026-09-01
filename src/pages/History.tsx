import { useState } from 'react'
import { useSEO } from '../hooks/useSEO'
import { useSiteMedia } from '../hooks/useSiteMedia'

const ERAS = [
  {
    id: 'founding', period: '1912–1999', label: 'The Founding Era', color: '#4A3A10',
    events: [
      { year: 1912, text: 'Holy Ghost Fathers establish a mission in Kalimoni — approximately 10 years after the first church was founded in Nairobi (St. Austin).' },
      { year: 1927, text: 'Kalimoni is elevated to full parish status, becoming one of the earliest parishes in the region.' },
      { year: '1927–1999', text: 'The parish grows steadily under the Holy Ghost Fathers, giving birth to many parishes that now form the Ruiru and Thika Deaneries.' },
    ],
    context: 'The Holy Ghost Fathers (Spiritans) were among the pioneering Catholic missionaries in East Africa. Their arrival in Kalimoni preceded the widespread expansion of the Church inland, making St. Theresa one of the earliest rural parishes in what is now the Archdiocese of Nairobi.',
  },
  {
    id: 'vincentian', period: '2000–2015', label: 'The Vincentian Era', color: '#6B1A2A',
    events: [
      { year: 1999, text: 'The Vincentian Congregation arrives at St. Theresa Parish, initially serving alongside Fr. Gogan H.G.F. of the Holy Ghost Fathers.' },
      { year: 2000, text: 'When Fr. Gogan fell ill, the Bishop entrusted the parish to the Vincentians. Fr. James Edavazhira VC becomes the pioneering parish priest.' },
      { year: 2000, text: 'HHCJ Sisters arrive — Sr. Evangeline Gitonga and Sr. Theresa Barnie — taking over the dispensary.' },
      { year: 2002, text: 'Parish has 15 Jumuiyas (Small Christian Communities).' },
      { year: 2006, text: 'Sr. Juliana Mose joins and begins growing the dispensary into a full hospital.' },
      { year: 2008, text: 'Jumuiyas grow to 25.' },
    ],
    context: 'The Vincentian Congregation, founded in India in 1904 by Fr. Varkey Kattarath, arrived in Kenya in the late 1990s. Their arrival in Kalimoni marked a new chapter of missionary zeal, characterised by evangelisation, retreats, and deep pastoral engagement.',
  },
  {
    id: 'growth', period: '2016–Present', label: 'The Growth Era', color: '#1A3A4A',
    events: [
      { year: 2016, text: 'Jumuiyas rise to 30 Small Christian Communities.' },
      { year: 2019, text: 'Remarkable growth — 48 Jumuiyas active in the parish.' },
      { year: 2022, text: 'Jumuiyas surge to 72, demonstrating extraordinary grassroots growth in faith.' },
      { year: 2024, text: 'St. Dominic Outstation (August) and Holy Archangels Outstation (September) established. Grotto consecrated by CMA in December.' },
      { year: 2025, text: 'Divine Mercy Chapel consecrated by CWA (February). Crucifix erected by youth at Way of the Cross on Good Friday.' },
    ],
    context: 'This era marks extraordinary grassroots expansion — from 30 Jumuiyas in 2016 to 72 in 2022. Youth, men, and women\'s associations undertook major spiritual landmark projects, deepening the identity of the parish and its community.',
  },
]

const DAUGHTERS = [
  { name: 'St. Augustine Parish', location: 'JKUAT Chaplaincy' },
  { name: 'Presentation of the Lord Parish', location: 'Juja Farm' },
  { name: 'Divine Mercy Parish', location: 'Kenyatta Road' },
]

export default function History() {
  useSEO({
    title: 'Our History',
    description: 'From a 1912 Holy Ghost Fathers mission to a thriving parish of 72 Jumuiyas — the story of St. Theresa Parish, Kalimoni.',
    path: '/history',
  })
  const [activeEra, setActiveEra] = useState('founding')
  const site = useSiteMedia()
  const era = ERAS.find(e => e.id === activeEra)!

  return (
    <div>
      {/* HERO */}
      <section
        className="relative pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-18 md:pb-20 px-4 sm:px-6 md:px-10 lg:px-16 overflow-hidden"
        style={{ backgroundColor: '#1C1A18' }}
      >
        <div
          className="absolute top-0 right-0 w-full sm:w-2/3 lg:w-1/2 h-full opacity-15 sm:opacity-20"
          style={{
            backgroundImage: site.bg('history.hero', 'photo-1547471080-7cc2caa01a7e', 900, 600),
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute top-0 right-0 w-full sm:w-2/3 lg:w-1/2 h-full" style={{ background: 'linear-gradient(to right, #1C1A18, transparent)' }} />
        <div className="relative max-w-4xl">
          <div className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Our History</div>
          <h1
            className="font-bold text-white mb-5"
            style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.15 }}
          >
            Over a Century<br />
            <em className="not-italic" style={{ color: '#E8B84B' }}>of Faithful Service</em>
          </h1>
          <p className="text-sm sm:text-base md:text-lg max-w-xl leading-relaxed" style={{ color: '#F0E8D8AA' }}>
            From a pioneering mission in 1912 to a thriving community of 72 Jumuiyas —
            Kalimoni's story is one of courage, growth, and unwavering faith.
          </p>
        </div>
      </section>

      {/* ERA SELECTOR */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-xs tracking-[0.25em] uppercase mb-5 sm:mb-6" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
            Explore by Era
          </div>

          {/* Era tabs — scroll horizontally on small phones */}
          <div className="flex gap-2 mb-8 sm:mb-10 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {ERAS.map(e => (
              <button
                key={e.id}
                onClick={() => setActiveEra(e.id)}
                className="flex-shrink-0 px-4 py-2.5 text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 min-h-[44px]"
                style={{
                  backgroundColor: activeEra === e.id ? e.color : '#F0E8D8',
                  color: activeEra === e.id ? '#F0E8D8' : '#6B6259',
                  fontFamily: "'Inter', sans-serif",
                  border: activeEra === e.id ? 'none' : '1px solid #D0C4B0',
                }}
              >
                <span className="font-semibold">{e.label}</span>
                <span className="ml-2 text-xs opacity-70" style={{ fontFamily: "'DM Mono', monospace" }}>{e.period}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row lg:gap-10 items-start">
            <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
              <div className="p-1 mb-5 inline-block" style={{ backgroundColor: era.color }}>
                <span className="px-3 py-1 text-xs tracking-widest uppercase text-white block" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {era.period}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-7 sm:mb-8" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
                {era.label}
              </h2>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px" style={{ backgroundColor: era.color + '44' }} />
                <div className="flex flex-col gap-5 sm:gap-6">
                  {era.events.map((ev, i) => (
                    <div key={i} className="pl-9 sm:pl-10 relative">
                      <div
                        className="absolute left-0 top-1.5 w-5 sm:w-6 h-5 sm:h-6 flex items-center justify-center text-xs"
                        style={{ backgroundColor: era.color, color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}
                      >
                        ✦
                      </div>
                      <div className="text-xs tracking-widest uppercase mb-1" style={{ color: era.color, fontFamily: "'DM Mono', monospace" }}>
                        {ev.year}
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: '#4A3A30' }}>{ev.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <div className="p-6 sm:p-8" style={{ backgroundColor: era.color }}>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4" style={{ fontFamily: "'Lora', serif" }}>Key Context</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#F0E8D8BB' }}>{era.context}</p>
              </div>

              {activeEra === 'growth' && (
                <div className="p-5 sm:p-6" style={{ backgroundColor: '#F0E8D8' }}>
                  <div className="text-xs tracking-widest uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
                    Jumuiya Growth 2016–2022
                  </div>
                  <div className="flex items-end gap-3 h-28">
                    {[{y:2016,n:30},{y:2019,n:48},{y:2022,n:72}].map(d => (
                      <div key={d.y} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold" style={{ color: '#6B1A2A', fontFamily: "'DM Mono', monospace" }}>{d.n}</span>
                        <div style={{ height: `${(d.n / 72) * 88}px`, backgroundColor: '#6B1A2A', width: '100%' }} />
                        <span className="text-xs" style={{ color: '#6B6259', fontFamily: "'DM Mono', monospace" }}>{d.y}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* DAUGHTER PARISHES */}
      <section className="py-12 sm:py-14 md:py-16 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#4A1019' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Parish Legacy</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-7 sm:mb-8" style={{ fontFamily: "'Lora', serif" }}>
            Daughter Parishes Founded Since 2000
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DAUGHTERS.map((p, i) => (
              <div key={i} className="p-5 sm:p-6" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,146,42,0.25)' }}>
                <div className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#C8922A', fontFamily: "'Lora', serif" }}>{i + 1}.</div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1" style={{ fontFamily: "'Lora', serif" }}>{p.name}</h3>
                <p className="text-xs tracking-wide" style={{ color: '#F0E8D8AA', fontFamily: "'DM Mono', monospace" }}>{p.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
