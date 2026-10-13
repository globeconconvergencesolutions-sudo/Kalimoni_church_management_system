import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  activateSlotVersion,
  clearSiteSlot,
  deleteStaffMedia,
  fetchStaffMedia,
  saveStaffMediaMeta,
  uploadParishMedia,
  type UploadProgress,
} from '../../lib/mediaAdmin'
import { invalidateSiteMediaCache } from '../../hooks/useSiteMedia'
import { useStaffSession } from '../../hooks/useStaffSession'
import { parishImage, parishVideoPoster, type ParishMedia } from '../../lib/media'
import {
  GALLERY_CATEGORIES,
  MEDIA_PAGES,
  MEDIA_SLOT_DEFS,
  slotsForPage,
  type MediaSlotDef,
} from '../../lib/mediaSlots'
import { MEDIA_GALLERY_ACCEPT, mediaUploadHint } from '../../lib/mediaUploadRules'
import { mediaSlotViewUrl } from '../../lib/mediaPreview'
import MediaCenterTabs from '../../components/office/MediaCenterTabs'
import MediaDropZone from '../../components/office/MediaDropZone'
import MediaReplaceModal from '../../components/office/MediaReplaceModal'
import MediaSlotCard from '../../components/office/MediaSlotCard'
import AdminStoriesPanel from '../../components/office/AdminStoriesPanel'
import GalleryCategoryManager from '../../components/office/GalleryCategoryManager'
import GalleryItemModal, { type GalleryItemPatch } from '../../components/office/GalleryItemModal'
import {
  createGalleryCategory,
  fetchGalleryCategories,
  mergeCategoryNames,
  moveMediaToCategory,
  setMediaPublished,
  type GalleryCategory,
} from '../../lib/galleryCategories'
import OfficePage, { OfficeAlert, OfficeButton } from '../../components/office/OfficePage'
import { useOfficeConfirm } from '../../components/office/useOfficeConfirm'
import { office } from '../../components/office/officeTheme'
import {
  BusyOverlay,
  OfficeActivity,
  SkeletonGrid,
  Spinner,
  UploadProgressBar,
  useLeaveGuard,
  type OfficeActivityState,
} from '../../components/office/OfficeLoaders'

