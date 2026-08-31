import { useState } from 'react'
import { useSEO } from '../hooks/useSEO'

const PILLARS = [
  {
    id: 'evangelisation', icon: '✦', title: 'Evangelisation', subtitle: 'Nurturing the Faithful',
    desc: 'The Vincentians\' primary mission is to deepen the faith of Christians through the word and sacraments.',
    items: ['Daily Eucharistic Celebrations & Sacraments', 'Recollections and Retreats', 'Pilgrimages', 'Publications', 'House Blessings and Pastoral Visits', 'Pastoral Care to Institutions'],
  },
  {
    id: 'celebrations', icon: '❧', title: 'Celebrations', subtitle: 'Building a Joyful Community',
    desc: 'Vincentian ministry in Kalimoni is marked not only by prayer but by celebration and community life.',
    items: ['Marriage Day Celebration', 'Celebrating the Elderly', "Jumuiya and Group Feast Days", "Mother's Day & Father's Day", "International Women's Day", "Back-to-School Fun Day"],
  },
  {
    id: 'charity', icon: '♦', title: 'Charity', subtitle: 'Living the Gospel of Love',
    desc: 'Charity is the cornerstone of Vincentian spirituality. In Kalimoni, this is lived through concrete works of mercy.',
    items: ['Visiting the Sick and Needy', 'Food and Shelter Provision', 'Education Support', 'Counselling Services', 'Supporting Group Activities', 'Tokens of Gratitude'],
  },
  {
    id: 'leadership', icon: '◆', title: 'Leadership & Unity', subtitle: 'The Vincentian Spirit at Work',
    desc: 'The success of the Vincentian mission is anchored in prudent leadership and unity among the Vincentian family.',
    items: ['Prudent Financial Management', 'Empowered Lay Leadership', 'Unity Among Vincentians', 'Counselling Services', 'Supporting Groups Spiritually & Financially', 'Tokens of Gratitude'],
  },
]

export default function Vincentians() {
  useSEO({
    title: 'Vincentian Fathers',
    description: 'The Vincentian Congregation has served St. Theresa Parish, Kalimoni since 2000 through evangelisation, celebration, charity, and leadership.',
    path: '/vincentians',
  })
  const [activePillar, setActivePillar] = useState('evangelisation')
  const pillar = PILLARS.find(p => p.id === activePillar)!

  return (
    <div>
      {/* HERO */}
      <section
        className="relative pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-18 md:pb-20 px-4 sm:px-6 md:px-10 lg:px-16 overflow-hidden"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1609234656381-73e732808098?w=1600&h=800&fit=crop&auto=format)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: '#2D0810E8' }} />
        <div className="relative max-w-4xl">
          <div className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>The Vincentian Congregation</div>
          <h1
            className="font-bold text-white mb-4"
            style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.15 }}
          >
            Sent to Proclaim<br />
            <em className="not-italic" style={{ color: '#E8B84B' }}>the Good News</em>
          </h1>
          <blockquote className="text-base sm:text-lg italic mb-4 border-l-2 pl-4 sm:pl-5" style={{ color: '#E8B84B', borderColor: '#E8B84B', fontFamily: "'Lora', serif" }}>
            "He has sent me to proclaim the good news to the poor." — Luke 4:18
          </blockquote>
          <p className="text-sm sm:text-base max-w-xl leading-relaxed" style={{ color: '#F0E8D8AA' }}>
            The Vincentian Congregation has served St. Theresa Parish, Kalimoni since 2000,
            bringing missionary zeal, pastoral care, and the spirit of St. Vincent de Paul.
          </p>
        </div>
      </section>

      {/* HISTORY */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:gap-16 items-start">
          <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
            <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>About the Congregation</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
              Inspired by St. Vincent<br />de Paul
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: '#4A3A30' }}>
              The Vincentian Congregation is a clerical society within the Catholic Church,
              inspired by the spirituality and works of St. Vincent de Paul, honoured as its patron.
            </p>
            <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: '#4A3A30' }}>
              Founded in India in 1904 by <strong>Rev. Fr. Varkey Kattarath</strong>, the congregation
              was elevated to a society of pontifical right on <strong>February 11, 1968</strong>.
            </p>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#4A3A30' }}>
              The Vincentian Missionaries arrived in Kenya in the late 1990s. Under
              <strong> Fr. James Edavazhira VC</strong>, they officially took charge of Kalimoni
              in 2000.
            </p>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col gap-0 divide-y" style={{ borderColor: '#E0D4C0' }}>
            {[
              ['Founded', '1904 in India, by Fr. Varkey Kattarath'],
              ['Pontifical Right', 'February 11, 1968'],
              ['Arrived in Kenya', 'Late 1990s'],
              ['Arrived in Kalimoni', '1999'],
              ['Took charge', '2000, under Fr. James Edavazhira VC'],
              ['Patron Saint', 'St. Vincent de Paul'],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-3 sm:gap-4 py-3 text-sm" style={{ borderColor: '#E0D4C0' }}>
                <span className="shrink-0 text-xs uppercase tracking-widest pt-0.5" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace", minWidth: 90 }}>{label}</span>
                <span style={{ color: '#4A3A30' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUR PILLARS — INTERACTIVE */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#1C1A18' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Ministry in Kalimoni</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 sm:mb-10" style={{ fontFamily: "'Lora', serif" }}>
            Four Pillars of<br />Vincentian Service
          </h2>

          {/* Pillar selector — 2 cols on phone, 4 on tablet+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {PILLARS.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePillar(p.id)}
                className="p-3 sm:p-4 text-left transition-all duration-200 min-h-[80px] sm:min-h-[100px]"
                style={{
                  backgroundColor: activePillar === p.id ? '#C8922A' : 'rgba(255,255,255,0.05)',
                  border: activePillar === p.id ? 'none' : '1px solid rgba(200,146,42,0.2)',
                }}
              >
                <div className="text-lg sm:text-xl mb-1.5" style={{ color: activePillar === p.id ? '#FAF6F0' : '#E8B84B' }}>{p.icon}</div>
                <div className="text-xs sm:text-sm font-bold leading-tight" style={{ fontFamily: "'Lora', serif", color: activePillar === p.id ? '#FAF6F0' : '#F0E8D8' }}>{p.title}</div>
              </button>
            ))}
          </div>

          {/* Pillar detail */}
          <div
            className="p-5 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,146,42,0.2)' }}
          >
            <div>
              <div className="text-xs tracking-widest uppercase mb-2" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>{pillar.subtitle}</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Lora', serif" }}>{pillar.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#F0E8D8AA' }}>{pillar.desc}</p>
            </div>
            <div>
              <div className="text-xs tracking-widest uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Activities</div>
              <div className="flex flex-col gap-0 divide-y" style={{ borderColor: 'rgba(200,146,42,0.15)' }}>
                {pillar.items.map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm py-2.5" style={{ color: '#F0E8D8BB' }}>
                    <span style={{ color: '#C8922A', fontSize: '0.5rem' }}>●</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CANDLE BANNER — no fixed attachment on mobile (iOS bug) */}
      <section
        className="py-16 sm:py-20 px-4 sm:px-6 md:px-10 lg:px-16 relative"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1476873282730-9018f17bdf4e?w=1600&h=600&fit=crop&auto=format)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: '#4A1019CC' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl italic font-bold text-white mb-5" style={{ fontFamily: "'Lora', serif" }}>
            "Service to God through<br />service to humanity."
          </h2>
          <div className="text-xs sm:text-sm tracking-widest uppercase" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>
            — The Vincentian Spirit, Kalimoni since 2000
          </div>
        </div>
      </section>
    </div>
  )
}
