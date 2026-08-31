import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { deleteStaffPost, fetchStaffPosts, type StaffPost } from '../../lib/cms'

export default function AdminPosts() {
  const [posts, setPosts] = useState<StaffPost[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    const result = await fetchStaffPosts()
    setPosts(result.posts)
    setError(result.error)
  }

  useEffect(() => {
    void load()
  }, [])

  const onDelete = async (id: string) => {
    if (!window.confirm('Remove this article from the website?')) return
    setBusyId(id)
    const err = await deleteStaffPost(id)
    setBusyId(null)
    if (err) {
      setError(err)
      return
    }
    await load()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
            Sprint 2
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
            News & stories
          </h1>
          <p className="text-sm mt-2 max-w-xl" style={{ color: '#6B6259' }}>
            Published articles appear on the home highlights, /blog, and each article page.
            Import prototype copy first if this list is empty.
          </p>
        </div>
        <Link
          to="/admin/posts/new"
          className="px-4 py-3 text-sm font-semibold shrink-0 min-h-[44px] flex items-center"
          style={{ backgroundColor: '#6B1A2A', color: '#FAF6F0' }}
        >
          New article
        </Link>
      </div>

      {error ? (
        <div className="p-4 mb-6 text-sm" style={{ backgroundColor: '#F0E8D8', color: '#6B1A2A' }}>
          {error}
        </div>
      ) : null}

      {posts.length === 0 && !error ? (
        <p className="text-sm" style={{ color: '#6B6259' }}>
          No articles in the database yet. Open Content and import the prototype, or write a new article.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map(p => (
            <div
              key={p.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
              style={{ backgroundColor: '#fff', border: '1px solid #E8DFD0' }}
            >
              <div>
                <div className="flex flex-wrap gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: p.published ? '#2A6B3A' : '#8A7A70', fontFamily: "'DM Mono', monospace" }}>
                    {p.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
                    {p.category}
                  </span>
                </div>
                <div className="font-semibold" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>{p.title}</div>
                <p className="text-sm mt-1 line-clamp-2" style={{ color: '#6B6259' }}>{p.excerpt}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  to={`/admin/posts/${p.id}`}
                  className="px-3 py-2 text-xs uppercase tracking-widest min-h-[44px] flex items-center"
                  style={{ border: '1px solid #C8922A', color: '#6B1A2A', fontFamily: "'DM Mono', monospace" }}
                >
                  Edit
                </Link>
                <button
                  type="button"
                  disabled={busyId === p.id}
                  onClick={() => { void onDelete(p.id) }}
                  className="px-3 py-2 text-xs uppercase tracking-widest min-h-[44px]"
                  style={{ color: '#6B1A2A', fontFamily: "'DM Mono', monospace" }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
