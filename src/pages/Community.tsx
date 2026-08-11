import { useState } from 'react'

const GROWTH_DATA = [
  { year: 2002, count: 15 },
  { year: 2008, count: 25 },
  { year: 2016, count: 30 },
  { year: 2019, count: 48 },
  { year: 2022, count: 72 },
]

const GROUPS = [
  { name: 'Catholic Men Association (CMA)', desc: 'The CMA spearheaded the construction and consecration of the parish Grotto in December 2024 — a centre for Marian devotion.', icon: '♦', color: '#4A3A10' },
  { name: 'Catholic Women Association (CWA)', desc: 'The CWA led the consecration of the Divine Mercy Chapel in February 2025, a transformative spiritual landmark.', icon: '❧', color: '#6B1A2A' },
  { name: 'Youth Serving Christ (YSC)', desc: 'Young people actively shape parish life. The YSC helped erect the beautiful crucifix at the Way of the Cross on Good Friday 2025.', icon: '✦', color: '#1A3A4A' },
  { name: 'Young Catholic Adults (YCA)', desc: 'The YCA joins the YSC in faith formation and community service, demonstrating the vitality of youth in the parish.', icon: '◈', color: '#2A1A4A' },
]

const CELEBRATIONS = [
  'Marriage Day Celebration', 'Celebrating the Elderly', "Jumuiya & Group Feast Days",
  "Mother's Day", "International Women's Day", "Father's Day", "Men's Day", "Back-to-School Fun Day",
]

const OUTSTATIONS = [
  { name: 'St. Dominic Outstation', date: 'August 2024' },
  { name: 'Holy Archangels Outstation', date: 'September 2024' },
]

