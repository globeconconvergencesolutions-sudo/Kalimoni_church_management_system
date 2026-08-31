import { Link } from 'react-router'
import { useSEO } from '../hooks/useSEO'

const PILLARS = [
  { icon: '✦', title: 'Faith', desc: 'Rooted in the Catholic tradition, nurtured through the sacraments, scripture, and the Small Christian Communities known as Jumuiyas.' },
  { icon: '♦', title: 'Service', desc: 'Inspired by the Vincentian spirit of "proclaiming the good news to the poor," we serve God through concrete acts of charity.' },
  { icon: '◈', title: 'Community', desc: 'Bound together across 72 Jumuiyas, the parish is a living network of neighbours, families, and friends sharing faith.' },
  { icon: '❧', title: 'Growth', desc: 'From 15 Jumuiyas in 2002 to 72 in 2022, the parish continues to grow in numbers, in depth of faith, and in geographic reach.' },
]

export default function About() {
  useSEO({ title: 'About Us', description: 'Learn about the vision, mission, and identity of St. Theresa Parish, Kalimoni — a Catholic community in Juja, Kiambu County, Kenya, serving since 1912.', path: '/about' })
  return (
    <div>
      {/* HERO */}
      <div className="pt-16 sm:pt-20 px-3 sm:px-5 lg:px-8" style={{ backgroundColor: '#FAF6F0' }}>
      <section
        className="hero-section relative rounded-2xl overflow-hidden pt-12 sm:pt-14 pb-14 sm:pb-20 px-6 sm:px-10 lg:px-16"
        style={{ background: 'linear-gradient(135deg, #4A1019 0%, #6B1A2A 60%, #8B3A1A 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <div className="relative max-w-4xl mx-auto">
          <div className="text-xs uppercase mb-4 tracking-[0.3em]" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>
            About the Parish
          </div>
          <h1
            className="font-bold text-white mb-5"
            style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.15 }}
          >
            A Living Church<br />in the Heart of Juja
          </h1>
          <p className="text-sm sm:text-base md:text-lg max-w-xl leading-relaxed" style={{ color: '#F0E8D8AA' }}>
            St. Theresa Parish, Kalimoni has been a beacon of faith, hope, and charity in
            Kiambu County, Kenya, since the Holy Ghost Fathers arrived in 1912.
          </p>
        </div>
      </section>
      </div>

      {/* IDENTITY */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:gap-16 items-start">
          <div className="w-full lg:w-1/2 mb-8 lg:mb-0 relative">
            <div
              className="absolute -inset-0 opacity-0"
              style={{ boxShadow: '0 0 0 1px rgba(200,146,42,0.15)' }}
            />
            <img
              src="https://images.unsplash.com/photo-1438032005730-c779502df39b?w=700&h=520&fit=crop&auto=format"
              alt="Church interior"
              className="w-full object-cover"
              style={{ height: 'clamp(200px, 40vw, 400px)', backgroundColor: '#D0C4B0' }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-1/3"
              style={{ background: 'linear-gradient(to top, rgba(250,246,240,0.7) 0%, transparent 100%)' }}
            />
          </div>
          <div className="w-full lg:w-1/2">
            <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Who We Are</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
              Faith Rooted in<br />East African Soil
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: '#4A3A30' }}>
              St. Theresa Parish, Kalimoni is located in <strong>Kalimoni, Juja, Kiambu County, Kenya</strong>,
              within the <strong>Ruiru Deanery</strong> of the Catholic Archdiocese of Nairobi.
            </p>
            <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: '#4A3A30' }}>
              Since 1912, the parish has grown from a remote mission station into a thriving
              mother-church that has given birth to multiple daughter parishes, a Level 4 hospital,
              a comprehensive school, and countless outreach programmes.
            </p>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#4A3A30' }}>
              Today it is served by the <strong>Vincentian Congregation</strong> and the
              <strong> Sisters of the Handmaids of the Holy Child Jesus (HHCJ)</strong>,
              whose combined ministry reaches thousands every year.
            </p>
          </div>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="py-12 sm:py-14 md:py-16 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#F0E8D8' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
            <div className="p-6 sm:p-8 relative" style={{ backgroundColor: '#6B1A2A' }}>
              <div className="text-xs tracking-[0.25em] uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Our Vision</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Lora', serif" }}>A Transformed Community</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#F0E8D8BB' }}>
                To be a vibrant, Christ-centred community that transforms lives through faith,
                service, and the witness of love — reaching every home in Kalimoni and beyond.
              </p>
              <div className="mt-4 px-3 py-2 text-[10px] tracking-widest" style={{ backgroundColor: 'rgba(232,184,75,0.12)', border: '1px dashed rgba(232,184,75,0.4)', color: '#E8B84B88', fontFamily: "'DM Mono', monospace" }}>
                ✎ Official statement to be confirmed by parish leadership
              </div>
            </div>
            <div className="p-6 sm:p-8 relative" style={{ backgroundColor: '#4A3A10' }}>
              <div className="text-xs tracking-[0.25em] uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Our Mission</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Lora', serif" }}>Proclaiming the Good News</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#F0E8D8BB' }}>
                To evangelise, serve the poor, nurture Small Christian Communities, and build
                a parish family united in worship, charity, and joyful celebration of life.
              </p>
              <div className="mt-4 px-3 py-2 text-[10px] tracking-widest" style={{ backgroundColor: 'rgba(232,184,75,0.12)', border: '1px dashed rgba(232,184,75,0.4)', color: '#E8B84B88', fontFamily: "'DM Mono', monospace" }}>
                ✎ Official statement to be confirmed by parish leadership
              </div>
            </div>
          </div>
          {/* Core Values placeholder */}
          <div className="p-5 sm:p-6 flex items-start gap-3" style={{ backgroundColor: '#F0E8D8', border: '1px dashed #C8922A55' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8922A" strokeWidth="2" strokeLinecap="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
            <div>
              <div className="text-xs tracking-widest uppercase mb-1" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Core Values — Awaiting Content</div>
              <p className="text-sm" style={{ color: '#8A7A70' }}>
                The parish core values will appear here once confirmed by Fr. Josephh Shijo and the parish leadership team.
                Please contact the parish office at <a href="mailto:sttheresakalimoniparish@gmail.com" className="underline hover:text-burgundy" style={{ color: '#6B1A2A' }}>sttheresakalimoniparish@gmail.com</a> to provide this content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PARISH PRIEST */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:gap-16 items-start">
          <div className="w-full lg:w-5/12 mb-8 lg:mb-0">
            <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Parish Priest</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
              Fr. Josephh Shijo
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: '#4A3A30' }}>
              Fr. Josephh Shijo serves as the Parish Priest of St. Theresa Catholic Church, Kalimoni,
              under the <strong>Vincentian Congregation</strong> within the Catholic Archdiocese of Nairobi.
            </p>
            <p className="text-sm sm:text-base leading-relaxed mb-5" style={{ color: '#4A3A30' }}>
              Guided by the Vincentian motto — <em>"He has sent me to proclaim the good news to the poor"</em> (Luke 4:18) —
              Fr. Shijo leads the parish community in evangelisation, pastoral care, and service to all 72 Jumuiyas.
            </p>
            <div className="p-4 text-xs flex items-start gap-2.5" style={{ backgroundColor: '#F0E8D8', border: '1px dashed #C8922A55', fontFamily: "'DM Mono', monospace", color: '#8A7A70' }}>
              <span style={{ color: '#C8922A' }}>✎</span>
              <span>Priest biography and photo to be provided by the parish. Contact <a href="mailto:sttheresakalimoniparish@gmail.com" className="underline" style={{ color: '#6B1A2A' }}>sttheresakalimoniparish@gmail.com</a> to submit.</span>
            </div>
          </div>
          <div className="w-full lg:w-7/12">
            {/* Quote & key info */}
            <div className="p-6 sm:p-8 mb-4" style={{ backgroundColor: '#6B1A2A' }}>
              <div className="text-4xl mb-4 opacity-30" style={{ color: '#E8B84B', fontFamily: 'Georgia, serif' }}>"</div>
              <blockquote className="text-base sm:text-lg italic leading-relaxed text-white mb-4" style={{ fontFamily: "'Lora', serif" }}>
                Service to God through service to humanity is not merely a motto — it is the daily call
                of every member of this parish community.
              </blockquote>
              <cite className="text-xs tracking-widest uppercase not-italic" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>
                — Fr. Josephh Shijo, Parish Priest
              </cite>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Congregation', value: 'Vincentian (C.M.)' },
                { label: 'Archdiocese', value: 'Nairobi' },
                { label: 'Deanery', value: 'Ruiru' },
                { label: 'Parish', value: 'St. Theresa, Kalimoni' },
              ].map(({ label, value }) => (
                <div key={label} className="p-4" style={{ backgroundColor: '#F0E8D8' }}>
                  <div className="text-[10px] tracking-widest uppercase mb-1" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>{label}</div>
                  <div className="text-sm font-semibold" style={{ color: '#4A1019', fontFamily: "'Lora', serif" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOUR PILLARS */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Our Values</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
            Four Pillars of Parish Life
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map(p => (
              <div
                key={p.title}
                className="group relative overflow-hidden p-6 sm:p-7 transition-all duration-300 hover:-translate-y-0.5"
                style={{ backgroundColor: '#F0E8D8', borderTop: '1px solid rgba(200,146,42,0.45)' }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(160deg, rgba(200,146,42,0.05) 0%, transparent 60%)' }}
                />
                <div className="relative">
                  <div className="text-xl mb-4 opacity-70" style={{ color: '#C8922A' }}>{p.icon}</div>
                  <h3 className="text-base font-bold mb-2.5" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>{p.title}</h3>
                  <p className="text-sm leading-[1.75]" style={{ color: '#6B5A4E' }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="py-12 sm:py-14 md:py-16 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#1C1A18' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:gap-12 items-center">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Where to Find Us</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-5" style={{ fontFamily: "'Lora', serif" }}>
              Kalimoni, Juja<br />Kiambu County, Kenya
            </h2>
            <div className="flex flex-col gap-3">
              {[
                ['Parish', 'St. Theresa Parish, Kalimoni'],
                ['Deanery', 'Ruiru Deanery'],
                ['Archdiocese', 'Catholic Archdiocese of Nairobi'],
                ['County', 'Kiambu County, Kenya'],
                ['Congregation', 'Vincentian Congregation (since 2000)'],
                ['Sisters', 'HHCJ Sisters (since 2000)'],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3 sm:gap-4 text-sm">
                  <span className="shrink-0 pt-0.5 text-xs uppercase tracking-widest" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace", width: 100 }}>{label}</span>
                  <span style={{ color: '#F0E8D8BB' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="w-full flex items-center justify-center text-center p-8 sm:p-12" style={{ backgroundColor: '#6B1A2A', minHeight: 220 }}>
              <div>
                <div className="text-5xl sm:text-6xl mb-4 opacity-50" style={{ color: '#E8B84B', fontFamily: 'Georgia, serif' }}>✝</div>
                <p className="text-base sm:text-lg italic text-white" style={{ fontFamily: "'Lora', serif" }}>
                  "He has sent me to proclaim<br />the good news to the poor."
                </p>
                <p className="text-xs mt-3 tracking-widest uppercase" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Luke 4:18 — Vincentian Motto</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#F0E8D8' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <p className="text-sm sm:text-base" style={{ color: '#4A3A30' }}>
            Want to know how we began? Explore our 113-year journey.
          </p>
          <Link
            to="/history"
            className="px-6 sm:px-7 py-3 font-semibold text-sm tracking-wide transition-all hover:brightness-110 whitespace-nowrap min-h-[44px] flex items-center"
            style={{ backgroundColor: '#6B1A2A', color: '#F0E8D8', fontFamily: "'Inter', sans-serif" }}
          >
            Our Full History →
          </Link>
        </div>
      </section>
    </div>
  )
}
