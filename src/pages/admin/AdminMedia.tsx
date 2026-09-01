import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  clearSiteSlot,
  deleteStaffMedia,
  fetchStaffMedia,
  saveStaffMediaMeta,
  uploadParishMedia,
} from '../../lib/mediaAdmin'
import { invalidateSiteMediaCache } from '../../hooks/useSiteMedia'
import { parishImage, parishVideoPoster, type ParishMedia } from '../../lib/media'
import {
  GALLERY_CATEGORIES,
  MEDIA_PAGES,
  MEDIA_SLOT_DEFS,
  slotsForPage,
  type MediaSlotDef,
} from '../../lib/mediaSlots'
import MediaCenterTabs from '../../components/office/MediaCenterTabs'
import MediaDropZone from '../../components/office/MediaDropZone'
import MediaReplaceModal from '../../components/office/MediaReplaceModal'
import MediaSlotCard from '../../components/office/MediaSlotCard'
import OfficePage, { OfficeAlert, OfficeButton } from '../../components/office/OfficePage'
import { office } from '../../components/office/officeTheme'

type Tab = 'site' | 'gallery'
type PageFilter = 'all' | string

const PAGE_BLURBS: Record<string, string> = {
  home: 'Hero, parish-life carousel, ministries slider, and the Vincentian mission banner on the homepage.',
  about: 'The identity image beside parish history on the About page.',
  ministries: 'Ministry photos shared on the homepage slider and the Ministries page.',
  vincentians: 'Hero and quote-band backgrounds on the Vincentian Fathers page.',
  sisters: 'Hero and ministry tiles on the HHCJ Sisters page.',
  history: 'Opening visual on the parish History page.',
  community: 'Hero and community gallery images on the Community page.',
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-full text-xs font-medium transition min-h-[36px] shrink-0"
      style={{
        fontFamily: active ? "'Lora', serif" : "'Inter', sans-serif",
        backgroundColor: active ? office.wine : '#fff',
        color: active ? '#FAF6F0' : office.mute,
        border: `1px solid ${active ? office.wine : office.line}`,
      }}
    >
      {children}
    </button>
  )
}

