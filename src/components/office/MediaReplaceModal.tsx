import { useEffect, useMemo, type FormEvent } from 'react'
import { parishImage } from '../../lib/media'
import type { MediaSlotDef } from '../../lib/mediaSlots'
import type { ParishMedia } from '../../lib/media'
import MediaDropZone from './MediaDropZone'
import { OfficeButton } from './OfficePage'
import { office } from './officeTheme'

export default function MediaReplaceModal({
  def,
  row,
  file,
  onFile,
  caption,
  onCaption,
  subtitle,
  onSubtitle,
  busy,
  onClose,
  onSubmit,
}: {
  def: MediaSlotDef
  row?: ParishMedia
  file: File | null
  onFile: (file: File | null) => void
  caption: string
  onCaption: (v: string) => void
  subtitle: string
  onSubtitle: (v: string) => void
  busy: boolean
  onClose: () => void
  onSubmit: (e: FormEvent) => void
}) {
  const currentSrc = parishImage(
    row?.cloudinary_id || row?.url || def.fallback,
    480,
    270,
  )

  const accept = def.mediaType === 'video'
    ? 'video/mp4,video/webm'
    : 'image/jpeg,image/png,image/webp'

  const hint = def.mediaType === 'video'
    ? 'MP4 or WebM · up to about 32 MB'
    : `JPG, PNG, or WebP · ${def.aspect} recommended · up to 8 MB`

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const step = useMemo(() => {
    if (!file) return 1
    if (def.defaultCaption !== undefined && (!caption.trim() || !subtitle.trim())) return 2
    return 3
  }, [file, caption, subtitle, def.defaultCaption])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
      style={{ backgroundColor: 'rgba(12,3,6,0.6)' }}
      onClick={() => !busy && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-replace-title"
    >
      <form
        onSubmit={onSubmit}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{ backgroundColor: '#FAF6F0', border: `1px solid ${office.line}` }}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 flex items-start justify-between gap-4 shrink-0" style={{ borderBottom: `1px solid ${office.line}` }}>
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
              {row ? 'Replace on site' : 'Upload to site'}
            </div>
            <h2 id="media-replace-title" className="text-lg sm:text-xl font-bold" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
              {def.label}
            </h2>
            <p className="text-xs mt-1 max-w-md" style={{ color: office.mute }}>{def.hint}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="shrink-0 w-10 h-10 flex items-center justify-center"
            style={{ color: office.mute, background: 'none', border: 'none' }}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5">
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace", color: office.mute }}>
            <StepDot done={step > 1} active={step === 1} n={1} label="Choose file" />
            <span style={{ color: office.line }}>—</span>
            {def.defaultCaption !== undefined ? (
              <>
                <StepDot done={step > 2} active={step === 2} n={2} label="Captions" />
                <span style={{ color: office.line }}>—</span>
              </>
            ) : null}
            <StepDot done={false} active={step === 3} n={def.defaultCaption !== undefined ? 3 : 2} label="Publish" />
          </div>

          {/* Before / after */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                Currently live
              </p>
              <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', backgroundColor: '#E8DFD0' }}>
                <img src={currentSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <span
                  className="absolute top-2 left-2 text-[9px] tracking-widest uppercase px-2 py-0.5"
                  style={{
                    backgroundColor: row ? 'rgba(74,16,25,0.88)' : 'rgba(28,26,24,0.55)',
                    color: row ? '#E8B84B' : '#F0E8D8',
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {row ? 'Custom' : 'Default'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                New upload
              </p>
              <MediaDropZone
                file={file}
                onFile={onFile}
                accept={accept}
                label="Drop your file here"
                hint={hint}
                disabled={busy}
                compact
              />
            </div>
          </div>

          {def.defaultCaption !== undefined ? (
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] tracking-[0.18em] uppercase block mb-2" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
                  Carousel caption
                </label>
                <input
                  value={caption}
                  onChange={e => onCaption(e.target.value)}
                  placeholder="Main headline on the slide"
                  className="w-full px-3 py-3 text-sm min-h-[44px]"
                  style={office.field}
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.18em] uppercase block mb-2" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
                  Subtitle
                </label>
                <input
                  value={subtitle}
                  onChange={e => onSubtitle(e.target.value)}
                  placeholder="Supporting line beneath the caption"
                  className="w-full px-3 py-3 text-sm min-h-[44px]"
                  style={office.field}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div
          className="px-5 sm:px-6 py-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0"
          style={{ borderTop: `1px solid ${office.line}`, backgroundColor: '#fff' }}
        >
          <p className="text-[10px]" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
            Goes live immediately on the public website
          </p>
          <div className="flex gap-2">
            <OfficeButton type="button" variant="ghost" disabled={busy} onClick={onClose}>
              Cancel
            </OfficeButton>
            <OfficeButton type="submit" disabled={busy || !file}>
              {busy ? 'Uploading…' : 'Save to website'}
            </OfficeButton>
          </div>
        </div>
      </form>
    </div>
  )
}

function StepDot({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5" style={{ color: active || done ? office.wine : office.mute }}>
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold"
        style={{
          backgroundColor: done ? office.wine : active ? office.gold : office.paper,
          color: done || active ? '#FAF6F0' : office.mute,
          border: `1px solid ${active ? office.gold : office.line}`,
        }}
      >
        {done ? '✓' : n}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </span>
  )
}
