import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { type BlogPost } from '../../data/blog'
import { fetchStaffPost, saveStaffPost, slugify } from '../../lib/cms'
import OfficePage, { OfficeAlert, OfficeButton } from '../../components/office/OfficePage'
import { office } from '../../components/office/officeTheme'

const empty = {
  slug: '',
  title: '',
  category: 'Parish News',
  author: 'Parish Communications',
  date: '',
  readTime: '4 min read',
  excerpt: '',
  coverImg: '',
  tags: '',
  bodyText: '[]',
  published: true,
}

export default function AdminPostForm() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const [draft, setDraft] = useState(empty)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(isNew)

  useEffect(() => {
    if (isNew || !id) return
    void fetchStaffPost(id).then(row => {
      if (!row) {
        setError('Article not found.')
        setLoaded(true)
        return
      }
      setDraft({
        slug: row.slug,
        title: row.title,
        category: row.category,
        author: row.author,
        date: row.date,
        readTime: row.readTime,
        excerpt: row.excerpt,
        coverImg: row.coverImg,
        tags: row.tags.join(', '),
        bodyText: JSON.stringify(row.body, null, 2),
        published: row.published,
      })
      setLoaded(true)
    })
  }, [id, isNew])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    let body: BlogPost['body']
    try {
      body = JSON.parse(draft.bodyText) as BlogPost['body']
      if (!Array.isArray(body)) throw new Error('Body must be a JSON array.')
    } catch {
      setError('Article body must be valid JSON (an array of sections).')
      return
    }

    setBusy(true)
    const slug = draft.slug.trim() || slugify(draft.title)
    const err = await saveStaffPost({
      id: isNew ? undefined : id,
      slug,
      title: draft.title.trim(),
      category: draft.category.trim(),
      author: draft.author.trim(),
      date: draft.date.trim(),
      readTime: draft.readTime.trim(),
      excerpt: draft.excerpt.trim(),
      coverImg: draft.coverImg.trim(),
      tags: draft.tags.split(',').map(t => t.trim()).filter(Boolean),
      body,
      published: draft.published,
    })
    setBusy(false)
    if (err) {
      setError(err)
      return
    }
    navigate('/admin/posts')
  }

  if (!loaded) {
    return <p className="text-sm" style={{ color: office.mute }}>Loading article…</p>
  }

  const field = office.field

  return (
    <OfficePage
      kicker="Proclaim"
      title={isNew ? 'New article' : 'Edit article'}
      lede="Stories for the homepage highlights and the parish blog."
      back={{ to: '/admin/posts', label: 'All articles' }}
    >
      <form onSubmit={e => { void onSubmit(e) }} className="flex flex-col gap-4 max-w-2xl">
        <label className="text-xs" style={{ color: '#6B6259' }}>Title</label>
        <input required value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} className="px-3 py-3 text-sm min-h-[44px]" style={field} />
        <label className="text-xs" style={{ color: '#6B6259' }}>URL slug</label>
        <input value={draft.slug} onChange={e => setDraft(d => ({ ...d, slug: e.target.value }))} placeholder="auto from title if empty" className="px-3 py-3 text-sm min-h-[44px]" style={field} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs block mb-1" style={{ color: '#6B6259' }}>Category</label>
            <input value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))} className="w-full px-3 py-3 text-sm min-h-[44px]" style={field} />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: '#6B6259' }}>Date label</label>
            <input required value={draft.date} onChange={e => setDraft(d => ({ ...d, date: e.target.value }))} placeholder="December 2024" className="w-full px-3 py-3 text-sm min-h-[44px]" style={field} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs block mb-1" style={{ color: '#6B6259' }}>Author</label>
            <input value={draft.author} onChange={e => setDraft(d => ({ ...d, author: e.target.value }))} className="w-full px-3 py-3 text-sm min-h-[44px]" style={field} />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: '#6B6259' }}>Read time</label>
            <input value={draft.readTime} onChange={e => setDraft(d => ({ ...d, readTime: e.target.value }))} className="w-full px-3 py-3 text-sm min-h-[44px]" style={field} />
          </div>
        </div>
        <label className="text-xs" style={{ color: '#6B6259' }}>Excerpt</label>
        <textarea required rows={3} value={draft.excerpt} onChange={e => setDraft(d => ({ ...d, excerpt: e.target.value }))} className="px-3 py-3 text-sm" style={field} />
        <label className="text-xs" style={{ color: '#6B6259' }}>Cover image (Unsplash photo id)</label>
        <input value={draft.coverImg} onChange={e => setDraft(d => ({ ...d, coverImg: e.target.value }))} placeholder="photo-1633368516160-feaa83f981dd" className="px-3 py-3 text-sm min-h-[44px]" style={field} />
        <label className="text-xs" style={{ color: '#6B6259' }}>Tags (comma separated)</label>
        <input value={draft.tags} onChange={e => setDraft(d => ({ ...d, tags: e.target.value }))} className="px-3 py-3 text-sm min-h-[44px]" style={field} />
        <label className="text-xs" style={{ color: '#6B6259' }}>Body JSON</label>
        <textarea rows={10} value={draft.bodyText} onChange={e => setDraft(d => ({ ...d, bodyText: e.target.value }))} className="px-3 py-3 text-xs font-mono" style={field} />
        <label className="flex items-center gap-2 text-sm" style={{ color: '#4A3A30' }}>
          <input type="checkbox" checked={draft.published} onChange={e => setDraft(d => ({ ...d, published: e.target.checked }))} />
          Published on the parish website
        </label>
        {error ? <OfficeAlert>{error}</OfficeAlert> : null}
        <OfficeButton type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save article'}
        </OfficeButton>
      </form>
    </OfficePage>
  )
}
