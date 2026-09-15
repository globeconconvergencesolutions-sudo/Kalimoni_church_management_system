import { useEffect, useState, type FormEvent } from 'react'
import {
  deleteStaffAlbum,
  fetchStaffAlbum,
  fetchStaffAlbums,
  saveStaffAlbum,
  setAlbumCover,
  slugifyAlbum,
  STORY_CATEGORIES,
  type MediaAlbum,
} from '../../lib/mediaAlbums'
import { deleteStaffMedia, saveStaffMediaMeta, uploadParishMedia } from '../../lib/mediaAdmin'
import { parishImage, type ParishMedia } from '../../lib/media'
import MediaDropZone from './MediaDropZone'
import { OfficeAlert, OfficeButton } from './OfficePage'
import { office } from './officeTheme'
import { MEDIA_IMAGE_ACCEPT, mediaUploadHint } from '../../lib/mediaUploadRules'

type View = { mode: 'list' } | { mode: 'edit'; albumId: string | null }

export default function AdminStoriesPanel() {
  const [view, setView] = useState<View>({ mode: 'list' })
  const [albums, setAlbums] = useState<MediaAlbum[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const loadAlbums = async () => {
    const result = await fetchStaffAlbums()
    setAlbums(result.albums)
    if (result.error) setError(result.error)
  }

  useEffect(() => {
    void loadAlbums()
  }, [])

  useEffect(() => {
    if (!success) return
    const id = setTimeout(() => setSuccess(null), 4500)
    return () => clearTimeout(id)
  }, [success])

  if (view.mode === 'edit') {
    return (
      <AlbumEditor
        albumId={view.albumId}
        onBack={() => {
          setView({ mode: 'list' })
          void loadAlbums()
        }}
        onSaved={msg => {
          setSuccess(msg)
          void loadAlbums()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {error ? <OfficeAlert tone="error">{error}</OfficeAlert> : null}
      {success ? <OfficeAlert tone="ok">{success}</OfficeAlert> : null}

      <div
        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}
      >
        <div>
          <p className="font-semibold text-sm" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
            Photo stories
          </p>
          <p className="text-xs mt-0.5" style={{ color: office.mute }}>
            Grouped sets for construction progress, feast days, outreach — each with its own page.
          </p>
        </div>
        <OfficeButton
          type="button"
          onClick={() => {
            setError(null)
            setView({ mode: 'edit', albumId: null })
          }}
        >
          New story
        </OfficeButton>
      </div>

      {albums.length === 0 ? (
        <div className="p-12 text-center" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
          <p className="text-sm" style={{ color: office.mute }}>
            No stories yet. Create one for the church construction photos, or any future project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {albums.map(album => (
            <article
              key={album.id}
              className="p-5 flex flex-col gap-3"
              style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-base" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
                    {album.title}
                  </h3>
                  <p className="text-[10px] tracking-widest uppercase mt-1" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
                    /stories/{album.slug}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="text-[9px] tracking-widest uppercase px-2 py-0.5"
                    style={{
                      backgroundColor: album.status === 'published' ? office.wine : office.paper,
                      color: album.status === 'published' ? '#E8B84B' : office.mute,
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {album.status}
                  </span>
                  {album.featured ? (
                    <span className="text-[9px] tracking-widest uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
                      Featured
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: office.mute }}>
                {album.summary || 'No summary yet.'}
              </p>
              <p className="text-[10px]" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                {album.category}
              </p>
              <div className="flex gap-2 mt-auto pt-2">
                <OfficeButton type="button" onClick={() => setView({ mode: 'edit', albumId: album.id })}>
                  Open
                </OfficeButton>
                <OfficeButton
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    if (!window.confirm(`Delete story "${album.title}"? Photos stay in the gallery library.`)) return
                    setBusy(true)
                    void deleteStaffAlbum(album.id).then(result => {
                      setBusy(false)
                      if (!result.ok) {
                        setError(result.error)
                        return
                      }
                      setSuccess('Story deleted.')
                      void loadAlbums()
                    })
                  }}
                >
                  Delete
                </OfficeButton>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function AlbumEditor({
  albumId,
  onBack,
  onSaved,
}: {
  albumId: string | null
  onBack: () => void
  onSaved: (msg: string) => void
}) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [summary, setSummary] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<string>('Construction')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [featured, setFeatured] = useState(false)
  const [relatedPost, setRelatedPost] = useState('')
  const [id, setId] = useState<string | null>(albumId)
  const [items, setItems] = useState<ParishMedia[]>([])
  const [coverId, setCoverId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [pendingCaption, setPendingCaption] = useState('')

  const load = async (targetId: string) => {
    const result = await fetchStaffAlbum(targetId)
    if (result.error && !result.album) {
      setError(result.error)
      return
    }
    if (!result.album) return
    const a = result.album
    setId(a.id)
    setTitle(a.title)
    setSlug(a.slug)
    setSummary(a.summary)
    setBody(a.body)
    setCategory(a.category)
    setStatus(a.status)
    setFeatured(a.featured)
    setRelatedPost(a.related_post_slug || '')
    setCoverId(a.cover_media_id)
    setItems(result.items)
  }

  useEffect(() => {
    if (albumId) void load(albumId)
  }, [albumId])

  const onTitleBlur = () => {
    if (!slug.trim() && title.trim()) setSlug(slugifyAlbum(title))
  }

  const saveMeta = async (e?: FormEvent) => {
    e?.preventDefault()
    setBusy(true)
    setError(null)
    const result = await saveStaffAlbum(id, {
      title,
      slug: slug || slugifyAlbum(title),
      summary,
      body,
      category,
      status,
      featured,
      related_post_slug: relatedPost || null,
      cover_media_id: coverId,
    })
    setBusy(false)
    if (!result.ok || !result.album) {
      setError(result.error)
      return
    }
    setId(result.album.id)
    setSlug(result.album.slug)
    onSaved(id ? 'Story details saved.' : 'Story created — you can upload photos now.')
    await load(result.album.id)
  }

  const uploadSelected = async () => {
    if (!id) {
      setError('Save the story details first, then upload photos.')
      return
    }
    if (!uploadFiles.length) {
      setError('Choose at least one photo.')
      return
    }
    setBusy(true)
    setError(null)
    for (const file of uploadFiles) {
      const base = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
      const itemTitle = base ? base.charAt(0).toUpperCase() + base.slice(1) : title
      const caption = pendingCaption.trim() || itemTitle
      const result = await uploadParishMedia(file, {
        mode: 'gallery',
        title: itemTitle,
        category,
        alt: caption,
        caption,
        albumId: id,
      })
      if (!result.ok) {
        setBusy(false)
        setError(result.error)
        await load(id)
        return
      }
    }
    setUploadFiles([])
    setPendingCaption('')
    setBusy(false)
    onSaved(`${uploadFiles.length} photo${uploadFiles.length === 1 ? '' : 's'} added to the story.`)
    await load(id)
  }

  const onDropZoneFile = (file: File | null) => {
    if (!file) return
    setUploadFiles(prev => [...prev, file])
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="text-[10px] tracking-[0.2em] uppercase"
        style={{ color: office.gold, fontFamily: "'DM Mono', monospace", background: 'none', border: 'none' }}
      >
        ← All stories
      </button>

      {error ? <OfficeAlert tone="error">{error}</OfficeAlert> : null}

      <form
        onSubmit={e => { void saveMeta(e) }}
        className="p-5 sm:p-6 space-y-4"
        style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}
      >
        <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
          Story details
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] tracking-[0.18em] uppercase block mb-2" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
              Title
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={onTitleBlur}
              className="w-full px-3 py-3 text-sm min-h-[44px]"
              style={office.field}
              required
            />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.18em] uppercase block mb-2" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
              URL slug
            </label>
            <input
              value={slug}
              onChange={e => setSlug(slugifyAlbum(e.target.value))}
              className="w-full px-3 py-3 text-sm min-h-[44px]"
              style={office.field}
              placeholder="church-construction-2026"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] tracking-[0.18em] uppercase block mb-2" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
            Short summary
          </label>
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            rows={3}
            className="w-full px-3 py-3 text-sm"
            style={office.field}
            placeholder="One or two sentences for the homepage and gallery context."
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.18em] uppercase block mb-2" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
            Longer description (optional)
          </label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={4}
            className="w-full px-3 py-3 text-sm"
            style={office.field}
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] tracking-[0.18em] uppercase block mb-2" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
              Category
            </label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-3 text-sm min-h-[44px]" style={office.field}>
              {STORY_CATEGORIES.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] tracking-[0.18em] uppercase block mb-2" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
              Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'draft' | 'published')}
              className="w-full px-3 py-3 text-sm min-h-[44px]"
              style={office.field}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] tracking-[0.18em] uppercase block mb-2" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
              Related blog slug
            </label>
            <input
              value={relatedPost}
              onChange={e => setRelatedPost(e.target.value)}
              className="w-full px-3 py-3 text-sm min-h-[44px]"
              style={office.field}
              placeholder="church-construction-progress-2026"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm" style={{ color: office.burgundy }}>
          <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
          Feature on the homepage spotlight
        </label>
        <div className="flex gap-2">
          <OfficeButton type="submit" disabled={busy}>
            {busy ? 'Saving…' : id ? 'Save details' : 'Create story'}
          </OfficeButton>
        </div>
      </form>

      {id ? (
        <div className="p-5 sm:p-6 space-y-4" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
          <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
            Photos in this story
          </p>
          <MediaDropZone
            file={null}
            onFile={onDropZoneFile}
            accept={MEDIA_IMAGE_ACCEPT}
            label="Drop photos here (you can add several)"
            hint={mediaUploadHint(false)}
            disabled={busy}
            onValidationError={setError}
          />
          {uploadFiles.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: office.mute }}>
                {uploadFiles.length} file{uploadFiles.length === 1 ? '' : 's'} ready:{' '}
                {uploadFiles.map(f => f.name).join(', ')}
              </p>
              <input
                value={pendingCaption}
                onChange={e => setPendingCaption(e.target.value)}
                placeholder="Optional shared caption for this batch"
                className="w-full px-3 py-3 text-sm min-h-[44px]"
                style={office.field}
              />
              <div className="flex gap-2">
                <OfficeButton type="button" disabled={busy} onClick={() => { void uploadSelected() }}>
                  {busy ? 'Uploading…' : 'Upload to story'}
                </OfficeButton>
                <OfficeButton type="button" variant="ghost" disabled={busy} onClick={() => setUploadFiles([])}>
                  Clear queue
                </OfficeButton>
              </div>
            </div>
          ) : null}

          {items.length === 0 ? (
            <p className="text-sm" style={{ color: office.mute }}>No photos yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map(item => (
                <div key={item.id} className="overflow-hidden" style={{ border: `1px solid ${office.line}` }}>
                  <div className="relative" style={{ aspectRatio: '16/10', backgroundColor: '#E8DFD0' }}>
                    <img
                      src={parishImage(item.cloudinary_id || item.url, 480, 300)}
                      alt={item.alt || item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {coverId === item.id ? (
                      <span
                        className="absolute top-2 left-2 text-[9px] tracking-widest uppercase px-2 py-0.5"
                        style={{ backgroundColor: office.wine, color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}
                      >
                        Cover
                      </span>
                    ) : null}
                  </div>
                  <div className="p-3 space-y-2">
                    <input
                      defaultValue={item.title}
                      onBlur={e => {
                        const titleValue = e.target.value.trim()
                        if (!titleValue || titleValue === item.title) return
                        void saveStaffMediaMeta(item.id, { title: titleValue }).then(r => {
                          if (!r.ok) setError(r.error)
                          else void load(id)
                        })
                      }}
                      className="w-full px-2 py-2 text-sm"
                      style={office.field}
                    />
                    <textarea
                      defaultValue={item.caption || item.alt || ''}
                      rows={2}
                      onBlur={e => {
                        const caption = e.target.value.trim()
                        if (caption === (item.caption || item.alt || '')) return
                        void saveStaffMediaMeta(item.id, { caption, alt: caption }).then(r => {
                          if (!r.ok) setError(r.error)
                          else void load(id)
                        })
                      }}
                      className="w-full px-2 py-2 text-xs"
                      style={office.field}
                      placeholder="Short description"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="text-[10px] tracking-widest uppercase min-h-[32px] px-2"
                        style={{ color: office.wine, fontFamily: "'DM Mono', monospace", background: 'none', border: `1px solid ${office.gold}` }}
                        onClick={() => {
                          void setAlbumCover(id, item.id).then(r => {
                            if (!r.ok) setError(r.error)
                            else {
                              setCoverId(item.id)
                              onSaved('Cover image updated.')
                            }
                          })
                        }}
                      >
                        Set cover
                      </button>
                      <button
                        type="button"
                        className="text-[10px] tracking-widest uppercase min-h-[32px] px-2"
                        style={{ color: office.mute, fontFamily: "'DM Mono', monospace", background: 'none', border: 'none' }}
                        onClick={() => {
                          void saveStaffMediaMeta(item.id, { published: !item.published }).then(r => {
                            if (!r.ok) setError(r.error)
                            else void load(id)
                          })
                        }}
                      >
                        {item.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        className="text-[10px] tracking-widest uppercase min-h-[32px] px-2"
                        style={{ color: office.wine, fontFamily: "'DM Mono', monospace", background: 'none', border: 'none' }}
                        onClick={() => {
                          if (!window.confirm(`Remove "${item.title}" from Cloudinary and this story?`)) return
                          void deleteStaffMedia(item.id).then(r => {
                            if (!r.ok) setError(r.error)
                            else void load(id)
                          })
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm" style={{ color: office.mute }}>
          Save the story details above before uploading photos.
        </p>
      )}
    </div>
  )
}
