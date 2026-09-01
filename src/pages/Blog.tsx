import { useState } from 'react'
import { Link } from 'react-router'
import { useSEO } from '../hooks/useSEO'
import { usePublishedPosts } from '../hooks/usePublishedPosts'
import { parishImage } from '../lib/media'

export default function Blog() {
  useSEO({ title: 'Blog & News', description: 'Stories, reflections, and news from St. Theresa Parish, Kalimoni — parish life, community celebrations, faith formation, and more.', path: '/blog' })
  const { posts } = usePublishedPosts()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const allCats = ['All', ...Array.from(new Set(posts.map(p => p.category)))]
  const featured = posts[0]

  const filtered = posts.filter(p => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory
    const q = search.toLowerCase()
    const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q))
    return matchesCat && matchesSearch
  })

  return (
    <div>
      {/* HERO */}
      <div className="pt-16 sm:pt-20 px-3 sm:px-5 lg:px-8" style={{ backgroundColor: '#FAF6F0' }}>
      <section
        className="hero-section relative rounded-2xl overflow-hidden pt-12 sm:pt-14 pb-14 sm:pb-20 px-6 sm:px-10 lg:px-16"
        style={{ background: 'linear-gradient(135deg, #4A1019 0%, #6B1A2A 60%, #8B3A1A 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Parish Blog</div>
          <h1
            className="font-bold text-white mb-4"
            style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.15 }}
          >
            Stories of Faith,<br />
            <em className="not-italic" style={{ color: '#E8B84B' }}>Service & Community</em>
          </h1>
          <p className="text-sm sm:text-base max-w-xl leading-relaxed mb-8" style={{ color: '#F0E8D8AA' }}>
            News, reflections, and stories from the heart of St. Theresa Parish, Kalimoni —
            for our community here and our friends around the world.
          </p>
          {/* Search */}
          <div className="relative max-w-md">
            <input
              type="search"
              placeholder="Search posts, topics, tags…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(200,146,42,0.35)',
                color: '#F0E8D8',
                fontFamily: "'Inter', sans-serif",
                outline: 'none',
              }}
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" width="16" height="16" fill="none" stroke="#C8922A" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
          </div>
        </div>
      </section>
      </div>

      {/* featured POST */}
      {!search && activeCategory === 'All' && featured && (
        <section className="px-4 sm:px-6 md:px-10 lg:px-16 -mt-1" style={{ backgroundColor: '#FAF6F0' }}>
          <div className="max-w-6xl mx-auto">
            <Link
              to={`/blog/${featured.slug}`}
              className="group flex flex-col lg:flex-row overflow-hidden transition-transform hover:-translate-y-0.5 duration-300"
              style={{ marginTop: '2.5rem', backgroundColor: '#F0E8D8' }}
            >
              <div className="w-full lg:w-1/2 overflow-hidden" style={{ minHeight: 260 }}>
                <img
                  src={parishImage(featured.coverImg, 800, 500)}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ minHeight: 260 }}
                />
              </div>
              <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span
                      className="px-2.5 py-1 text-xs font-semibold tracking-widest uppercase"
                      style={{ backgroundColor: '#6B1A2A', color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}
                    >
                      Featured
                    </span>
                    <span className="text-xs tracking-wide" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
                      {featured.category}
                    </span>
                  </div>
                  <h2
                    className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 group-hover:text-burgundy transition-colors leading-tight"
                    style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}
                  >
                    {featured.title}
                  </h2>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: '#4A3A30' }}>
                    {featured.excerpt}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs" style={{ color: '#6B6259', fontFamily: "'DM Mono', monospace" }}>
                    {featured.date} · {featured.readTime}
                  </div>
                  <span
                    className="text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-colors group-hover:text-gold"
                    style={{ color: '#C8922A', fontFamily: "'Inter', sans-serif" }}
                  >
                    Read More →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* CATEGORY FILTER + GRID */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-6xl mx-auto">
          {/* Filters row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 sm:mb-10">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap flex-shrink-0">
              {allCats.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="flex-shrink-0 px-3 sm:px-4 py-2 text-xs tracking-wide transition-all duration-200 min-h-[38px]"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    backgroundColor: activeCategory === cat ? '#6B1A2A' : '#F0E8D8',
                    color: activeCategory === cat ? '#E8B84B' : '#6B6259',
                    border: activeCategory === cat ? 'none' : '1px solid #D0C4B0',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="text-xs ml-auto" style={{ color: '#8A7A70', fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap' }}>
              {filtered.length} post{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Post grid */}
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4 opacity-20" style={{ color: '#C8922A' }}>✦</div>
              <p className="text-sm" style={{ color: '#8A7A70' }}>No posts match your search. Try different keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map(post => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden transition-transform hover:-translate-y-1 duration-300"
                  style={{ backgroundColor: '#F0E8D8' }}
                >
                  {/* Cover */}
                  <div className="overflow-hidden" style={{ height: 200 }}>
                    <img
                      src={parishImage(post.coverImg, 600, 350)}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundColor: '#D0C4B0' }}
                      loading="lazy"
                    />
                  </div>
                  {/* Content */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs tracking-widest uppercase" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
                        {post.category}
                      </span>
                    </div>
                    <h3
                      className="text-base sm:text-lg font-bold leading-snug mb-3 group-hover:underline decoration-gold underline-offset-2 transition-all"
                      style={{ fontFamily: "'Lora', serif", color: '#4A1019', textDecorationColor: '#C8922A' }}
                    >
                      {post.title}
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed mb-4 flex-1" style={{ color: '#6B6259' }}>
                      {post.excerpt.length > 120 ? post.excerpt.slice(0, 120) + '…' : post.excerpt}
                    </p>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {post.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[10px] tracking-wide"
                          style={{ backgroundColor: '#FAF6F0', color: '#8A7A70', border: '1px solid #D0C4B0', fontFamily: "'DM Mono', monospace" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#D0C4B0' }}>
                      <span className="text-xs" style={{ color: '#8A7A70', fontFamily: "'DM Mono', monospace" }}>
                        {post.date} · {post.readTime}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: '#C8922A', fontFamily: "'Inter', sans-serif" }}>
                        Read →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
