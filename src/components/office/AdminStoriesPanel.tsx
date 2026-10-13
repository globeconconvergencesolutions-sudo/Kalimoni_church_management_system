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
import { deleteStaffMedia, saveStaffMediaMeta, uploadParishMedia, type UploadProgress } from '../../lib/mediaAdmin'
import { fetchGalleryCategories } from '../../lib/galleryCategories'
import { parishImage, parishVideoPoster, type ParishMedia } from '../../lib/media'
import MediaDropZone from './MediaDropZone'
import { OfficeAlert, OfficeButton } from './OfficePage'
import { useOfficeConfirm } from './useOfficeConfirm'
import { office } from './officeTheme'
import { BusyOverlay, SkeletonGrid, Spinner, UploadProgressBar, useLeaveGuard } from './OfficeLoaders'
import { MEDIA_GALLERY_ACCEPT, mediaUploadHint } from '../../lib/mediaUploadRules'

type View = { mode: 'list' } | { mode: 'edit'; albumId: string | null }

export default function AdminStoriesPanel() {
  const { confirm, dialog: confirmDialog } = useOfficeConfirm()
  const [view, setView] = useState<View>({ mode: 'list' })
  const [albums, setAlbums] = useState<MediaAlbum[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadAlbums = async () => {
    try {
      const result = await fetchStaffAlbums()
      setAlbums(result.albums)
      if (result.error) setError(result.error)
    } finally {
      setLoaded(true)
    }
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
      {confirmDialog}

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

      {!loaded ? (
        <SkeletonGrid count={4} aspect="16/7" className="grid grid-cols-1 md:grid-cols-2 gap-4" />
      ) : albums.length === 0 ? (
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
              className="relative p-5 flex flex-col gap-3"
              style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}
              aria-busy={deletingId === album.id || undefined}
            >
              {deletingId === album.id ? <BusyOverlay label="Deleting story" dark={false} /> : null}
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
                  loading={deletingId === album.id}
                  onClick={() => {
                    void (async () => {
                      const ok = await confirm({
                        title: 'Delete this story?',
                        description: `"${album.title}" will be removed from Photo Stories. Photos stay in the gallery library.`,
                        confirmLabel: 'Delete story',
                        tone: 'danger',
                      })
                      if (!ok) return
                      setBusy(true)
                      setDeletingId(album.id)
                      setError(null)
                      const result = await deleteStaffAlbum(album.id)
                      setBusy(false)
                      setDeletingId(null)
                      if (!result.ok) {
                        setError(result.error || 'Could not delete this story.')
                        return
                      }
                      setSuccess('Story deleted.')
                      void loadAlbums()
                    })()
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
  const { confirm, dialog: confirmDialog } = useOfficeConfirm()
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
  const [editorLoaded, setEditorLoaded] = useState(!albumId)
  const [saving, setSaving] = useState(false)
  const [upload, setUpload] = useState<{ index: number; total: number; progress: UploadProgress; done: string[] } | null>(null)
  const [itemBusy, setItemBusy] = useState<Record<string, string>>({})

  useLeaveGuard(Boolean(upload))

  const withItemBusy = async (itemId: string, label: string, task: () => Promise<void>) => {
    setItemBusy(prev => ({ ...prev, [itemId]: label }))
    try {
      await task()
    } finally {
      setItemBusy(prev => {
        const next = { ...prev }
        delete next[itemId]
        return next
      })
    }
  }
  const [categoryNames, setCategoryNames] = useState<string[]>([...STORY_CATEGORIES])

  useEffect(() => {
    void fetchGalleryCategories().then(r => {
      if (!r.missingTable && r.categories.length) setCategoryNames(r.categories.map(c => c.name))
    })
  }, [])

  const load = async (targetId: string) => {
    const result = await fetchStaffAlbum(targetId).finally(() => setEditorLoaded(true))
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
    setSaving(true)
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
    setSaving(false)
    if (!result.ok || !result.album) {
      setError(result.error)
      return
    }
    setId(result.album.id)
    setSlug(result.album.slug)
    onSaved(id ? 'Story details saved.' : 'Story created — you can upload photos and videos now.')
    await load(result.album.id)
  }

  const uploadSelected = async () => {
    if (!id) {
      setError('Save the story details first, then upload media.')
      return
    }
    if (!uploadFiles.length) {
      setError('Choose at least one photo or video.')
      return
    }
    setBusy(true)
    setError(null)
    let photos = 0
    let videos = 0
    const done: string[] = []
    for (let index = 0; index < uploadFiles.length; index++) {
      const file = uploadFiles[index]
      setUpload({ index, total: uploadFiles.length, progress: { phase: 'reading', percent: 0 }, done: [...done] })
      const isVid = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name)
      const base = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
      const itemTitle = base ? base.charAt(0).toUpperCase() + base.slice(1) : title
      const caption = pendingCaption.trim() || itemTitle
      const result = await uploadParishMedia(
        file,
        {
          mode: 'gallery',
          title: itemTitle,
          category,
          alt: caption,
          caption,
          albumId: id,
        },
        progress => setUpload(u => (u ? { ...u, progress } : u)),
      )
      if (!result.ok) {
        setBusy(false)
        setUpload(null)
        // Keep only the files that did not make it, so a retry doesn't duplicate
        setUploadFiles(prev => prev.slice(index))
        setError(`${file.name}: ${result.error}${done.length ? ` (${done.length} earlier file${done.length === 1 ? '' : 's'} uploaded fine)` : ''}`)
        await load(id)
        return
      }
      done.push(file.name)
      if (isVid) videos += 1
      else photos += 1
    }
    const n = uploadFiles.length
    setUploadFiles([])
    setPendingCaption('')
    setBusy(false)
    setUpload(null)
    const parts = [
      photos ? `${photos} photo${photos === 1 ? '' : 's'}` : '',
      videos ? `${videos} video${videos === 1 ? '' : 's'}` : '',
    ].filter(Boolean)
    onSaved(`${parts.join(' + ') || `${n} item${n === 1 ? '' : 's'}`} added to the story.`)
    await load(id)
  }

  const onDropZoneFile = (file: File | null) => {
    if (!file) return
    setUploadFiles(prev => [...prev, file])
  }

  return (
    <div className="space-y-6">
      {confirmDialog}
      <button
        type="button"
        onClick={onBack}
        className="text-[10px] tracking-[0.2em] uppercase"
        style={{ color: office.gold, fontFamily: "'DM Mono', monospace", background: 'none', border: 'none' }}
      >
        ← All stories
      </button>

      {error ? <OfficeAlert tone="error">{error}</OfficeAlert> : null}

      {!editorLoaded ? (
        <div className="p-5 sm:p-6 space-y-4" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }} role="status" aria-label="Loading story">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
            <Spinner size={12} /> Opening story…
          </div>
          <SkeletonGrid count={4} aspect="16/10" className="grid grid-cols-1 sm:grid-cols-2 gap-4" />
        </div>
      ) : null}

      <form
        hidden={!editorLoaded}
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
              {(categoryNames.includes(category) ? categoryNames : [category, ...categoryNames]).map(c => (
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
          <OfficeButton type="submit" disabled={busy} loading={saving}>
            {saving ? (id ? 'Saving…' : 'Creating…') : id ? 'Save details' : 'Create story'}
          </OfficeButton>
        </div>
      </form>

      {!editorLoaded ? null : id ? (
        <div className="p-5 sm:p-6 space-y-4" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
                Media in this story
              </p>
              <p className="text-xs mt-1" style={{ color: office.mute }}>
                {items.filter(i => i.media_type !== 'video').length} photo{items.filter(i => i.media_type !== 'video').length === 1 ? '' : 's'}
                {' · '}
                {items.filter(i => i.media_type === 'video').length} video{items.filter(i => i.media_type === 'video').length === 1 ? '' : 's'}
                {' · photos stay in the story grid; videos show with a play badge'}
              </p>
            </div>
          </div>
          <MediaDropZone
            file={null}
            onFile={onDropZoneFile}
            accept={MEDIA_GALLERY_ACCEPT}
            label="Drop photos or videos here (you can add several)"
            hint={mediaUploadHint(true)}
            disabled={busy}
            allowVideo
            onValidationError={setError}
          />
          {uploadFiles.length > 0 ? (
            <div className="space-y-3">
              <ul className="text-xs space-y-1" aria-label="Upload queue">
                {uploadFiles.map((f, i) => {
                  const state = !upload ? 'ready' : i < upload.index ? 'done' : i === upload.index ? 'active' : 'waiting'
                  return (
                    <li key={`${f.name}-${i}`} className="flex items-center gap-2" style={{ color: state === 'waiting' ? office.mute : office.burgundy }}>
                      <span className="w-4 flex justify-center shrink-0">
                        {state === 'done' ? (
                          <span style={{ color: '#2A6B3A' }}>✓</span>
                        ) : state === 'active' ? (
                          <Spinner size={12} style={{ color: office.gold }} />
                        ) : (
                          <span style={{ color: office.line }}>•</span>
                        )}
                      </span>
                      <span className="truncate">{f.name}</span>
                      <span className="ml-auto shrink-0 text-[10px]" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                        {(f.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      {!upload ? (
                        <button
                          type="button"
                          aria-label={`Remove ${f.name} from queue`}
                          onClick={() => setUploadFiles(prev => prev.filter((_, j) => j !== i))}
                          className="px-1.5 text-sm leading-none"
                          style={{ color: office.mute }}
                        >
                          ×
                        </button>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
              {upload ? (
                <UploadProgressBar
                  progress={upload.progress}
                  fileName={uploadFiles[upload.index]?.name}
                  batch={{ index: upload.index, total: upload.total }}
                />
              ) : null}
              <input
                value={pendingCaption}
                disabled={Boolean(upload)}
                onChange={e => setPendingCaption(e.target.value)}
                placeholder="Optional shared caption for this batch"
                className="w-full px-3 py-3 text-sm min-h-[44px]"
                style={office.field}
              />
              <div className="flex gap-2">
                <OfficeButton type="button" disabled={busy} loading={Boolean(upload)} onClick={() => { void uploadSelected() }}>
                  {upload ? `Uploading ${upload.index + 1} of ${upload.total}…` : `Upload ${uploadFiles.length} to story`}
                </OfficeButton>
                <OfficeButton type="button" variant="ghost" disabled={busy} onClick={() => setUploadFiles([])}>
                  Clear queue
                </OfficeButton>
              </div>
            </div>
          ) : null}

          {items.length === 0 ? (
            <p className="text-sm" style={{ color: office.mute }}>No media yet — add photos or videos above.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map(item => {
                const video = item.media_type === 'video'
                const thumb = video
                  ? parishVideoPoster(item.cloudinary_id || item.url, 480, 300)
                  : parishImage(item.cloudinary_id || item.url, 480, 300)
                return (
                  <div key={item.id} className="overflow-hidden" style={{ border: `1px solid ${office.line}` }} aria-busy={itemBusy[item.id] ? true : undefined}>
                    <div className="relative" style={{ aspectRatio: '16/10', backgroundColor: '#E8DFD0' }}>
                      {itemBusy[item.id] ? <BusyOverlay label={itemBusy[item.id]} /> : null}
                      <img
                        src={thumb}
                        alt={item.alt || item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <span
                        className="absolute top-2 right-2 text-[9px] tracking-widest uppercase px-2 py-0.5"
                        style={{
                          backgroundColor: video ? 'rgba(200,146,42,0.95)' : 'rgba(28,26,24,0.65)',
                          color: video ? '#1C1A18' : '#F0E8D8',
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {video ? 'Video' : 'Photo'}
                      </span>
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
                          void withItemBusy(item.id, 'Saving', async () => {
                            const r = await saveStaffMediaMeta(item.id, { title: titleValue })
                            if (!r.ok) setError(r.error)
                            else await load(id)
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
                          void withItemBusy(item.id, 'Saving', async () => {
                            const r = await saveStaffMediaMeta(item.id, { caption, alt: caption })
                            if (!r.ok) setError(r.error)
                            else await load(id)
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
                          disabled={Boolean(itemBusy[item.id])}
                          onClick={() => {
                            void withItemBusy(item.id, 'Setting cover', async () => {
                              const r = await setAlbumCover(id, item.id)
                              if (!r.ok) setError(r.error)
                              else {
                                setCoverId(item.id)
                                onSaved(video ? 'Cover set (video poster will show on the public site).' : 'Cover image updated.')
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
                          disabled={Boolean(itemBusy[item.id])}
                          onClick={() => {
                            void withItemBusy(item.id, item.published ? 'Unpublishing' : 'Publishing', async () => {
                              const r = await saveStaffMediaMeta(item.id, { published: !item.published })
                              if (!r.ok) setError(r.error)
                              else await load(id)
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
                            void (async () => {
                              const ok = await confirm({
                                title: video ? 'Remove this video?' : 'Remove this photo?',
                                description: `"${item.title}" will be deleted from Cloudinary and this story. This cannot be undone.`,
                                confirmLabel: 'Remove',
                                tone: 'danger',
                              })
                              if (!ok) return
                              await withItemBusy(item.id, 'Removing', async () => {
                                const r = await deleteStaffMedia(item.id)
                                if (!r.ok) setError(r.error || 'Could not remove this item.')
                                else await load(id)
                              })
                            })()
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm" style={{ color: office.mute }}>
          Save the story details above before uploading photos or videos.
        </p>
      )}
    </div>
  )
}
