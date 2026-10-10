import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { type Section } from '../../data/blog'
import { fetchStaffPost, saveStaffPost, slugify } from '../../lib/cms'
import { parishImage } from '../../lib/media'
import ArticleBodyEditor, { estimateReadTime, normalizeSections } from '../../components/office/ArticleBodyEditor'
import ArticleImagePicker from '../../components/office/ArticleImagePicker'
import OfficePage, { OfficeAlert, OfficeButton } from '../../components/office/OfficePage'
import { office } from '../../components/office/officeTheme'

const CATEGORIES = [
  'Parish News',
  'Faith & Prayer',
  'Community',
  'Youth',
  'Vincentians',
  'Parish Projects',
]

type Draft = {
  slug: string
  title: string
  category: string
  author: string
  date: string
  readTime: string
  excerpt: string
  coverImg: string
  tags: string
  body: Section[]
  published: boolean
  autoReadTime: boolean
}

const empty: Draft = {
  slug: '',
  title: '',
  category: 'Parish News',
  author: 'Parish Communications',
  date: '',
  readTime: '3 min read',
  excerpt: '',
  coverImg: '',
  tags: '',
  body: [{ type: 'paragraph', content: '' }],
  published: true,
  autoReadTime: true,
}

function defaultDateLabel(): string {
  return new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export default function AdminPostForm() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const [draft, setDraft] = useState<Draft>({ ...empty, date: defaultDateLabel() })
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(isNew)
  const [slugTouched, setSlugTouched] = useState(false)

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
        body: Array.isArray(row.body) && row.body.length ? row.body : [{ type: 'paragraph', content: '' }],
        published: row.published,
        autoReadTime: false,
      })
      setSlugTouched(true)
      setLoaded(true)
    })
  }, [id, isNew])

  useEffect(() => {
    if (!draft.autoReadTime) return
    const next = estimateReadTime(draft.body)
    if (next !== draft.readTime) {
      setDraft(d => ({ ...d, readTime: next }))
    }
  }, [draft.body, draft.autoReadTime, draft.readTime])

  const onTitleChange = (title: string) => {
    setDraft(d => ({
      ...d,
      title,
      slug: slugTouched ? d.slug : slugify(title),
    }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setOk(null)

    const title = draft.title.trim()
    if (!title) {
      setError('Title is required.')
      return
    }
    const excerpt = draft.excerpt.trim()
    if (!excerpt) {
      setError('Add a short excerpt for the blog listing and homepage.')
      return
    }
    const body = normalizeSections(draft.body)
    if (!body.length) {
      setError('Add at least one paragraph, heading, quote, list, or photo to the story.')
      return
    }

    setBusy(true)
    const slug = draft.slug.trim() || slugify(title)
    const err = await saveStaffPost({
      id: isNew ? undefined : id,
      slug,
      title,
      category: draft.category.trim() || 'Parish News',
      author: draft.author.trim() || 'Parish Communications',
      date: draft.date.trim() || defaultDateLabel(),
      readTime: draft.readTime.trim() || estimateReadTime(body),
      excerpt,
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
    if (isNew) {
      navigate('/admin/posts')
      return
    }
    setOk(draft.published ? 'Article saved and live on the website.' : 'Article saved as a draft.')
  }

  if (!loaded) {
    return <p className="text-sm" style={{ color: office.mute }}>Loading article…</p>
  }

  const field = office.field
  const coverPreview = draft.coverImg ? parishImage(draft.coverImg, 640, 400) : ''

  return (
    <OfficePage
      wide
      kicker="Proclaim"
      title={isNew ? 'New article' : 'Edit article'}
      lede="Write in plain language, pick photos visually, and publish when ready — no IDs or JSON."
      back={{ to: '/admin/posts', label: 'All articles' }}
      action={
        !isNew && draft.slug ? (
          <OfficeButton to={`/blog/${draft.slug}`} variant="ghost">
            View on site
          </OfficeButton>
        ) : undefined
      }
    >
      {error ? <OfficeAlert tone="error">{error}</OfficeAlert> : null}
      {ok ? <OfficeAlert tone="ok">{ok}</OfficeAlert> : null}

      <form onSubmit={e => { void onSubmit(e) }} className="grid lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-8 space-y-6">
          <section className="p-5 sm:p-6 space-y-4" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
            <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
              Article details
            </p>
            <div>
              <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                Title
              </label>
              <input
                required
                value={draft.title}
                onChange={e => onTitleChange(e.target.value)}
                className="w-full px-3 py-3 text-base min-h-[48px]"
                style={{ ...field, fontFamily: "'Lora', serif", fontWeight: 600 }}
                placeholder="A clear headline for the parish family"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                Short excerpt
              </label>
              <textarea
                required
                rows={3}
                value={draft.excerpt}
                onChange={e => setDraft(d => ({ ...d, excerpt: e.target.value }))}
                className="w-full px-3 py-3 text-sm"
                style={field}
                placeholder="One or two sentences shown on the blog listing and homepage"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                  Category
                </label>
                <input
                  list="article-categories"
                  value={draft.category}
                  onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
                  className="w-full px-3 py-3 text-sm min-h-[44px]"
                  style={field}
                />
                <datalist id="article-categories">
                  {CATEGORIES.map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                  Date label
                </label>
                <input
                  required
                  value={draft.date}
                  onChange={e => setDraft(d => ({ ...d, date: e.target.value }))}
                  placeholder="September 2026"
                  className="w-full px-3 py-3 text-sm min-h-[44px]"
                  style={field}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                  Author
                </label>
                <input
                  value={draft.author}
                  onChange={e => setDraft(d => ({ ...d, author: e.target.value }))}
                  className="w-full px-3 py-3 text-sm min-h-[44px]"
                  style={field}
                />
              </div>
              <div>
                <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                  Read time
                </label>
                <input
                  value={draft.readTime}
                  onChange={e => setDraft(d => ({ ...d, readTime: e.target.value, autoReadTime: false }))}
                  className="w-full px-3 py-3 text-sm min-h-[44px]"
                  style={field}
                />
                <label className="flex items-center gap-2 text-xs mt-2" style={{ color: office.mute }}>
                  <input
                    type="checkbox"
                    checked={draft.autoReadTime}
                    onChange={e => setDraft(d => ({ ...d, autoReadTime: e.target.checked }))}
                  />
                  Estimate automatically from the story
                </label>
              </div>
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                Tags
              </label>
              <input
                value={draft.tags}
                onChange={e => setDraft(d => ({ ...d, tags: e.target.value }))}
                placeholder="Construction, Youth, Prayer"
                className="w-full px-3 py-3 text-sm min-h-[44px]"
                style={field}
              />
              <p className="text-xs mt-1" style={{ color: office.mute }}>Separate tags with commas</p>
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                Web address (slug)
              </label>
              <input
                value={draft.slug}
                onChange={e => {
                  setSlugTouched(true)
                  setDraft(d => ({ ...d, slug: e.target.value }))
                }}
                placeholder="auto from title"
                className="w-full px-3 py-3 text-sm min-h-[44px]"
                style={field}
              />
              <p className="text-xs mt-1" style={{ color: office.mute }}>
                Appears as /blog/{draft.slug || 'your-title'}
              </p>
            </div>
          </section>

          <section className="p-5 sm:p-6" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
            <ArticleImagePicker
              value={draft.coverImg}
              onChange={coverImg => setDraft(d => ({ ...d, coverImg }))}
              label="Cover photo"
              hint="Shown on the blog listing, homepage highlights, and the top of the article."
              disabled={busy}
            />
          </section>

          <section className="p-5 sm:p-6" style={{ backgroundColor: '#FAF6F0', border: `1px solid ${office.line}` }}>
            <ArticleBodyEditor
              sections={draft.body}
              onChange={body => setDraft(d => ({ ...d, body }))}
              disabled={busy}
            />
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-6 self-start">
          <div className="p-5 space-y-4" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
            <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
              Publish
            </p>
            <label className="flex items-start gap-3 text-sm" style={{ color: '#4A3A30' }}>
              <input
                type="checkbox"
                className="mt-1"
                checked={draft.published}
                onChange={e => setDraft(d => ({ ...d, published: e.target.checked }))}
              />
              <span>
                <span className="font-semibold block" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
                  {draft.published ? 'Published' : 'Save as draft'}
                </span>
                <span className="text-xs" style={{ color: office.mute }}>
                  {draft.published
                    ? 'Visible on the blog and homepage when saved.'
                    : 'Hidden from the public site until you publish.'}
                </span>
              </span>
            </label>
            <OfficeButton type="submit" disabled={busy}>
              {busy ? 'Saving…' : isNew ? 'Create article' : 'Save changes'}
            </OfficeButton>
            <Link
              to="/admin/posts"
              className="block text-center text-[10px] tracking-widest uppercase py-2"
              style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}
            >
              Cancel
            </Link>
          </div>

          <div className="overflow-hidden" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
            <div className="p-4" style={{ borderBottom: `1px solid ${office.line}` }}>
              <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
                Card preview
              </p>
            </div>
            <div className="relative" style={{ aspectRatio: '16/10', backgroundColor: '#E8DFD0' }}>
              {coverPreview ? (
                <img src={coverPreview} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="p-4 space-y-2">
              <p className="text-[10px] tracking-widest uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
                {draft.category || 'Category'} · {draft.readTime || '—'}
              </p>
              <h3 className="text-lg font-semibold leading-snug" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
                {draft.title || 'Article title'}
              </h3>
              <p className="text-sm leading-relaxed line-clamp-3" style={{ color: office.mute }}>
                {draft.excerpt || 'Your excerpt will appear here.'}
              </p>
            </div>
          </div>
        </aside>
      </form>
    </OfficePage>
  )
}
