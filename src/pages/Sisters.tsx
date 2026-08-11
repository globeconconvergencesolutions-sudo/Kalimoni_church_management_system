const APOSTOLATE = [
  { num: '01', title: 'Health Ministry', detail: 'Kalimoni Mission Hospital — a fully-fledged Level 4 hospital. What began as a modest dispensary under Sr. Juliana Mose now serves the entire wider community.', img: 'photo-1517120026326-d87759a7b63b', color: '#1A3A4A' },
  { num: '02', title: 'Education Ministry', detail: 'Kalimoni Comprehensive School, nurturing the next generation with quality education grounded in Catholic values and care.', img: 'flagged/photo-1555251255-e9a095d6eb9d', color: '#4A3A10' },
  { num: '03', title: 'Pastoral Ministry', detail: 'Guiding Small Christian Communities, ministering to children and women, and supporting parish liturgy with grace and dedication.', img: 'photo-1632932693914-89b90ae3d16d', color: '#6B1A2A' },
  { num: '04', title: 'Charitable Works', detail: 'Standing with the poor, vulnerable, and marginalised — offering practical assistance, encouragement, and the compassion of the Gospel.', img: 'photo-1599659593072-10de2e109486', color: '#2A1A4A' },
]

const IMPACT = [
  { audience: 'Families', text: 'Remember the sisters for their prayers at sickbeds, their gentle counsel, and their tireless involvement in parish activities.', icon: '♡' },
  { audience: 'Youth', text: 'See them as role models of faith and discipline, inspiring a new generation of committed and engaged Catholics.', icon: '✦' },
  { audience: 'Community', text: 'Values their contribution to health, education, and spiritual growth — touching thousands of lives across Kalimoni.', icon: '◈' },
]

export default function Sisters() {
  return (
    <div>
      {/* HERO */}
      <section
        className="relative pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-18 md:pb-20 px-4 sm:px-6 md:px-10 lg:px-16"
        style={{ background: 'linear-gradient(135deg, #1A2A3A 0%, #2A1A4A 50%, #6B1A2A 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-4xl">
          <div className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Sisters of the HHCJ</div>
          <h1
            className="font-bold text-white mb-5"
            style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.15 }}
          >
            Handmaids of the<br />
            <em className="not-italic" style={{ color: '#E8B84B' }}>Holy Child Jesus</em>
          </h1>
          <p className="text-sm sm:text-base md:text-lg max-w-xl leading-relaxed" style={{ color: '#F0E8D8AA' }}>
            Since February 4, 2000, the HHCJ Sisters have transformed health, education,
            and pastoral life in Kalimoni through their selfless dedication and love.
          </p>
        </div>
      </section>

      {/* FOUNDING STORY */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:gap-16 items-start">
          <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
            <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Their Story</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
              A Community Born<br />in Kalimoni
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: '#4A3A30' }}>
              After prayerful reflection, the HHCJ Sisters presented their request to
              <strong> Archbishop Ndingi Mwana 'Nzeki</strong>, who permitted them to take over
              a dispensary and girls' boarding facility from the Missionary Sisters of the Precious Blood.
            </p>
            <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: '#4A3A30' }}>
              On <strong>February 4, 2000</strong>, Sr. Evangeline Gitonga and Sr. Theresa Barnie
              became the first community members. Sr. Juliana Mose joined in 2006 and has
              administered the dispensary's growth into a Level 4 hospital.
            </p>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#4A3A30' }}>
              The former girls' boarding facility is now a rehabilitation home for street boys,
              supporting their reintegration into family and society.
            </p>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col gap-3">
            <img
              src="https://images.unsplash.com/photo-1517120026326-d87759a7b63b?w=700&h=360&fit=crop&auto=format"
              alt="Kalimoni Mission Hospital"
              className="w-full object-cover"
              style={{ height: 'clamp(180px, 35vw, 240px)', backgroundColor: '#D0C4B0' }}
            />
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Arrival', value: 'Feb 4, 2000' },
                { label: 'Founding Members', value: '2 Sisters' },
                { label: 'Hospital Level', value: 'Level 4' },
                { label: 'Ministry Since', value: '25 Years' },
              ].map(item => (
                <div key={item.label} className="p-3 sm:p-4" style={{ backgroundColor: '#F0E8D8', borderLeft: '3px solid #C8922A' }}>
                  <div className="text-lg sm:text-xl font-bold mb-0.5" style={{ fontFamily: "'Lora', serif", color: '#6B1A2A' }}>{item.value}</div>
                  <div className="text-xs tracking-widest uppercase" style={{ color: '#6B6259', fontFamily: "'DM Mono', monospace" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* APOSTOLATE */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#1C1A18' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Their Apostolate</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 sm:mb-10" style={{ fontFamily: "'Lora', serif" }}>
            Four Areas of<br />Transformative Service
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {APOSTOLATE.map(a => (
              <div
                key={a.num}
                className="group overflow-hidden relative transition-transform hover:-translate-y-0.5 duration-200"
                style={{ minHeight: 200, backgroundColor: a.color }}
              >
                <img
                  src={`https://images.unsplash.com/${a.img}?w=600&h=300&fit=crop&auto=format`}
                  alt={a.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                  style={{ backgroundColor: a.color }}
                />
                <div className="relative p-5 sm:p-7 flex flex-col h-full justify-between" style={{ minHeight: 200 }}>
                  <div className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 opacity-30" style={{ fontFamily: "'Lora', serif", color: '#E8B84B' }}>{a.num}</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3" style={{ fontFamily: "'Lora', serif" }}>{a.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#F0E8D8AA' }}>{a.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#F0E8D8' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Community Impact</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
            What the Community Says
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {IMPACT.map(i => (
              <div key={i.audience} className="p-5 sm:p-7" style={{ backgroundColor: '#FAF6F0', borderTop: '3px solid #C8922A' }}>
                <div className="text-2xl mb-4" style={{ color: '#C8922A' }}>{i.icon}</div>
                <div className="text-xs tracking-widest uppercase mb-3" style={{ color: '#6B1A2A', fontFamily: "'DM Mono', monospace" }}>{i.audience}</div>
                <p className="text-sm leading-relaxed" style={{ color: '#4A3A30' }}>{i.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
