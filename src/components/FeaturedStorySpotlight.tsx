import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { fetchFeaturedAlbum, type MediaAlbumWithCover } from '../lib/mediaAlbums'
import { parishImage } from '../lib/media'

export default function FeaturedStorySpotlight() {
  const [album, setAlbum] = useState<MediaAlbumWithCover | null>(null)

  useEffect(() => {
    void fetchFeaturedAlbum().then(setAlbum)
  }, [])

  if (!album) return null

  const cover = album.cover
    ? parishImage(album.cover.cloudinary_id || album.cover.url, 1200, 800)
    : ''

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="relative overflow-hidden order-2 lg:order-1" style={{ aspectRatio: '5/4', backgroundColor: '#E8DFD0' }}>
          {cover ? (
            <img src={cover} alt={album.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : null}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,8,15,0.45) 0%, transparent 55%)' }} />
          <span
            className="absolute top-4 left-4 text-[9px] tracking-[0.22em] uppercase px-2.5 py-1"
            style={{ backgroundColor: 'rgba(74,16,25,0.9)', color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}
          >
            {album.category}
          </span>
        </div>
        <div className="order-1 lg:order-2">
          <div className="text-[10px] tracking-[0.28em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
            Featured progress
          </div>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}
          >
            {album.title}
          </h2>
          {album.summary ? (
            <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: '#6B6259' }}>
              {album.summary}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/stories/${album.slug}`}
              className="inline-flex items-center px-6 py-3 text-sm font-semibold min-h-[48px]"
              style={{ backgroundColor: '#6B1A2A', color: '#FAF6F0', fontFamily: "'Lora', serif" }}
            >
              See the photos
            </Link>
            {album.related_post_slug ? (
              <Link
                to={`/blog/${album.related_post_slug}`}
                className="inline-flex items-center px-6 py-3 text-sm font-semibold min-h-[48px]"
                style={{ border: '1px solid #C8922A', color: '#6B1A2A', fontFamily: "'Lora', serif" }}
              >
                Read the story
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