type Tab = 'site' | 'gallery' | 'stories'
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
  const { ready: sessionReady } = useStaffSession()
  const { confirm, dialog: confirmDialog } = useOfficeConfirm()
  const [tab, setTab] = useState<Tab>('site')
  const [media, setMedia] = useState<ParishMedia[]>([])
  const [error, setError] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
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
  const [gNewCategory, setGNewCategory] = useState<string | null>(null)

  const [storedCategories, setStoredCategories] = useState<GalleryCategory[]>([])
  const [categoriesMissing, setCategoriesMissing] = useState(false)
  const [manageCategories, setManageCategories] = useState(false)
  const [gallerySearch, setGallerySearch] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [lastPicked, setLastPicked] = useState<string | null>(null)
  const [bulkTarget, setBulkTarget] = useState('')
  const [dragIds, setDragIds] = useState<string[] | null>(null)
  const [dropCategory, setDropCategory] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  const [loaded, setLoaded] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [uploadPreview, setUploadPreview] = useState<{ name: string; url: string | null; video: boolean } | null>(null)
  const [replaceProgress, setReplaceProgress] = useState<UploadProgress | null>(null)
  const [busyItems, setBusyItems] = useState<Record<string, string>>({})
  const [activity, setActivity] = useState<OfficeActivityState>(null)
  const [creatingCategory, setCreatingCategory] = useState(false)

  useLeaveGuard(Boolean(uploadProgress || replaceProgress || activity))

  const markBusy = (ids: string[], label: string | null) => {
    setBusyItems(prev => {
      const next = { ...prev }
      for (const id of ids) {
        if (label) next[id] = label
        else delete next[id]
      }
      return next
    })
  }

  const versionsBySlot = useMemo(() => {
    const map: Record<string, ParishMedia[]> = {}
    for (const m of media) {
      if (!m.slot_key) continue
      if (!map[m.slot_key]) map[m.slot_key] = []
      map[m.slot_key].push(m)
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => {
        const aLive = a.slot_active === true || (a.slot_active == null && a.published)
        const bLive = b.slot_active === true || (b.slot_active == null && b.published)
        if (aLive !== bLive) return aLive ? -1 : 1
        return String(b.created_at || '').localeCompare(String(a.created_at || ''))
      })
    }
    return map
  }, [media])

  const slotMap = useMemo(() => {
    const map: Record<string, ParishMedia> = {}
    for (const [key, list] of Object.entries(versionsBySlot)) {
      const live = list.find(r => r.slot_active === true || (r.slot_active == null && r.published))
      if (live) map[key] = live
    }
    return map
  }, [versionsBySlot])

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

  const categories = useMemo(
    () => mergeCategoryNames(storedCategories, gallery.map(g => g.category)),
    [storedCategories, gallery],
  )

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const g of gallery) counts[g.category] = (counts[g.category] ?? 0) + 1
    return counts
  }, [gallery])

  const filteredGallery = useMemo(() => {
    const q = gallerySearch.trim().toLowerCase()
    return gallery.filter(g => {
      if (galleryFilter !== 'all' && g.category !== galleryFilter) return false
      if (!q) return true
      return (
        (g.title || '').toLowerCase().includes(q) ||
        (g.caption || '').toLowerCase().includes(q) ||
        (g.category || '').toLowerCase().includes(q)
      )
    })
  }, [gallery, galleryFilter, gallerySearch])

  const selectedIds = useMemo(() => gallery.filter(g => selected.has(g.id)).map(g => g.id), [gallery, selected])
  const editIndex = editId ? filteredGallery.findIndex(g => g.id === editId) : -1
  const editItem = editIndex >= 0 ? filteredGallery[editIndex] : editId ? gallery.find(g => g.id === editId) ?? null : null

  useEffect(() => {
    if (categories.length && !categories.some(c => c.name === gCategory)) setGCategory(categories[0].name)
  }, [categories, gCategory])

  useEffect(() => {
    if (galleryFilter !== 'all' && !categories.some(c => c.name === galleryFilter)) setGalleryFilter('all')
  }, [categories, galleryFilter])

  const loadCategories = async () => {
    const result = await fetchGalleryCategories()
    setStoredCategories(result.categories)
    setCategoriesMissing(result.missingTable)
    if (result.error) setError(result.error)
  }

  const load = async () => {
    setRefreshing(true)
    try {
      const [result] = await Promise.all([fetchStaffMedia(), loadCategories()])
      setMedia(result.media)
      if (result.error) setError(result.error)
    } finally {
      setRefreshing(false)
      setLoaded(true)
    }
  }

  useEffect(() => {
    if (!sessionReady) return
    void load()
  }, [sessionReady])

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
    setModalError(null)
  }

  const onReplace = async (e: FormEvent) => {
    e.preventDefault()
    if (!replaceSlot) return
    if (!replaceFile) {
      setModalError('Choose a photo (or video, if this placement allows it) before saving.')
      return
    }
    setBusy(true)
    setBusySlot(replaceSlot.key)
    setModalError(null)
    setError(null)
    setReplaceProgress({ phase: 'reading', percent: 0 })
    try {
      const result = await uploadParishMedia(
        replaceFile,
        {
          mode: 'slot',
          slotKey: replaceSlot.key,
          caption: replaceCaption,
          subtitle: replaceSubtitle,
          alt: replaceCaption || replaceSlot.label,
        },
        setReplaceProgress,
      )
      if (!result.ok) {
        setModalError(result.error || 'Upload failed. Nothing was changed on the website.')
        return
      }
      invalidateSiteMediaCache()
      setSuccess(`${replaceSlot.label} is now live on the website.`)
      setReplaceSlot(null)
      setReplaceFile(null)
      setModalError(null)
      await load()
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Unexpected error during upload. Please try again.')
    } finally {
      setBusy(false)
      setBusySlot(null)
      setReplaceProgress(null)
    }
  }

  const onGalleryUpload = async (e: FormEvent) => {
    e.preventDefault()
    if (!gFile) {
      setError('Choose a photo or video to upload.')
      return
    }
    setBusy(true)
    setError(null)
    const isVideo = gFile.type.startsWith('video/')
    const previewUrl = isVideo ? null : URL.createObjectURL(gFile)
    setUploadPreview({ name: gTitle || gFile.name, url: previewUrl, video: isVideo })
    setUploadProgress({ phase: 'reading', percent: 0 })
    if (galleryFilter !== 'all' && galleryFilter !== gCategory) setGalleryFilter(gCategory)
    try {
      const result = await uploadParishMedia(
        gFile,
        {
          mode: 'gallery',
          title: gTitle || gFile.name,
          category: gCategory,
        },
        setUploadProgress,
      )
      if (!result.ok) {
        setError(result.error || 'Gallery upload failed. Nothing was published.')
        return
      }
      setSuccess(`"${gTitle || gFile.name}" added to the gallery.`)
      setGTitle('')
      setGFile(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error during gallery upload.')
    } finally {
      setBusy(false)
      setUploadProgress(null)
      setUploadPreview(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }

  const handleGalleryToggle = async (item: ParishMedia) => {
    setError(null)
    markBusy([item.id], item.published ? 'Unpublishing' : 'Publishing')
    try {
      const result = await saveStaffMediaMeta(item.id, { published: !item.published })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setMedia(prev => prev.map(m => (m.id === item.id ? { ...m, published: !item.published } : m)))
      setSuccess(item.published ? 'Item unpublished.' : 'Item published to the gallery.')
      await load()
    } finally {
      markBusy([item.id], null)
    }
  }

  const handleGalleryRemove = async (item: ParishMedia) => {
    const ok = await confirm({
      title: 'Remove from gallery?',
      description: `"${item.title}" will be deleted from the gallery and from Cloudinary. This cannot be undone.`,
      confirmLabel: 'Remove',
      tone: 'danger',
    })
    if (!ok) return
    setError(null)
    markBusy([item.id], 'Removing')
    try {
      const result = await deleteStaffMedia(item.id)
      if (!result.ok) {
        setError(result.error || 'Could not remove this item.')
        return
      }
      setMedia(prev => prev.filter(m => m.id !== item.id))
      setSuccess(`"${item.title}" removed.`)
      await load()
    } finally {
      markBusy([item.id], null)
    }
  }

  const createUploadCategory = async () => {
    const name = (gNewCategory || '').trim()
    if (!name) return
    const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      setGCategory(existing.name)
      setGNewCategory(null)
      return
    }
    setCreatingCategory(true)
    setError(null)
    try {
      const result = await createGalleryCategory(name, { sortOrder: (categories.length + 1) * 10 })
      if (!result.ok || !result.category) {
        setError(result.error || 'Could not create this category.')
        return
      }
      await loadCategories()
      setGCategory(result.category.name)
      setGNewCategory(null)
      setSuccess(`Category "${result.category.name}" created.`)
    } finally {
      setCreatingCategory(false)
    }
  }

  const clearSelection = () => {
    setSelected(new Set())
    setLastPicked(null)
  }

  const toggleSelected = (item: ParishMedia, range: boolean) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (range && lastPicked) {
        const ids = filteredGallery.map(g => g.id)
        const a = ids.indexOf(lastPicked)
        const b = ids.indexOf(item.id)
        if (a >= 0 && b >= 0) {
          const [from, to] = a < b ? [a, b] : [b, a]
          for (const id of ids.slice(from, to + 1)) next.add(id)
          return next
        }
      }
      if (next.has(item.id)) next.delete(item.id)
      else next.add(item.id)
      return next
    })
    setLastPicked(item.id)
  }

  const moveItems = async (ids: string[], category: string) => {
    const movable = gallery.filter(g => ids.includes(g.id) && g.category !== category).map(g => g.id)
    if (!movable.length) {
      setSuccess(`Already in ${category}.`)
      return
    }
    setBusy(true)
    setError(null)
    markBusy(movable, 'Moving')
    setActivity({ label: `Moving ${movable.length} item${movable.length === 1 ? '' : 's'} to ${category}…` })
    try {
      const result = await moveMediaToCategory(movable, category)
      if (!result.ok) {
        setError(result.error || 'Could not move these items.')
        return
      }
      // Optimistic local update so the grid responds instantly
      setMedia(prev => prev.map(m => (movable.includes(m.id) ? { ...m, category } : m)))
      setSuccess(`${result.moved} item${result.moved === 1 ? '' : 's'} moved to ${category}.`)
      clearSelection()
      await load()
    } finally {
      setBusy(false)
      markBusy(movable, null)
      setActivity(null)
    }
  }

  const bulkPublish = async (published: boolean) => {
    const ids = selectedIds
    if (!ids.length) return
    const plural = `${ids.length} item${ids.length === 1 ? '' : 's'}`
    setBusy(true)
    setError(null)
    markBusy(ids, published ? 'Publishing' : 'Unpublishing')
    setActivity({ label: `${published ? 'Publishing' : 'Unpublishing'} ${plural}…` })
    try {
      const result = await setMediaPublished(ids, published)
      if (!result.ok) {
        setError(result.error || 'Could not update these items.')
        return
      }
      setMedia(prev => prev.map(m => (ids.includes(m.id) ? { ...m, published } : m)))
      setSuccess(`${plural} ${published ? 'published' : 'unpublished'}.`)
      clearSelection()
      await load()
    } finally {
      setBusy(false)
      markBusy(ids, null)
      setActivity(null)
    }
  }

  const bulkRemove = async () => {
    const ids = selectedIds
    if (!ids.length) return
    const ok = await confirm({
      title: `Remove ${ids.length} item${ids.length === 1 ? '' : 's'}?`,
      description: 'They will be deleted from the gallery and from Cloudinary. This cannot be undone. To keep them off the site without deleting, use Unpublish instead.',
      confirmLabel: 'Remove',
      tone: 'danger',
    })
    if (!ok) return
    setBusy(true)
    setError(null)
    let removed = 0
    const failures: string[] = []
    markBusy(ids, 'Waiting')
    try {
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i]
        setActivity({ label: `Removing ${ids.length} item${ids.length === 1 ? '' : 's'}…`, done: i, total: ids.length })
        markBusy([id], 'Removing')
        const result = await deleteStaffMedia(id)
        if (result.ok) {
          removed += 1
          // Drop the tile straight away so progress is visible in the grid
          setMedia(prev => prev.filter(m => m.id !== id))
        } else {
          failures.push(result.error || 'Unknown error')
        }
        markBusy([id], null)
      }
      setActivity({ label: 'Refreshing the library…', done: ids.length, total: ids.length })
      if (failures.length) setError(`${failures.length} item(s) could not be removed: ${failures[0]}`)
      if (removed) setSuccess(`${removed} item${removed === 1 ? '' : 's'} removed.`)
      clearSelection()
      await load()
    } finally {
      setBusy(false)
      markBusy(ids, null)
      setActivity(null)
    }
  }

  const onTileDragStart = (item: ParishMedia) => {
    setDragIds(selected.has(item.id) && selected.size > 1 ? selectedIds : [item.id])
  }

  const onCategoryDrop = (category: string) => {
    const ids = dragIds
    setDragIds(null)
    setDropCategory(null)
    if (ids?.length) void moveItems(ids, category)
  }

  const saveItem = async (item: ParishMedia, patch: GalleryItemPatch) => {
    setBusy(true)
    setEditError(null)
    try {
      const result = await saveStaffMediaMeta(item.id, {
        title: patch.title,
        caption: patch.caption || null,
        alt: patch.caption || patch.title,
        category: patch.category,
        published: patch.published,
      })
      if (!result.ok) {
        setEditError(result.error || 'Could not save this item.')
        return
      }
      setSuccess(
        patch.category !== item.category
          ? `"${patch.title}" saved and moved to ${patch.category}.`
          : `"${patch.title}" saved.`,
      )
      setEditId(null)
      await load()
    } finally {
      setBusy(false)
    }
  }

  const handleResetCaptions = async (def: MediaSlotDef, row: ParishMedia) => {
    setError(null)
    setBusySlot(def.key)
    try {
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
    } finally {
      setBusySlot(null)
    }
  }

  const handleMakeLive = async (def: MediaSlotDef, row: ParishMedia) => {
    setError(null)
    setBusySlot(def.key)
    try {
      const result = await activateSlotVersion(def.key, row.id)
      if (!result.ok) {
        setError(result.error || 'Could not make this version live.')
        return
      }
      invalidateSiteMediaCache()
      setSuccess(`"${def.label}" now shows this previous upload on the site.`)
      await load()
    } finally {
      setBusySlot(null)
    }
  }

  const handleRemoveVersion = async (def: MediaSlotDef, row: ParishMedia) => {
    const ok = await confirm({
      title: 'Delete this version?',
      description: `Remove this previous upload for "${def.label}" from Cloudinary. The live site image is not affected.`,
      confirmLabel: 'Delete version',
      tone: 'danger',
    })
    if (!ok) return
    setError(null)
    setBusySlot(def.key)
    try {
      const result = await deleteStaffMedia(row.id)
      if (!result.ok) {
        setError(result.error || 'Could not delete this version.')
        return
      }
      setSuccess('Previous upload removed.')
      await load()
    } finally {
      setBusySlot(null)
    }
  }

  const handleSlotRevert = async (def: MediaSlotDef) => {
    const versions = versionsBySlot[def.key] || []
    if (versions.length === 0) {
      setSuccess(`"${def.label}" is already using the default image — nothing to revert.`)
      return
    }
    const ok = await confirm({
      title: 'Use site default?',
      description: `"${def.label}" will show the built-in default on the public site. Your previous uploads stay in this card so you can make one live again anytime.`,
      confirmLabel: 'Use default',
      tone: 'danger',
    })
    if (!ok) return
    setError(null)
    setBusySlot(def.key)
    try {
      const result = await clearSiteSlot(def.key)
      if (!result.ok) {
        setError(result.error || 'Could not revert this placement.')
        return
      }
      invalidateSiteMediaCache()
      setSuccess(
        result.alreadyClear
          ? `"${def.label}" was already on the default image.`
          : `${def.label} now uses the site default. Previous uploads are still in the card history.`,
      )
      await load()
    } finally {
      setBusySlot(null)
    }
  }

  const onGalleryFile = (file: File | null) => {
    setGFile(file)
    if (file) setError(null)
    if (file && !gTitle.trim()) {
      const base = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
      if (base) setGTitle(base.charAt(0).toUpperCase() + base.slice(1))
    }
  }

  const viewUrl = (def: MediaSlotDef) => mediaSlotViewUrl(def.key)

  return (
    <OfficePage
      wide
      kicker="House"
      title="Media"
      lede="Manage site placements, the public gallery, and photo stories such as construction progress."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <MediaCenterTabs active={tab} onChange={setTab} />
      </div>

      {error ? <div className="mb-4"><OfficeAlert tone="error">{error}</OfficeAlert></div> : null}

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
            Each card matches an exact place on the public site. Replace keeps previous uploads in a small history slider — you can make an older one live again anytime.
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
          {!loaded ? (
            <SkeletonGrid count={6} aspect="4/3" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" />
          ) : filteredSlots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredSlots.map(def => {
                const versions = versionsBySlot[def.key] || []
                const row = slotMap[def.key]
                return (
                  <MediaSlotCard
                    key={def.key}
                    def={def}
                    versions={versions}
                    busy={busySlot === def.key}
                    onReplace={() => openReplace(def)}
                    onView={() => window.open(viewUrl(def), '_blank', 'noopener,noreferrer')}
                    onResetCaptions={
                      row && def.defaultCaption
                        ? liveRow => { void handleResetCaptions(def, liveRow) }
                        : undefined
                    }
                    onRevert={versions.length ? () => { void handleSlotRevert(def) } : undefined}
                    onMakeLive={row => { void handleMakeLive(def, row) }}
                    onRemoveVersion={row => { void handleRemoveVersion(def, row) }}
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
      ) : tab === 'gallery' ? (
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
                {loaded ? `${publishedGallery} published · ${gallery.length} total items on /gallery` : 'Loading the library…'}
              </p>
            </div>
            {refreshing && loaded ? (
              <span className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
                <Spinner size={12} /> Syncing
              </span>
            ) : null}
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
                  accept={MEDIA_GALLERY_ACCEPT}
                  label="Drop a photo or video here"
                  hint={mediaUploadHint(true)}
                  disabled={Boolean(uploadProgress)}
                  onValidationError={setError}
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
                    disabled={Boolean(uploadProgress)}
                    className="w-full px-3 py-3 text-sm min-h-[44px]"
                    style={office.field}
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.18em] uppercase block mb-2" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                    Category
                  </label>
                  {gNewCategory === null ? (
                    <select
                      value={gCategory}
                      onChange={e => {
                        if (e.target.value === '__new__') setGNewCategory('')
                        else setGCategory(e.target.value)
                      }}
                      className="w-full px-3 py-3 text-sm min-h-[44px]"
                      style={office.field}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>
                          {c.name}{c.visible ? '' : ' (hidden)'}
                        </option>
                      ))}
                      {!categoriesMissing ? <option value="__new__">+ New category…</option> : null}
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={gNewCategory}
                        onChange={e => setGNewCategory(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            void createUploadCategory()
                          } else if (e.key === 'Escape') {
                            setGNewCategory(null)
                          }
                        }}
                        autoFocus
                        maxLength={60}
                        placeholder="New category name"
                        className="flex-1 min-w-0 px-3 py-3 text-sm min-h-[44px]"
                        style={office.field}
                      />
                      <OfficeButton onClick={() => { void createUploadCategory() }} loading={creatingCategory} disabled={!gNewCategory.trim()}>
                        {creatingCategory ? 'Creating…' : 'Create'}
                      </OfficeButton>
                      <OfficeButton variant="ghost" onClick={() => setGNewCategory(null)} disabled={creatingCategory}>
                        ×
                      </OfficeButton>
                    </div>
                  )}
                </div>
                <p className="text-[10px] leading-relaxed mt-auto" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                  Published items appear on the public gallery at /gallery
                </p>
              </div>
            </div>
            {uploadProgress ? (
              <div className="px-5 sm:px-6 pb-5">
                <UploadProgressBar progress={uploadProgress} fileName={gFile?.name} />
              </div>
            ) : null}
            <div
              className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              style={{ borderTop: `1px solid ${office.line}`, backgroundColor: office.paper }}
            >
              <p className="text-[10px]" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                {uploadProgress
                  ? 'Uploading — you can keep browsing the library below'
                  : gFile
                    ? 'File selected — click Publish to gallery'
                    : 'Select a file, then publish'}
              </p>
              <OfficeButton type="submit" loading={Boolean(uploadProgress)} disabled={!gFile || creatingCategory}>
                {uploadProgress ? 'Publishing…' : 'Publish to gallery'}
              </OfficeButton>
            </div>
          </form>

          {/* Library toolbar */}
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
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
                value={gallerySearch}
                onChange={e => setGallerySearch(e.target.value)}
                placeholder="Search gallery by title, caption, or category…"
                className="w-full pl-10 pr-4 py-2.5 text-sm min-h-[44px]"
                style={office.field}
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <OfficeButton
                variant={selectMode ? 'primary' : 'ghost'}
                onClick={() => {
                  if (selectMode) clearSelection()
                  setSelectMode(!selectMode)
                }}
              >
                {selectMode ? 'Done selecting' : 'Select items'}
              </OfficeButton>
              <OfficeButton variant="ghost" onClick={() => setManageCategories(true)}>
                Manage categories
              </OfficeButton>
            </div>
          </div>

          {/* Gallery filters — also drop targets for moving items */}
          <div>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={galleryFilter === 'all'} onClick={() => setGalleryFilter('all')}>
                All ({gallery.length})
              </FilterChip>
              {categories.map(cat => {
                const isDrop = dropCategory === cat.name
                return (
                  <div
                    key={cat.id}
                    onDragOver={e => {
                      if (!dragIds) return
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                      if (dropCategory !== cat.name) setDropCategory(cat.name)
                    }}
                    onDragLeave={() => setDropCategory(c => (c === cat.name ? null : c))}
                    onDrop={e => {
                      e.preventDefault()
                      onCategoryDrop(cat.name)
                    }}
                    className="rounded-full transition-transform"
                    style={{
                      outline: isDrop ? `2px dashed ${office.gold}` : dragIds ? `1px dashed ${office.line}` : 'none',
                      outlineOffset: 2,
                      transform: isDrop ? 'scale(1.06)' : undefined,
                    }}
                  >
                    <FilterChip active={galleryFilter === cat.name} onClick={() => setGalleryFilter(cat.name)}>
                      {cat.visible ? '' : '◌ '}
                      {cat.name} ({categoryCounts[cat.name] ?? 0})
                    </FilterChip>
                  </div>
                )
              })}
            </div>
            <p className="text-[10px] mt-2" style={{ color: dragIds ? office.gold : office.mute, fontFamily: "'DM Mono', monospace" }}>
              {dragIds
                ? `Drop on a category to move ${dragIds.length} item${dragIds.length === 1 ? '' : 's'}`
                : 'Tip: drag a photo onto a category to move it · click a photo to edit · ◌ = hidden from the public gallery'}
            </p>
          </div>

          {/* Bulk action bar */}
          {selectMode ? (
            <div
              className="sticky top-2 z-20 p-3 sm:p-4 flex flex-col xl:flex-row xl:items-center gap-3 shadow-sm"
              style={{ backgroundColor: office.night, color: office.paper, border: `1px solid ${office.wine}` }}
            >
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm" style={{ fontFamily: "'Lora', serif" }}>
                  <strong style={{ color: office.goldLite }}>{selectedIds.length}</strong> selected
                </span>
                <button
                  type="button"
                  className="text-[10px] tracking-widest uppercase underline-offset-2 hover:underline"
                  style={{ color: office.goldLite, fontFamily: "'DM Mono', monospace" }}
                  onClick={() => setSelected(new Set(filteredGallery.map(g => g.id)))}
                >
                  Select all {filteredGallery.length}
                </button>
                {selectedIds.length ? (
                  <button
                    type="button"
                    className="text-[10px] tracking-widest uppercase underline-offset-2 hover:underline"
                    style={{ color: '#F0E8D8AA', fontFamily: "'DM Mono', monospace" }}
                    onClick={clearSelection}
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 xl:ml-auto">
                <select
                  value={bulkTarget}
                  onChange={e => setBulkTarget(e.target.value)}
                  disabled={busy || !selectedIds.length}
                  className="px-3 py-2 text-sm min-h-[40px]"
                  style={{ ...office.field, minWidth: 180 }}
                  aria-label="Move selected items to category"
                >
                  <option value="">Move to category…</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <BulkButton
                  gold
                  disabled={busy || !selectedIds.length || !bulkTarget}
                  onClick={() => { void moveItems(selectedIds, bulkTarget) }}
                >
                  Move
                </BulkButton>
                <BulkButton disabled={busy || !selectedIds.length} onClick={() => { void bulkPublish(true) }}>Publish</BulkButton>
                <BulkButton disabled={busy || !selectedIds.length} onClick={() => { void bulkPublish(false) }}>Unpublish</BulkButton>
                <BulkButton danger disabled={busy || !selectedIds.length} onClick={() => { void bulkRemove() }}>Remove</BulkButton>
              </div>
            </div>
          ) : null}

          {!loaded ? (
            <SkeletonGrid count={8} />
          ) : filteredGallery.length === 0 && !uploadPreview ? (
            <div className="p-12 text-center" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
              <p className="text-sm" style={{ color: office.mute }}>
                {gallery.length === 0
                  ? 'No gallery items yet. Upload celebrations and parish moments above.'
                  : gallerySearch.trim()
                    ? 'Nothing matches your search.'
                    : 'No items in this category yet — drag photos onto its button above, or use Select items → Move.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {uploadPreview && uploadProgress ? (
                <PendingUploadTile preview={uploadPreview} progress={uploadProgress} category={gCategory} />
              ) : null}
              {filteredGallery.map(item => (
                <GalleryTile
                  key={item.id}
                  item={item}
                  selectMode={selectMode}
                  selected={selected.has(item.id)}
                  dragging={Boolean(dragIds?.includes(item.id))}
                  busyLabel={busyItems[item.id]}
                  onSelect={range => {
                    if (!selectMode) setSelectMode(true)
                    toggleSelected(item, range)
                  }}
                  onEdit={() => {
                    setEditError(null)
                    setEditId(item.id)
                  }}
                  onDragStart={() => onTileDragStart(item)}
                  onDragEnd={() => {
                    setDragIds(null)
                    setDropCategory(null)
                  }}
                  onToggle={() => { void handleGalleryToggle(item) }}
                  onRemove={() => { void handleGalleryRemove(item) }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <AdminStoriesPanel />
      )}

      {replaceSlot ? (
        <MediaReplaceModal
          def={replaceSlot}
          row={slotMap[replaceSlot.key]}
          file={replaceFile}
          onFile={file => {
            setReplaceFile(file)
            if (file) setModalError(null)
          }}
          caption={replaceCaption}
          onCaption={setReplaceCaption}
          subtitle={replaceSubtitle}
          onSubtitle={setReplaceSubtitle}
          busy={busy}
          error={modalError}
          onClose={() => {
            if (busy) return
            setReplaceSlot(null)
            setModalError(null)
          }}
          onSubmit={e => { void onReplace(e) }}
          progress={replaceProgress}
          onValidationError={msg => setModalError(msg)}
        />
      ) : null}

      {manageCategories ? (
        <GalleryCategoryManager
          categories={categories}
          counts={categoryCounts}
          missingTable={categoriesMissing}
          onClose={() => setManageCategories(false)}
          onChanged={async message => {
            setSuccess(message)
            await load()
          }}
        />
      ) : null}

      {editItem ? (
        <GalleryItemModal
          item={editItem}
          categories={categories}
          busy={busy}
          error={editError}
          position={editIndex >= 0 ? { index: editIndex, total: filteredGallery.length } : undefined}
          onPrev={editIndex > 0 ? () => { setEditError(null); setEditId(filteredGallery[editIndex - 1].id) } : undefined}
          onNext={
            editIndex >= 0 && editIndex < filteredGallery.length - 1
              ? () => { setEditError(null); setEditId(filteredGallery[editIndex + 1].id) }
              : undefined
          }
          onClose={() => setEditId(null)}
          onSave={patch => { void saveItem(editItem, patch) }}
        />
      ) : null}

      {confirmDialog}
      <OfficeActivity activity={activity} />
    </OfficePage>
  )
}

function BulkButton({
  children,
  onClick,
  disabled,
  gold,
  danger,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  gold?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-2 text-[10px] tracking-widest uppercase min-h-[40px] disabled:opacity-40"
      style={{
        fontFamily: "'DM Mono', monospace",
        backgroundColor: gold ? office.gold : 'transparent',
        color: gold ? office.ink : danger ? '#F0B8A8' : office.paper,
        border: `1px solid ${gold ? office.gold : danger ? 'rgba(240,184,168,0.5)' : 'rgba(240,232,216,0.3)'}`,
      }}
    >
      {children}
    </button>
  )
}

function PendingUploadTile({
  preview,
  progress,
  category,
}: {
  preview: { name: string; url: string | null; video: boolean }
  progress: UploadProgress
  category: string
}) {
  const pct = progress.phase === 'uploading' ? progress.percent : progress.phase === 'reading' ? 0 : 100
  const r = 20
  const c = 2 * Math.PI * r
  return (
    <div className="relative overflow-hidden" style={{ aspectRatio: '5/4', backgroundColor: office.night }} aria-busy="true">
      {preview.url ? (
        <img src={preview.url} alt="" className="w-full h-full object-cover" style={{ opacity: 0.45, filter: 'blur(1px)' }} />
      ) : null}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
        <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden className={progress.phase === 'uploading' ? '' : 'animate-spin'}>
          <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="4" />
          <circle
            cx="26"
            cy="26"
            r={r}
            fill="none"
            stroke={office.gold}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={progress.phase === 'uploading' ? c * (1 - pct / 100) : c * 0.7}
            transform="rotate(-90 26 26)"
            style={{ transition: 'stroke-dashoffset 220ms ease-out' }}
          />
          {progress.phase === 'uploading' ? (
            <text x="26" y="30" textAnchor="middle" fontSize="11" fill="#FAF6F0" fontFamily="'DM Mono', monospace">
              {pct}%
            </text>
          ) : null}
        </svg>
        <p className="text-white text-xs font-semibold truncate max-w-full" style={{ fontFamily: "'Lora', serif" }}>{preview.name}</p>
        <p className="text-[9px] tracking-widest uppercase" style={{ color: office.goldLite, fontFamily: "'DM Mono', monospace" }}>
          {progress.phase === 'processing' ? 'Processing' : progress.phase === 'reading' ? 'Preparing' : 'Uploading'} · {category}
        </p>
      </div>
    </div>
  )
}

function GalleryTile({
  item,
  selectMode,
  selected,
  dragging,
  busyLabel,
  onSelect,
  onEdit,
  onDragStart,
  onDragEnd,
  onToggle,
  onRemove,
}: {
  item: ParishMedia
  selectMode: boolean
  selected: boolean
  dragging: boolean
  busyLabel?: string
  onSelect: (range: boolean) => void
  onEdit: () => void
  onDragStart: () => void
  onDragEnd: () => void
  onToggle: () => void
  onRemove: () => void
}) {
  const isVideo = item.media_type === 'video'
  return (
    <div
      className="group relative overflow-hidden cursor-pointer"
      draggable={!busyLabel}
      aria-busy={busyLabel ? true : undefined}
      onDragStart={e => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', item.id)
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      onClick={e => {
        if (busyLabel) return
        if (selectMode) onSelect(e.shiftKey)
        else onEdit()
      }}
      style={{
        aspectRatio: '5/4',
        backgroundColor: '#E8DFD0',
        outline: selected ? `3px solid ${office.gold}` : 'none',
        outlineOffset: -3,
        opacity: dragging ? 0.45 : 1,
        transition: 'opacity 200ms ease',
      }}
    >
      {busyLabel ? <BusyOverlay label={busyLabel} /> : null}
      {isVideo ? (
        <img src={parishVideoPoster(item.url || item.cloudinary_id, 400, 320)} alt={item.alt || item.title} className="w-full h-full object-cover pointer-events-none" />
      ) : (
        <img src={parishImage(item.url || item.cloudinary_id, 400, 320)} alt={item.alt || item.title} className="w-full h-full object-cover pointer-events-none" />
      )}
      <button
        type="button"
        aria-label={selected ? `Deselect ${item.title}` : `Select ${item.title}`}
        aria-pressed={selected}
        onClick={e => {
          e.stopPropagation()
          onSelect(e.shiftKey)
        }}
        className={`absolute top-2 left-2 z-10 w-6 h-6 flex items-center justify-center text-xs transition-opacity ${
          selectMode || selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
        }`}
        style={{
          backgroundColor: selected ? office.gold : 'rgba(255,255,255,0.85)',
          color: office.ink,
          border: `1.5px solid ${selected ? office.gold : 'rgba(28,26,24,0.4)'}`,
        }}
      >
        {selected ? '✓' : ''}
      </button>
      {!item.published ? (
        <span
          className="absolute bottom-2 left-2 text-[9px] tracking-widest uppercase px-2 py-0.5"
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
        {selectMode ? null : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onEdit()
            }}
            className="px-2 text-[9px] tracking-widest uppercase min-h-[32px]"
            style={{ color: '#F0E8D8', fontFamily: "'DM Mono', monospace", background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onToggle()
            }}
            className="flex-1 text-[9px] tracking-widest uppercase py-1.5 min-h-[32px]"
            style={{ backgroundColor: office.gold, color: '#1C1A18', fontFamily: "'DM Mono', monospace", border: 'none' }}
          >
            {item.published ? 'Unpublish' : 'Publish'}
          </button>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onRemove()
            }}
            className="px-2 text-[9px] tracking-widest uppercase min-h-[32px]"
            style={{ color: '#F0E8D8', fontFamily: "'DM Mono', monospace", background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            Remove
          </button>
        </div>
        )}
      </div>
    </div>
  )
}
