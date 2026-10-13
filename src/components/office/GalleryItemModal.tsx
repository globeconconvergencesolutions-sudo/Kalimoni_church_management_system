import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { parishImage, parishVideoPoster, type ParishMedia } from '../../lib/media'
import type { GalleryCategory } from '../../lib/galleryCategories'
import { OfficeButton } from './OfficePage'
import { office } from './officeTheme'

const mono = { fontFamily: "'DM Mono', monospace" }

export type GalleryItemPatch = {
  title: string
  caption: string
  category: string
  published: boolean
}

export default function GalleryItemModal({
  item,
  categories,
  busy,
  error,
  position,
  onPrev,
  onNext,
  onClose,
  onSave,
}: {
  item: ParishMedia
  categories: GalleryCategory[]
  busy: boolean
  error: string | null
  position?: { index: number; total: number }
  onPrev?: () => void
  onNext?: () => void
  onClose: () => void
  onSave: (patch: GalleryItemPatch) => void
}) {
  const [title, setTitle] = useState(item.title || '')
  const [caption, setCaption] = useState(item.caption || item.alt || '')
  const [category, setCategory] = useState(item.category)
  const [published, setPublished] = useState(item.published)

  useEffect(() => {
    setTitle(item.title || '')
    setCaption(item.caption || item.alt || '')
    setCategory(item.category)
    setPublished(item.published)
  }, [item])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (busy) return
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement
      if (e.key === 'Escape') onClose()
      else if (!typing && e.key === 'ArrowLeft' && onPrev) onPrev()
      else if (!typing && e.key === 'ArrowRight' && onNext) onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose, onPrev, onNext])

  const isVideo = item.media_type === 'video'
  const src = isVideo
    ? parishVideoPoster(item.url || item.cloudinary_id, 720, 480)
    : parishImage(item.url || item.cloudinary_id, 720, 480)

  const names = categories.map(c => c.name)
  const options = names.includes(item.category) ? names : [item.category, ...names]

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSave({ title: title.trim() || item.title, caption: caption.trim(), category, published })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
      style={{ backgroundColor: 'rgba(12,3,6,0.6)' }}
      onClick={() => !busy && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-item-title"
    >
      <form
        onSubmit={submit}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{ backgroundColor: office.ivory, border: `1px solid ${office.line}` }}
      >
        <div className="px-5 py-3 flex items-center justify-between gap-3" style={{ borderBottom: `1px solid ${office.line}`, backgroundColor: '#fff' }}>
          <p id="gallery-item-title" className="text-[10px] tracking-[0.2em] uppercase" style={{ color: office.gold, ...mono }}>
            Edit gallery item{position ? ` · ${position.index + 1} of ${position.total}` : ''}
          </p>
          <div className="flex items-center gap-1">
            <NavButton label="Previous item" disabled={!onPrev || busy} onClick={onPrev}>‹</NavButton>
            <NavButton label="Next item" disabled={!onNext || busy} onClick={onNext}>›</NavButton>
            <NavButton label="Close" disabled={busy} onClick={onClose}>×</NavButton>
          </div>
        </div>

        <div className="overflow-y-auto grid md:grid-cols-[1.1fr_1fr]">
          <div className="relative" style={{ backgroundColor: office.ink }}>
            <img src={src} alt={item.alt || item.title} className="w-full h-full object-contain max-h-[50vh] md:max-h-none" style={{ aspectRatio: '3 / 2' }} />
            {isVideo ? (
              <span className="absolute top-2 right-2 text-[9px] tracking-widest uppercase px-2 py-0.5" style={{ ...mono, backgroundColor: 'rgba(200,146,42,0.9)', color: office.ink }}>
                Video
              </span>
            ) : null}
          </div>
          <div className="p-5 space-y-4">
            {error ? (
              <div className="p-3 text-sm" role="alert" style={{ backgroundColor: 'rgba(74,16,25,0.08)', borderLeft: `3px solid ${office.wine}`, color: office.burgundy }}>
                {error}
              </div>
            ) : null}
            <Field label="Title">
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2.5 text-sm min-h-[44px]" style={office.field} />
            </Field>
            <Field label="Caption (shown in the public lightbox)">
              <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={3} className="w-full px-3 py-2.5 text-sm" style={office.field} />
            </Field>
            <Field label="Category">
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2.5 text-sm min-h-[44px]" style={office.field}>
                {options.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
              {category !== item.category ? (
                <p className="text-[11px] mt-1.5" style={{ color: office.gold }}>
                  Moves from {item.category} → {category}
                </p>
              ) : null}
            </Field>
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: office.burgundy }}>
              <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="w-4 h-4" style={{ accentColor: office.wine }} />
              Published on /gallery
            </label>
          </div>
        </div>

        <div className="px-5 py-3 flex items-center justify-end gap-3" style={{ borderTop: `1px solid ${office.line}`, backgroundColor: office.paper }}>
          <OfficeButton variant="ghost" onClick={onClose} disabled={busy}>Cancel</OfficeButton>
          <OfficeButton type="submit" loading={busy}>{busy ? 'Saving…' : 'Save changes'}</OfficeButton>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-[10px] tracking-[0.18em] uppercase block mb-2" style={{ color: office.mute, ...mono }}>{label}</label>
      {children}
    </div>
  )
}

function NavButton({ children, label, disabled, onClick }: { children: ReactNode; label: string; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center text-lg disabled:opacity-30"
      style={{ color: office.wine, border: `1px solid ${office.line}` }}
    >
      {children}
    </button>
  )
}
