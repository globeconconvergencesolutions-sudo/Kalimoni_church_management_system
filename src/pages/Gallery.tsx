import { useState } from 'react'
import { useSEO } from '../hooks/useSEO'

const CATEGORIES = ['All', 'Church Life', 'Sacraments', 'Celebrations', 'Community Outreach', 'Youth Activities']

const PHOTOS = [
  { id: 'photo-1609234656388-0ff363383899', title: 'Parish Community Gathering', category: 'Church Life', desc: 'A vibrant gathering of the St. Theresa Parish community, reflecting the unity and joy of faith shared together.' },
  { id: 'photo-1609234656381-73e732808098', title: 'Faith in Fellowship', category: 'Church Life', desc: 'Members of the parish community in prayer and fellowship, embodying the Vincentian spirit of service and unity.' },
  { id: 'photo-1550541231-56ddb7f844ec', title: 'Stained Glass — Light of Faith', category: 'Sacraments', desc: 'Sacred light filtering through stained glass — a symbol of the faith that has sustained Kalimoni for over 99 years.' },
  { id: 'photo-1642695113989-105367adabe6', title: 'Cathedral Windows', category: 'Sacraments', desc: 'The beauty of Catholic sacred art, reflecting the deep tradition of worship that defines our parish identity.' },
  { id: 'photo-1476873282730-9018f17bdf4e', title: 'Candles of Devotion', category: 'Sacraments', desc: 'The warm light of votive candles — prayers rising like incense, a practice dear to the heart of the Kalimoni parish.' },
  { id: 'photo-1555883451-aeb2991f0a9e', title: 'Vigil Lights', category: 'Sacraments', desc: 'Every flame represents a prayer, a hope, a life entrusted to God by the faithful of St. Theresa Parish.' },
  { id: 'photo-1780847614316-c9e933e9a9e0', title: 'Cultural Celebration — Feast Day', category: 'Celebrations', desc: 'Parishioners in vibrant traditional attire during a parish feast day — where African culture and Catholic faith meet.' },
  { id: 'photo-1780847615151-5f6397829786', title: 'Diverse Community', category: 'Celebrations', desc: 'People from across the region gather in joyful celebration of faith, community, and shared humanity.' },
  { id: 'photo-1779357807569-18d3df9df645', title: 'Women of the Parish', category: 'Celebrations', desc: 'The women of the parish, whose dedication and strength are the backbone of the Kalimoni community.' },
  { id: 'photo-1781263378223-1e09658a7567', title: 'Joy of Community', category: 'Church Life', desc: 'Smiling faces of the parish family — children, adults, and elders united in the joy of Christian community.' },
  { id: 'photo-1547496613-4e19af6736dc', title: "A Child's Faith", category: 'Youth Activities', desc: 'The future of St. Theresa Parish — young people growing up in the warmth of a living faith community.' },
  { id: 'photo-1632932693914-89b90ae3d16d', title: 'Children Learning Together', category: 'Youth Activities', desc: 'Children at Kalimoni Comprehensive School, where education and faith go hand in hand.' },
  { id: 'photo-1580582932707-520aed937b7b', title: 'YSC Youth Ministry', category: 'Youth Activities', desc: 'The Youths Serving Christ — vibrant, alive, and growing in faith at St. Theresa Parish, Kalimoni.' },
  { id: 'photo-1517120026326-d87759a7b63b', title: 'Kalimoni Mission Hospital', category: 'Community Outreach', desc: 'The Kalimoni Mission Hospital — a Level 4 facility that grew from a small dispensary under the care of the HHCJ Sisters.' },
  { id: 'photo-1625702929485-984787146d49', title: 'Parish Charitable Works', category: 'Community Outreach', desc: "Vincentian outreach — 'Proclaiming the good news to the poor' through concrete acts of charity and service." },
  { id: 'photo-1438032005730-c779502df39b', title: 'Church Interior', category: 'Sacraments', desc: 'The interior of a Catholic church — a place of encounter with the divine that mirrors the spirit of St. Theresa Parish.' },
]

