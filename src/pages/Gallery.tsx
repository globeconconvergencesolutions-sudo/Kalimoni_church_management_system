import { useEffect, useState } from 'react'
import { fetchPublishedMedia } from '../lib/mediaAdmin'
import { parishImage, parishVideo, parishVideoPoster, type ParishMedia } from '../lib/media'
import { useSEO } from '../hooks/useSEO'

const FALLBACK = [
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

type GalleryItem = {
  id: string
  src: string
  title: string
  category: string
  desc: string
  mediaType?: string
}

function fromMedia(row: ParishMedia): GalleryItem {
  return {
    id: row.id,
    src: row.url || row.cloudinary_id,
    title: row.title,
    category: row.category,
    desc: row.alt,
    mediaType: row.media_type,
  }
}

export default function Gallery() {
  useSEO({ title: 'Photo Gallery', description: 'Browse photos from St. Theresa Parish, Kalimoni — community celebrations, youth ministry, liturgical events, and parish life in Juja, Kenya.', path: '/gallery' })
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)
  const [photos, setPhotos] = useState<GalleryItem[]>(FALLBACK.map(p => ({ ...p, src: p.id, desc: p.desc })))
  const [live, setLive] = useState(false)

  useEffect(() => {
    void fetchPublishedMedia().then(rows => {
      if (!rows.length) return
      setPhotos(rows.map(fromMedia))
      setLive(true)
    })
  }, [])

  const categories = ['All', ...Array.from(new Set(photos.map(p => p.category)))]
  const filtered = activeCategory === 'All' ? photos : photos.filter(p => p.category === activeCategory)

  return (
    <div>
      <div className="pt-16 sm:pt-20 px-3 sm:px-5 lg:px-8" style={{ backgroundColor: '#FAF6F0' }}>
      <section
        className="hero-section relative rounded-2xl overflow-hidden pt-12 sm:pt-14 pb-14 sm:pb-20 px-6 sm:px-10 lg:px-16"
        style={{ background: 'linear-gradient(135deg, #4A1019 0%, #6B1A2A 60%, #8B3A1A 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-4xl">
          <div className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Parish Gallery</div>
          <h1
            className="font-bold text-white mb-5"
            style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.15 }}
          >
            Moments of<br />
            <em className="not-italic" style={{ color: '#E8B84B' }}>Faith & Community</em>
          </h1>
          <p className="text-sm sm:text-base max-w-lg leading-relaxed" style={{ color: '#F0E8D8AA' }}>
            {live
              ? 'Celebrations, worship, and community life in Kalimoni — shared from the heart of the parish.'
              : 'A visual journey through faith and fellowship at St. Theresa Parish, Kalimoni.'}
          </p>
        </div>
      </section>
      </div>

      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 mb-8 sm:mb-10 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {categories.map(cat => (
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
                  ({cat === 'All' ? photos.length : photos.filter(p => p.category === cat).length})
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {filtered.map(photo => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightbox(photo)}
                className="group relative overflow-hidden text-left"
                style={{ aspectRatio: '5 / 4', backgroundColor: '#D0C4B0' }}
              >
                {photo.mediaType === 'video' ? (
                  <>
                    <img
                      src={parishVideoPoster(photo.src, 500, 400)}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[9px] tracking-widest uppercase" style={{ backgroundColor: 'rgba(28,26,24,0.75)', color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Video</span>
                  </>
                ) : (
                  <img
                    src={parishImage(photo.src, 500, 400)}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightbox ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(12,4,8,0.88)' }} onClick={() => setLightbox(null)}>
          <div className="max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            {lightbox.mediaType === 'video' ? (
              <video
                src={parishVideo(lightbox.src, 1200)}
                controls
                playsInline
                className="w-full object-contain max-h-[70vh] bg-black"
              />
            ) : (
              <img src={parishImage(lightbox.src, 1200, 800)} alt={lightbox.title} className="w-full object-contain max-h-[70vh]" />
            )}
            <div className="mt-3 text-white">
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>{lightbox.category}</div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Lora', serif" }}>{lightbox.title}</h2>
              <p className="text-sm mt-1" style={{ color: '#F0E8D8AA' }}>{lightbox.desc}</p>
            </div>
            <button type="button" onClick={() => setLightbox(null)} className="mt-4 text-xs uppercase tracking-widest" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Close</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