export default function Community() {
  const maxCount = Math.max(...GROWTH_DATA.map(d => d.count))
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  return (
    <div>
      {/* HERO */}
      <section
        className="relative pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-18 md:pb-20 px-4 sm:px-6 md:px-10 lg:px-16 overflow-hidden"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1780847614316-c9e933e9a9e0?w=1600&h=700&fit=crop&auto=format)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: '#4A1019D8' }} />
        <div className="relative max-w-4xl">
          <div className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Our Community</div>
          <h1
            className="font-bold text-white mb-5"
            style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.15 }}
          >
            The Heartbeat of<br />
            <em className="not-italic" style={{ color: '#E8B84B' }}>Jumuiyas</em>
          </h1>
          <p className="text-sm sm:text-base md:text-lg max-w-xl leading-relaxed" style={{ color: '#F0E8D8AA' }}>
            The parish is rooted in Small Christian Communities — <em>Jumuiyas</em> — where faith
            is lived in homes and neighbourhoods. From 15 in 2002 to 72 in 2022.
          </p>
        </div>
      </section>

      {/* JUMUIYA CHART */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Growth Journey</div>
          <div className="flex flex-col lg:flex-row lg:gap-16 items-end">
            <div className="w-full lg:w-1/2 mb-10 lg:mb-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
                20 Years of<br />Remarkable Growth
              </h2>
              <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: '#4A3A30' }}>
                Each Jumuiya is a neighbourhood-level faith community — a family of families who
                pray, serve, and celebrate together. Their growth is the truest measure of the
                parish's vitality.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[{year:2002,n:15},{year:2022,n:72}].map(d => (
                  <div key={d.year} className="p-4 sm:p-5" style={{ backgroundColor: '#F0E8D8', borderLeft: '3px solid #C8922A' }}>
                    <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ fontFamily: "'Lora', serif", color: '#6B1A2A' }}>{d.n}</div>
                    <div className="text-xs tracking-widest uppercase" style={{ color: '#6B6259', fontFamily: "'DM Mono', monospace" }}>Jumuiyas in {d.year}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive bar chart */}
            <div className="w-full lg:w-1/2">
              <div className="flex items-end gap-2 sm:gap-4 h-44 sm:h-52 mb-2">
                {GROWTH_DATA.map((d, i) => (
                  <div
                    key={d.year}
                    className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer"
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                    onTouchStart={() => setHoveredBar(i)}
                    onTouchEnd={() => setHoveredBar(null)}
                  >
                    <div
                      className="text-xs font-bold transition-all"
                      style={{
                        color: hoveredBar === i ? '#C8922A' : '#6B1A2A',
                        fontFamily: "'DM Mono', monospace",
                        opacity: hoveredBar === null || hoveredBar === i ? 1 : 0.4,
                      }}
                    >
                      {d.count}
                    </div>
                    <div
                      className="w-full transition-all duration-300"
                      style={{
                        height: `${(d.count / maxCount) * 160}px`,
                        backgroundColor: hoveredBar === i ? '#C8922A' : d.count === maxCount ? '#8B3A1A' : '#6B1A2A',
                        opacity: hoveredBar === null || hoveredBar === i ? 1 : 0.5,
                      }}
                    />
                    <span className="text-[10px] sm:text-xs" style={{ color: '#6B6259', fontFamily: "'DM Mono', monospace" }}>{d.year}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-center tracking-wide" style={{ color: '#8A7A70', fontFamily: "'DM Mono', monospace" }}>
                Tap bars · Jumuiya count 2002–2022
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PARISH GROUPS */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#1C1A18' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Parish Associations</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 sm:mb-10" style={{ fontFamily: "'Lora', serif" }}>
            Groups That Build<br />Our Community
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GROUPS.map(g => (
              <div
                key={g.name}
                className="p-5 sm:p-6 flex flex-row gap-4 items-start transition-transform hover:-translate-y-0.5 duration-200"
                style={{ backgroundColor: g.color }}
              >
                <div className="text-2xl sm:text-3xl shrink-0 mt-0.5" style={{ color: '#E8B84B' }}>{g.icon}</div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2" style={{ fontFamily: "'Lora', serif" }}>{g.name}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#F0E8D8AA' }}>{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CELEBRATIONS */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#F0E8D8' }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:gap-16">
          <div className="w-full lg:w-1/2 mb-10 lg:mb-0">
            <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Community Celebrations</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
              Joyful Faith,<br />Celebrated Together
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-7" style={{ color: '#4A3A30' }}>
              Vincentian ministry in Kalimoni is marked by prayer, service, and celebration.
              The parish marks many moments of community and family throughout the year.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CELEBRATIONS.map(c => (
                <div key={c} className="py-2.5 px-3 text-sm flex items-center gap-2" style={{ backgroundColor: '#FAF6F0', color: '#4A3A30' }}>
                  <span style={{ color: '#C8922A' }}>✦</span> {c}
                </div>
              ))}
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col gap-3">
            <img
              src="https://images.unsplash.com/photo-1781263378223-1e09658a7567?w=700&h=500&fit=crop&auto=format"
              alt="Community celebration at St. Theresa Parish"
              className="w-full object-cover"
              style={{ height: 'clamp(200px, 40vw, 280px)', backgroundColor: '#D0C4B0' }}
            />
            <img
              src="https://images.unsplash.com/photo-1779357807569-18d3df9df645?w=700&h=300&fit=crop&auto=format"
              alt="Women of the parish in colourful attire"
              className="w-full object-cover"
              style={{ height: 'clamp(140px, 25vw, 180px)', backgroundColor: '#D0C4B0' }}
            />
          </div>
        </div>
      </section>

      {/* OUTSTATIONS */}
      <section className="py-10 sm:py-12 md:py-16 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#6B1A2A' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>2024 Expansion</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8" style={{ fontFamily: "'Lora', serif" }}>
            Two New Outstations Established
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {OUTSTATIONS.map(o => (
              <div key={o.name} className="p-5 sm:p-6" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(232,184,75,0.25)' }}>
                <div className="text-xs tracking-widest uppercase mb-2" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>{o.date}</div>
                <h3 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: "'Lora', serif" }}>{o.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
