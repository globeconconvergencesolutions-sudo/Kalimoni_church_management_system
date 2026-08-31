import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router'
import { type Section, type BlogPost } from '../data/blog'
import { useSEO } from '../hooks/useSEO'
import { fetchPublishedPost, fetchPublishedPosts } from '../lib/cms'

function renderSection(section: Section, i: number) {
  switch (section.type) {
    case 'paragraph':
      return (
        <p key={i} className="text-base leading-[1.85] mb-6" style={{ color: '#3A2820' }}>
          {section.content}
        </p>
      )
    case 'heading':
      return (
        <h2
          key={i}
          className="text-xl sm:text-2xl font-bold mt-10 mb-4"
          style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}
        >
          {section.content}
        </h2>
      )
    case 'quote':
      return (
        <blockquote
          key={i}
          className="my-8 pl-5 sm:pl-6 py-2 border-l-4 italic text-base sm:text-lg leading-relaxed"
          style={{
            borderColor: '#C8922A',
            color: '#6B1A2A',
            backgroundColor: '#F0E8D8',
            fontFamily: "'Lora', serif",
            padding: '1rem 1.5rem',
          }}
        >
          {section.content}
        </blockquote>
      )
    case 'image':
      return (
        <figure key={i} className="my-8">
          <img
            src={`https://images.unsplash.com/${section.src}?w=900&h=500&fit=crop&auto=format`}
            alt={section.alt}
            className="w-full object-cover"
            style={{ maxHeight: 420, backgroundColor: '#D0C4B0' }}
          />
          {section.caption && (
            <figcaption
              className="mt-2 text-xs text-center"
              style={{ color: '#8A7A70', fontFamily: "'DM Mono', monospace" }}
            >
              {section.caption}
            </figcaption>
          )}
        </figure>
      )
    case 'list':
      return (
        <ul key={i} className="my-6 flex flex-col gap-2.5">
          {section.items?.map((item, j) => (
            <li key={j} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: '#3A2820' }}>
              <span className="mt-1 shrink-0" style={{ color: '#C8922A' }}>✦</span>
              {item}
            </li>
          ))}
        </ul>
      )
    default:
      return null
  }
}

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined)
  const [all, setAll] = useState<BlogPost[]>([])

  useEffect(() => {
    void Promise.all([fetchPublishedPost(slug ?? ''), fetchPublishedPosts()]).then(([found, list]) => {
      setPost(found ?? null)
      setAll(list.posts)
    })
  }, [slug])

  useSEO({
    title: post?.title ?? 'Article',
    description: post?.excerpt ?? 'Parish news from St. Theresa Parish, Kalimoni.',
    path: `/blog/${slug ?? ''}`,
  })

  if (post === undefined) {
    return (
      <div className="px-6 py-32 text-center text-sm" style={{ color: '#6B6259' }}>Loading article…</div>
    )
  }
  if (!post) return <Navigate to="/blog" replace />

  const related = all.filter(p => p.slug !== post.slug && p.category === post.category).slice(0, 2)
  const others = all.filter(p => p.slug !== post.slug && !related.find(r => r.slug === p.slug)).slice(0, 2 - related.length)
  const suggestions = [...related, ...others].slice(0, 2)

  return (
    <div>
      {/* HERO */}
      <div
        className="relative pt-24 sm:pt-28 md:pt-32 pb-0 overflow-hidden"
        style={{ backgroundColor: '#1C1A18' }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(https://images.unsplash.com/${post.coverImg}?w=1400&h=600&fit=crop&auto=format)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'saturate(0.7)',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(28,26,24,0.6) 0%, #1C1A18 100%)' }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 md:px-10 pb-12 sm:pb-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: '#8A7A70', fontFamily: "'DM Mono', monospace" }}>
            <Link to="/" className="hover:text-gold transition-colors" style={{ color: '#8A7A70' }}>Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-gold transition-colors" style={{ color: '#8A7A70' }}>Blog</Link>
            <span>/</span>
            <span style={{ color: '#C8922A' }} className="truncate max-w-[180px]">{post.title}</span>
          </nav>

          {/* Category badge */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className="px-3 py-1 text-xs font-bold tracking-widest uppercase"
              style={{ backgroundColor: '#C8922A', color: '#FAF6F0', fontFamily: "'DM Mono', monospace" }}
            >
              {post.category}
            </span>
            <span className="text-xs" style={{ color: '#F0E8D8AA', fontFamily: "'DM Mono', monospace" }}>
              {post.date} · {post.readTime}
            </span>
          </div>

          <h1
            className="font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.75rem, 5vw, 3rem)' }}
          >
            {post.title}
          </h1>

          <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: '#F0E8D8AA' }}>
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs pb-8" style={{ color: '#8A7A70', fontFamily: "'DM Mono', monospace" }}>
            <span>By {post.author}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </div>

      {/* ARTICLE BODY */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 md:px-10 lg:px-16" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 xl:gap-16 items-start">

          {/* Main content */}
          <article className="w-full lg:flex-1 min-w-0">
            <div className="prose max-w-none">
              {post.body.map((section, i) => renderSection(section, i))}
            </div>

            {/* Tags */}
            <div className="mt-10 pt-6 border-t" style={{ borderColor: '#E0D4C0' }}>
              <div className="text-xs tracking-widest uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Tags</div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 text-xs tracking-wide"
                    style={{ backgroundColor: '#F0E8D8', color: '#6B6259', border: '1px solid #D0C4B0', fontFamily: "'DM Mono', monospace" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Nav buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/blog"
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all hover:opacity-80 min-h-[48px]"
                style={{ backgroundColor: '#F0E8D8', color: '#4A1019', border: '1px solid #D0C4B0', fontFamily: "'Inter', sans-serif" }}
              >
                ← All Posts
              </Link>
              <Link
                to="/donate"
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all hover:brightness-110 min-h-[48px]"
                style={{ backgroundColor: '#6B1A2A', color: '#F0E8D8', fontFamily: "'Inter', sans-serif" }}
              >
                Support the Parish ♡
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-5">
            {/* About the parish */}
            <div className="p-5 sm:p-6" style={{ backgroundColor: '#6B1A2A' }}>
              <div className="text-xs tracking-widest uppercase mb-3" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>About the Parish</div>
              <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Lora', serif" }}>St. Theresa Parish, Kalimoni</h3>
              <p className="text-xs leading-relaxed mb-4" style={{ color: '#F0E8D8AA' }}>
                Located in Juja, Kiambu County, Kenya — serving the faithful since 1912 through the Vincentian Congregation and HHCJ Sisters.
              </p>
              <Link
                to="/about"
                className="text-xs font-semibold tracking-wide"
                style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}
              >
                Learn More →
              </Link>
            </div>

            {/* Suggested posts */}
            {suggestions.length > 0 && (
              <div className="p-5 sm:p-6" style={{ backgroundColor: '#F0E8D8' }}>
                <div className="text-xs tracking-widest uppercase mb-4" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>More Posts</div>
                <div className="flex flex-col gap-4">
                  {suggestions.map(s => (
                    <Link
                      key={s.slug}
                      to={`/blog/${s.slug}`}
                      className="group flex gap-3 items-start"
                    >
                      <img
                        src={`https://images.unsplash.com/${s.coverImg}?w=120&h=80&fit=crop&auto=format`}
                        alt={s.title}
                        className="shrink-0 object-cover"
                        style={{ width: 72, height: 52, backgroundColor: '#D0C4B0' }}
                      />
                      <div>
                        <div className="text-[10px] tracking-widest uppercase mb-1" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>{s.category}</div>
                        <h4 className="text-xs font-bold leading-snug group-hover:underline" style={{ fontFamily: "'Lora', serif", color: '#4A1019', textDecorationColor: '#C8922A' }}>
                          {s.title.length > 60 ? s.title.slice(0, 60) + '…' : s.title}
                        </h4>
                        <div className="text-[10px] mt-1" style={{ color: '#8A7A70', fontFamily: "'DM Mono', monospace" }}>{s.date}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Donate CTA */}
            <div
              className="p-5 sm:p-6"
              style={{ backgroundColor: '#4A3A10' }}
            >
              <div className="text-xs tracking-widest uppercase mb-3" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>Support the Mission</div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: '#F0E8D8AA' }}>
                Every story shared here is made possible by a community that gives. Support our health, education, and charity work.
              </p>
              <Link
                to="/donate"
                className="block text-center py-3 text-xs font-bold tracking-widest uppercase min-h-[44px] flex items-center justify-center"
                style={{ backgroundColor: '#C8922A', color: '#FAF6F0', fontFamily: "'DM Mono', monospace" }}
              >
                Give Today
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