export default function Gallery() {
  useSEO({ title: 'Photo Gallery', description: 'Browse photos from St. Theresa Parish, Kalimoni — community celebrations, youth ministry, liturgical events, and parish life in Juja, Kenya.', path: '/gallery' })
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightbox, setLightbox] = useState<typeof PHOTOS[0] | null>(null)

  const filtered = activeCategory === 'All' ? PHOTOS : PHOTOS.filter(p => p.category === activeCategory)

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
          <div className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace", marginLeft: '31px', marginRight: '31px' }}>Parish Gallery</div>
          <h1
            className="font-bold text-white mb-5"
            style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.15, marginLeft: '28px', marginRight: '28px' }}
          >
            Moments of<br />
            <em className="not-italic" style={{ color: '#E8B84B' }}>Faith & Community</em>
          </h1>
          <p className="text-sm sm:text-base max-w-lg leading-relaxed" style={{ color: '#F0E8D8AA', marginLeft: '29px', marginRight: '29px' }}>
            A visual journey through parish life — celebrations, worship, education, health,
            and the joyful faces of a community alive in faith.
          </p>
        </div>
      </section>
      </div>

      {/* FILTER + GRID */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-7xl mx-auto">
          {/* Category filter — horizontal scroll on phone */}
          <div className="flex gap-2 mb-8 sm:mb-10 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0 px-3 sm:px-4 py-2 text-xs tracking-wide transition-all duration-200 min-h-[40px]"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  backgroundColor: activeCategory === cat ? '#6B1A2A' : '#F0E8D8',
                  color: activeCategory === cat ? '#E8B84B' : '#6B6259',
                  border: activeCategory === cat ? 'none' : '1px solid #D0C4B0',
                }}
              >
                {cat}
                <span className="ml-1.5 opacity-50">
                  ({cat === 'All' ? PHOTOS.length : PHOTOS.filter(p => p.category === cat).length})
                </span>
              </button>
            ))}
          </div>

          {/* Responsive masonry grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-2 sm:gap-2.5 space-y-2 sm:space-y-2.5">
            {filtered.map(photo => (
              <div
                key={photo.id}
                className="break-inside-avoid cursor-pointer group relative overflow-hidden"
                onClick={() => setLightbox(photo)}
                style={{ backgroundColor: '#D0C4B0' }}
              >
                <img
                  src={`https://images.unsplash.com/${photo.id}?w=500&h=400&fit=crop&auto=format`}
                  alt={photo.title}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ display: 'block' }}
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: 'linear-gradient(to top, rgba(28,8,15,0.92) 0%, rgba(74,16,25,0.5) 50%, transparent 100%)' }}
                >
                  <span className="text-[9px] tracking-[0.25em] uppercase mb-1.5" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>{photo.category}</span>
                  <span className="text-xs sm:text-sm font-bold text-white leading-snug" style={{ fontFamily: "'Lora', serif" }}>{photo.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10"
          style={{ backgroundColor: 'rgba(28,26,24,0.97)' }}
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative w-full max-w-4xl flex flex-col md:flex-row overflow-hidden"
            style={{ maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 z-10 text-white w-10 h-10 flex items-center justify-center transition-colors hover:text-yellow-300 bg-black/40"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <img
              src={`https://images.unsplash.com/${lightbox.id}?w=800&h=600&fit=crop&auto=format`}
              alt={lightbox.title}
              className="w-full md:w-2/3 object-cover"
              style={{ maxHeight: '60vw', minHeight: 200, backgroundColor: '#2C2A28' }}
            />
            <div className="p-5 sm:p-7 flex flex-col justify-end md:w-1/3 flex-shrink-0" style={{ backgroundColor: '#2C2A28' }}>
              <div className="text-xs tracking-widest uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>{lightbox.category}</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3" style={{ fontFamily: "'Lora', serif" }}>{lightbox.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#F0E8D8AA' }}>{lightbox.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
