import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { fetchPublishedAlbumBySlug, type MediaAlbumWithCover } from '../lib/mediaAlbums'
import { parishImage } from '../lib/media'
import { useSEO } from '../hooks/useSEO'

export default function StoryAlbum() {
  const { slug = '' } = useParams()
  const [album, setAlbum] = useState<MediaAlbumWithCover | null>(null)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void fetchPublishedAlbumBySlug(slug).then(row => {
      if (!cancelled) {
        setAlbum(row)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [slug])

  useSEO({
    title: album?.title || 'Photo story',
    description: album?.summary || 'A photo story from St. Theresa Kalimoni Parish.',
    path: `/stories/${slug}`,
  })

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center" style={{ backgroundColor: '#FAF6F0' }}>
        <p className="text-sm" style={{ color: '#6B6259' }}>Loading story…</p>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: '#FAF6F0' }}>
        <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
          Story not found
        </h1>
        <p className="text-sm mb-6" style={{ color: '#6B6259' }}>
          This photo story is not published or the link may have changed.
        </p>
        <Link to="/gallery" className="px-6 py-3 text-sm font-semibold" style={{ backgroundColor: '#6B1A2A', color: '#F0E8D8' }}>
          Browse the gallery
        </Link>
      </div>
    )
  }

  const items = album.items ?? []
  const coverSrc = album.cover
    ? parishImage(album.cover.cloudinary_id || album.cover.url, 1600, 900)
    : ''

  return (
    <div style={{ backgroundColor: '#FAF6F0' }}>
      <section
        className="relative pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-8 lg:px-16 overflow-hidden"
        style={{
          backgroundImage: coverSrc ? `url(${coverSrc})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#4A1019',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(28,8,15,0.72) 0%, rgba(74,16,25,0.9) 100%)' }} />
        <div className="relative max-w-4xl">
          <div className="text-[10px] tracking-[0.28em] uppercase mb-3" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>
            Photo story · {album.category}
          </div>
          <h1
            className="text-white font-bold mb-4"
            style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.85rem, 5vw, 3.2rem)', lineHeight: 1.15 }}
          >
            {album.title}
          </h1>
          {album.summary ? (
            <p className="text-sm sm:text-base max-w-2xl leading-relaxed" style={{ color: 'rgba(240,232,216,0.85)' }}>
              {album.summary}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              to="/gallery"
              className="px-5 py-3 text-xs tracking-widest uppercase min-h-[44px] inline-flex items-center"
              style={{ border: '1px solid rgba(232,184,75,0.6)', color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}
            >
              Gallery
            </Link>
            {album.related_post_slug ? (
              <Link
                to={`/blog/${album.related_post_slug}`}
                className="px-5 py-3 text-xs tracking-widest uppercase min-h-[44px] inline-flex items-center"
                style={{ backgroundColor: '#C8922A', color: '#1C1A18', fontFamily: "'DM Mono', monospace" }}
              >
                Read the full article
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {album.body ? (
        <section className="px-4 sm:px-8 lg:px-16 py-10">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line" style={{ color: '#4A4038' }}>
              {album.body}
            </p>
          </div>
        </section>
      ) : null}

      <section className="px-4 sm:px-8 lg:px-16 pb-16 sm:pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-[10px] tracking-[0.22em] uppercase mb-6" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
            {items.length} photograph{items.length === 1 ? '' : 's'}
          </div>
          {items.length === 0 ? (
            <p className="text-sm" style={{ color: '#6B6259' }}>Photos for this story will appear here soon.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLightbox(index)}
                  className="text-left group overflow-hidden"
                  style={{ backgroundColor: '#fff', border: '1px solid #E8DFD0' }}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: '4/3', backgroundColor: '#E8DFD0' }}>
                    <img
                      src={parishImage(item.cloudinary_id || item.url, 640, 480)}
                      alt={item.alt || item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-sm font-semibold mb-1" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
                      {item.title}
                    </h2>
                    {(item.caption || item.alt) ? (
                      <p className="text-xs leading-relaxed" style={{ color: '#6B6259' }}>
                        {item.caption || item.alt}
                      </p>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightbox !== null && items[lightbox] ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(12,3,6,0.92)' }}
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <img
              src={parishImage(items[lightbox].cloudinary_id || items[lightbox].url, 1400, 900)}
              alt={items[lightbox].alt || items[lightbox].title}
              className="w-full max-h-[75vh] object-contain"
            />
            <div className="mt-4 text-center">
              <p className="text-white font-semibold" style={{ fontFamily: "'Lora', serif" }}>{items[lightbox].title}</p>
              {(items[lightbox].caption || items[lightbox].alt) ? (
                <p className="text-sm mt-1" style={{ color: 'rgba(240,232,216,0.75)' }}>
                  {items[lightbox].caption || items[lightbox].alt}
                </p>
              ) : null}
              <div className="flex justify-center gap-3 mt-4">
                <button
                  type="button"
                  disabled={lightbox === 0}
                  onClick={() => setLightbox(i => (i === null ? null : Math.max(0, i - 1)))}
                  className="px-4 py-2 text-xs tracking-widest uppercase disabled:opacity-30"
                  style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace", background: 'none', border: '1px solid rgba(232,184,75,0.4)' }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="px-4 py-2 text-xs tracking-widest uppercase"
                  style={{ color: '#F0E8D8', fontFamily: "'DM Mono', monospace", background: 'none', border: '1px solid rgba(255,255,255,0.25)' }}
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={lightbox >= items.length - 1}
                  onClick={() => setLightbox(i => (i === null ? null : Math.min(items.length - 1, i + 1)))}
                  className="px-4 py-2 text-xs tracking-widest uppercase disabled:opacity-30"
                  style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace", background: 'none', border: '1px solid rgba(232,184,75,0.4)' }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