export default function AdminMedia() {
  const [tab, setTab] = useState<Tab>('site')
  const [media, setMedia] = useState<ParishMedia[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [busySlot, setBusySlot] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [pageFilter, setPageFilter] = useState<PageFilter>('all')
  const [galleryFilter, setGalleryFilter] = useState<string>('all')
  const [replaceSlot, setReplaceSlot] = useState<MediaSlotDef | null>(null)
  const [replaceFile, setReplaceFile] = useState<File | null>(null)
  const [replaceCaption, setReplaceCaption] = useState('')
  const [replaceSubtitle, setReplaceSubtitle] = useState('')

  const [gTitle, setGTitle] = useState('')
  const [gCategory, setGCategory] = useState<string>(GALLERY_CATEGORIES[0])
  const [gFile, setGFile] = useState<File | null>(null)

  const slotMap = useMemo(() => {
    const map: Record<string, ParishMedia> = {}
    for (const m of media) {
      if (m.slot_key) map[m.slot_key] = m
    }
    return map
  }, [media])

  const gallery = useMemo(() => media.filter(m => !m.slot_key && m.is_slot !== true), [media])
  const customizedCount = useMemo(() => Object.keys(slotMap).length, [slotMap])
  const totalSlots = MEDIA_SLOT_DEFS.length
  const publishedGallery = gallery.filter(g => g.published).length

  const filteredSlots = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MEDIA_SLOT_DEFS.filter(def => {
      if (pageFilter !== 'all' && def.page !== pageFilter) return false
      if (!q) return true
      const pageLabel = MEDIA_PAGES.find(p => p.id === def.page)?.label.toLowerCase() ?? ''
      return (
        def.label.toLowerCase().includes(q) ||
        def.hint.toLowerCase().includes(q) ||
        def.section.toLowerCase().includes(q) ||
        def.page.toLowerCase().includes(q) ||
        pageLabel.includes(q)
      )
    })
  }, [query, pageFilter])

  const filteredGallery = useMemo(() => {
    if (galleryFilter === 'all') return gallery
    return gallery.filter(g => g.category === galleryFilter)
  }, [gallery, galleryFilter])

  const load = async () => {
    const result = await fetchStaffMedia()
    setMedia(result.media)
    setError(result.error)
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    if (!success) return
    const id = setTimeout(() => setSuccess(null), 5000)
    return () => clearTimeout(id)
  }, [success])

  const openReplace = (def: MediaSlotDef) => {
    const row = slotMap[def.key]
    setReplaceSlot(def)
    setReplaceFile(null)
    setReplaceCaption(row?.caption || def.defaultCaption || '')
    setReplaceSubtitle(row?.subtitle || def.defaultSubtitle || '')
    setError(null)
  }

  const onReplace = async (e: FormEvent) => {
    e.preventDefault()
    if (!replaceSlot || !replaceFile) {
      setError('Choose a file to upload.')
      return
    }
    setBusy(true)
    setBusySlot(replaceSlot.key)
    setError(null)
    const result = await uploadParishMedia(replaceFile, {
      mode: 'slot',
      slotKey: replaceSlot.key,
      caption: replaceCaption,
      subtitle: replaceSubtitle,
      alt: replaceCaption || replaceSlot.label,
    })
    setBusy(false)
    setBusySlot(null)
    if (!result.ok) {
      setError(result.error)
      return
    }
    invalidateSiteMediaCache()
    setSuccess(`${replaceSlot.label} is now live on the website.`)
    setReplaceSlot(null)
    setReplaceFile(null)
    await load()
  }

  const onGalleryUpload = async (e: FormEvent) => {
    e.preventDefault()
    if (!gFile) {
      setError('Choose a photo or video to upload.')
      return
    }
    setBusy(true)
    setError(null)
    const result = await uploadParishMedia(gFile, {
      mode: 'gallery',
      title: gTitle || gFile.name,
      category: gCategory,
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSuccess(`"${gTitle || gFile.name}" added to the gallery.`)
    setGTitle('')
    setGFile(null)
    await load()
  }

  const handleGalleryToggle = async (item: ParishMedia) => {
    setError(null)
    const result = await saveStaffMediaMeta(item.id, { published: !item.published })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSuccess(item.published ? 'Item unpublished.' : 'Item published to the gallery.')
    await load()
  }

  const handleGalleryRemove = async (item: ParishMedia) => {
    if (!window.confirm(`Remove "${item.title}" from the gallery and Cloudinary?`)) return
    setError(null)
    setBusy(true)
    const result = await deleteStaffMedia(item.id)
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSuccess(`"${item.title}" removed.`)
    await load()
  }

  const handleResetCaptions = async (def: MediaSlotDef, row: ParishMedia) => {
    setError(null)
    const result = await saveStaffMediaMeta(row.id, {
      caption: def.defaultCaption ?? null,
      subtitle: def.defaultSubtitle ?? null,
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    invalidateSiteMediaCache()
    setSuccess('Captions reset to defaults.')
    await load()
  }

  const handleSlotRevert = async (def: MediaSlotDef) => {
    if (!window.confirm(`Revert "${def.label}" to the default image on the public site?`)) return
    setError(null)
    setBusySlot(def.key)
    const result = await clearSiteSlot(def.key)
    setBusySlot(null)
    if (!result.ok) {
      setError(result.error)
      return
    }
    invalidateSiteMediaCache()
    setSuccess(`${def.label} reverted to the default.`)
    await load()
  }

  const onGalleryFile = (file: File | null) => {
    setGFile(file)
    if (file && !gTitle.trim()) {
      const base = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
      if (base) setGTitle(base.charAt(0).toUpperCase() + base.slice(1))
    }
  }

  const viewUrl = (def: MediaSlotDef) => {
    const hash = def.viewHash ? `#${def.viewHash}` : ''
    return `${def.viewPath}${hash}`
  }

  return (
    <OfficePage
      wide
      kicker="House"
      title="Media"
      lede="Manage every image on the parish website — organised by page, searchable, and ready to replace in one click."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <MediaCenterTabs active={tab} onChange={setTab} />
      </div>

      {error ? <div className="mb-4"><OfficeAlert>{error}</OfficeAlert></div> : null}

      {success ? (
        <div
          className="mb-4 flex items-center gap-2 text-sm px-4 py-3"
          style={{ backgroundColor: 'rgba(74,16,25,0.06)', border: `1px solid ${office.gold}`, color: office.burgundy }}
        >
          <span style={{ color: office.gold }}>✓</span>
          {success}
        </div>
      ) : null}

      {tab === 'site' ? (
        <div className="space-y-6">
          {/* Pipeline status */}
          <div
            className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg shrink-0" style={{ backgroundColor: 'rgba(200,146,42,0.12)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={office.gold} strokeWidth="1.8" strokeLinecap="round">
                  <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
                  Site image pipeline
                </p>
                <p className="text-xs mt-0.5" style={{ color: office.mute }}>
                  {customizedCount} of {totalSlots} placements customised · uploads go live immediately
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>
              <span style={{ color: office.mute }}>
                <strong style={{ color: office.wine }}>{customizedCount}</strong> live on site
              </span>
              <span style={{ color: office.mute }}>
                <strong style={{ color: office.wine }}>{totalSlots - customizedCount}</strong> using defaults
              </span>
              <span style={{ color: office.mute }}>
                <strong style={{ color: office.wine }}>{totalSlots}</strong> total slots
              </span>
            </div>
          </div>

          {/* Search + quick stats */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={office.mute}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" />
              </svg>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name, page, or section…"
                className="w-full pl-10 pr-4 py-3 text-sm min-h-[48px]"
                style={office.field}
              />
            </div>
            <div
              className="px-5 py-3 flex items-center gap-4 shrink-0 min-h-[48px]"
              style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}
            >
              <span className="text-xs" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                Showing <strong style={{ color: office.wine }}>{filteredSlots.length}</strong> slots
              </span>
            </div>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: office.mute }}>
            Each card matches an exact place on the public site. Upload replaces what parishioners see — carousel captions can be edited when you replace.
          </p>

          {/* Page filter chips */}
          <div className="flex flex-wrap gap-2">
            <FilterChip active={pageFilter === 'all'} onClick={() => setPageFilter('all')}>
              All ({totalSlots})
            </FilterChip>
            {MEDIA_PAGES.map(page => {
              const count = slotsForPage(page.id).length
              const filled = slotsForPage(page.id).filter(s => slotMap[s.key]).length
              return (
                <FilterChip key={page.id} active={pageFilter === page.id} onClick={() => setPageFilter(page.id)}>
                  {page.label} ({filled}/{count})
                </FilterChip>
              )
            })}
          </div>

          {pageFilter !== 'all' && PAGE_BLURBS[pageFilter] ? (
            <p className="text-sm" style={{ color: office.mute }}>{PAGE_BLURBS[pageFilter]}</p>
          ) : null}

          {/* Slot grid */}
          {filteredSlots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredSlots.map(def => {
                const row = slotMap[def.key]
                return (
                  <MediaSlotCard
                    key={def.key}
                    def={def}
                    row={row}
                    busy={busySlot === def.key}
                    onReplace={() => openReplace(def)}
                    onView={() => window.open(viewUrl(def), '_blank', 'noopener,noreferrer')}
                    onResetCaptions={
                      row && def.defaultCaption
                        ? () => { void handleResetCaptions(def, row) }
                        : undefined
                    }
                    onRevert={row ? () => { void handleSlotRevert(def) } : undefined}
                  />
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={office.mute} strokeWidth="1.5" className="mx-auto mb-3 opacity-50">
                <rect x="3" y="5" width="18" height="14" rx="1.5" />
                <circle cx="9" cy="10" r="1.5" />
                <path d="M21 16l-5-5-8 8" />
              </svg>
              <p className="text-sm" style={{ color: office.mute }}>No placements match your search</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Gallery stats */}
          <div
            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}
          >
            <div>
              <p className="font-semibold text-sm" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
                Parish gallery
              </p>
              <p className="text-xs mt-0.5" style={{ color: office.mute }}>
                {publishedGallery} published · {gallery.length} total items on /gallery
              </p>
            </div>
          </div>

          {/* Upload zone */}
          <form
            onSubmit={e => { void onGalleryUpload(e) }}
            className="overflow-hidden"
            style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}
          >
            <div className="p-5 sm:p-6 grid lg:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
                  Step 1 · Choose media
                </p>
                <MediaDropZone
                  file={gFile}
                  onFile={onGalleryFile}
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                  label="Drop a photo or video here"
                  hint="JPG, PNG, WebP, MP4, or WebM · images up to 8 MB · videos up to 32 MB"
                  disabled={busy}
                />
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
                  Step 2 · Details
                </p>
                <div>
                  <label className="text-[10px] tracking-[0.18em] uppercase block mb-2" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                    Title
                  </label>
                  <input
                    value={gTitle}
                    onChange={e => setGTitle(e.target.value)}
                    placeholder="e.g. Palm Sunday procession 2025"
                    className="w-full px-3 py-3 text-sm min-h-[44px]"
                    style={office.field}
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.18em] uppercase block mb-2" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                    Category
                  </label>
                  <select value={gCategory} onChange={e => setGCategory(e.target.value)} className="w-full px-3 py-3 text-sm min-h-[44px]" style={office.field}>
                    {GALLERY_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <p className="text-[10px] leading-relaxed mt-auto" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                  Published items appear on the public gallery at /gallery
                </p>
              </div>
            </div>
            <div
              className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              style={{ borderTop: `1px solid ${office.line}`, backgroundColor: office.paper }}
            >
              <p className="text-[10px]" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                {gFile ? 'Ready to publish' : 'Select a file to continue'}
              </p>
              <OfficeButton type="submit" disabled={busy || !gFile}>
                {busy ? 'Uploading…' : 'Publish to gallery'}
              </OfficeButton>
            </div>
          </form>

          {/* Gallery filters */}
          <div className="flex flex-wrap gap-2">
            <FilterChip active={galleryFilter === 'all'} onClick={() => setGalleryFilter('all')}>
              All ({gallery.length})
            </FilterChip>
            {GALLERY_CATEGORIES.map(cat => (
              <FilterChip key={cat} active={galleryFilter === cat} onClick={() => setGalleryFilter(cat)}>
                {cat} ({gallery.filter(g => g.category === cat).length})
              </FilterChip>
            ))}
          </div>

          {filteredGallery.length === 0 ? (
            <div className="p-12 text-center" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
              <p className="text-sm" style={{ color: office.mute }}>
                {gallery.length === 0
                  ? 'No gallery items yet. Upload celebrations and parish moments above.'
                  : 'No items in this category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredGallery.map(item => (
                <GalleryTile
                  key={item.id}
                  item={item}
                  onToggle={() => { void handleGalleryToggle(item) }}
                  onRemove={() => { void handleGalleryRemove(item) }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {replaceSlot ? (
        <MediaReplaceModal
          def={replaceSlot}
          row={slotMap[replaceSlot.key]}
          file={replaceFile}
          onFile={setReplaceFile}
          caption={replaceCaption}
          onCaption={setReplaceCaption}
          subtitle={replaceSubtitle}
          onSubtitle={setReplaceSubtitle}
          busy={busy}
          onClose={() => !busy && setReplaceSlot(null)}
          onSubmit={e => { void onReplace(e) }}
        />
      ) : null}
    </OfficePage>
  )
}

function GalleryTile({
  item,
  onToggle,
  onRemove,
}: {
  item: ParishMedia
  onToggle: () => void
  onRemove: () => void
}) {
  const isVideo = item.media_type === 'video'
  return (
    <div className="group relative overflow-hidden" style={{ aspectRatio: '5/4', backgroundColor: '#E8DFD0' }}>
      {isVideo ? (
        <img src={parishVideoPoster(item.url || item.cloudinary_id, 400, 320)} alt={item.alt || item.title} className="w-full h-full object-cover" />
      ) : (
        <img src={parishImage(item.url || item.cloudinary_id, 400, 320)} alt={item.alt || item.title} className="w-full h-full object-cover" />
      )}
      {!item.published ? (
        <span
          className="absolute top-2 left-2 text-[9px] tracking-widest uppercase px-2 py-0.5"
          style={{ backgroundColor: 'rgba(28,26,24,0.7)', color: '#F0E8D8', fontFamily: "'DM Mono', monospace" }}
        >
          Draft
        </span>
      ) : null}
      {isVideo ? (
        <span
          className="absolute top-2 right-2 text-[9px] tracking-widest uppercase px-2 py-0.5"
          style={{ backgroundColor: 'rgba(200,146,42,0.9)', color: '#1C1A18', fontFamily: "'DM Mono', monospace" }}
        >
          Video
        </span>
      ) : null}
      <div
        className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: 'linear-gradient(to top, rgba(28,8,15,0.92) 0%, rgba(28,8,15,0.4) 55%, transparent 100%)' }}
      >
        <p className="text-white text-xs font-semibold truncate mb-0.5" style={{ fontFamily: "'Lora', serif" }}>{item.title}</p>
        <p className="text-[9px] tracking-widest uppercase mb-2" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>{item.category}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="flex-1 text-[9px] tracking-widest uppercase py-1.5 min-h-[32px]"
            style={{ backgroundColor: office.gold, color: '#1C1A18', fontFamily: "'DM Mono', monospace", border: 'none' }}
          >
            {item.published ? 'Unpublish' : 'Publish'}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="px-2 text-[9px] tracking-widest uppercase min-h-[32px]"
            style={{ color: '#F0E8D8', fontFamily: "'DM Mono', monospace", background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
