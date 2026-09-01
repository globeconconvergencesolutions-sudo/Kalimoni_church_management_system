import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { deleteStaffPost, fetchStaffPosts, type StaffPost } from '../../lib/cms'
import OfficePage, { OfficeAlert, OfficeButton } from '../../components/office/OfficePage'

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
    <OfficePage
      kicker="Proclaim"
      title="News & stories"
      lede="Articles appear on the homepage highlights and in the parish blog."
      action={<OfficeButton to="/admin/posts/new">New article</OfficeButton>}
    >
      {error ? <OfficeAlert>{error}</OfficeAlert> : null}

      {posts.length === 0 && !error ? (
        <p className="text-sm" style={{ color: '#6B6259' }}>
          No articles yet. Write the first story for the parish blog.
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
    </OfficePage>
  )
}
