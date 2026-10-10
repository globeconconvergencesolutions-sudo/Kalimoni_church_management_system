import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { deleteStaffPost, fetchStaffPosts, saveStaffPost, type StaffPost } from '../../lib/cms'
import { parishImage } from '../../lib/media'
import OfficePage, { OfficeAlert, OfficeButton } from '../../components/office/OfficePage'
import { useOfficeConfirm } from '../../components/office/useOfficeConfirm'
import { office } from '../../components/office/officeTheme'

export default function AdminPosts() {
  const { confirm, dialog: confirmDialog } = useOfficeConfirm()
  const [posts, setPosts] = useState<StaffPost[]>([])
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')

  const load = async () => {
    const result = await fetchStaffPosts()
    setPosts(result.posts)
    setError(result.error)
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    return posts.filter(p => {
      if (filter === 'published' && !p.published) return false
      if (filter === 'draft' && p.published) return false
      if (!query.trim()) return true
      const q = query.trim().toLowerCase()
      return [p.title, p.excerpt, p.category, p.author, p.slug, ...(p.tags || [])]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [posts, filter, query])

  const onTogglePublish = async (post: StaffPost) => {
    setBusyId(post.id)
    setError(null)
    setOk(null)
    const err = await saveStaffPost({
      id: post.id,
      slug: post.slug,
      title: post.title,
      category: post.category,
      author: post.author,
      date: post.date,
      readTime: post.readTime,
      excerpt: post.excerpt,
      coverImg: post.coverImg,
      tags: post.tags,
      body: post.body,
      published: !post.published,
    })
    setBusyId(null)
    if (err) {
      setError(err)
      return
    }
    setOk(post.published ? 'Article unpublished.' : 'Article published.')
    await load()
  }

  const onDelete = async (post: StaffPost) => {
    const okConfirm = await confirm({
      title: 'Remove this article?',
      description: `"${post.title}" will be deleted from the parish website. This cannot be undone.`,
      confirmLabel: 'Remove',
      tone: 'danger',
    })
    if (!okConfirm) return
    setBusyId(post.id)
    setError(null)
    setOk(null)
    const err = await deleteStaffPost(post.id)
    setBusyId(null)
    if (err) {
      setError(err)
      return
    }
    setOk('Article removed.')
    await load()
  }

  const liveCount = posts.filter(p => p.published).length

  return (
    <OfficePage
      wide
      kicker="Proclaim"
      title="News & stories"
      lede="Write and edit parish articles with photos — no technical IDs or JSON required."
      action={<OfficeButton to="/admin/posts/new">New article</OfficeButton>}
    >
      {confirmDialog}
      {error ? <OfficeAlert tone="error">{error}</OfficeAlert> : null}
      {ok ? <OfficeAlert tone="ok">{ok}</OfficeAlert> : null}

      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
        <div className="flex-1">
          <p className="text-xs mb-2" style={{ color: office.mute }}>
            {posts.length} article{posts.length === 1 ? '' : 's'} · {liveCount} live
          </p>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search title, category, tags…"
            className="w-full px-3 py-3 text-sm min-h-[44px]"
            style={office.field}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            ['all', 'All'],
            ['published', 'Live'],
            ['draft', 'Drafts'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className="px-3.5 py-2.5 text-[10px] tracking-widest uppercase min-h-[44px]"
              style={{
                fontFamily: "'DM Mono', monospace",
                backgroundColor: filter === key ? office.wine : '#fff',
                color: filter === key ? '#FAF6F0' : office.mute,
                border: `1px solid ${filter === key ? office.wine : office.line}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {posts.length === 0 && !error ? (
        <div className="p-10 text-center" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
          <p className="text-sm mb-4" style={{ color: office.mute }}>
            No articles yet. Write the first story for the parish blog.
          </p>
          <OfficeButton to="/admin/posts/new">New article</OfficeButton>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm" style={{ color: office.mute }}>No articles match this search.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => (
            <article
              key={p.id}
              className="overflow-hidden flex flex-col"
              style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}
            >
              <div className="relative" style={{ aspectRatio: '16/10', backgroundColor: '#E8DFD0' }}>
                {p.coverImg ? (
                  <img
                    src={parishImage(p.coverImg, 720, 450)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : null}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span
                    className="text-[9px] tracking-widest uppercase px-2 py-0.5"
                    style={{
                      backgroundColor: p.published ? 'rgba(42,107,58,0.92)' : 'rgba(28,26,24,0.65)',
                      color: '#FAF6F0',
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {p.published ? 'Live' : 'Draft'}
                  </span>
                  <span
                    className="text-[9px] tracking-widest uppercase px-2 py-0.5"
                    style={{ backgroundColor: 'rgba(74,16,25,0.88)', color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}
                  >
                    {p.category}
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex-1">
                  <h2 className="font-semibold text-lg leading-snug" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
                    {p.title}
                  </h2>
                  <p className="text-[10px] tracking-widest uppercase mt-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                    {p.date} · {p.readTime}
                  </p>
                  <p className="text-sm mt-2 line-clamp-2" style={{ color: office.mute }}>{p.excerpt}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/admin/posts/${p.id}`}
                    className="px-3 py-2 text-[10px] uppercase tracking-widest min-h-[40px] inline-flex items-center"
                    style={{ border: `1px solid ${office.gold}`, color: office.wine, fontFamily: "'DM Mono', monospace", background: '#fff' }}
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/blog/${p.slug}`}
                    className="px-3 py-2 text-[10px] uppercase tracking-widest min-h-[40px] inline-flex items-center"
                    style={{ border: `1px solid ${office.line}`, color: office.mute, fontFamily: "'DM Mono', monospace", background: '#FAF6F0' }}
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    onClick={() => { void onTogglePublish(p) }}
                    className="px-3 py-2 text-[10px] uppercase tracking-widest min-h-[40px]"
                    style={{ border: `1px solid ${office.gold}`, color: office.wine, fontFamily: "'DM Mono', monospace", background: '#fff' }}
                  >
                    {p.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    onClick={() => { void onDelete(p) }}
                    className="px-3 py-2 text-[10px] uppercase tracking-widest min-h-[40px]"
                    style={{ color: office.wine, fontFamily: "'DM Mono', monospace", background: 'none', border: 'none' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </OfficePage>
  )
}
