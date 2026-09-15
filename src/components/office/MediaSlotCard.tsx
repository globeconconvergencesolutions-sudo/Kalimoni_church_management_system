import { useEffect, useState } from 'react'
import { mediaDeliverySrc, parishVideo, type ParishMedia } from '../../lib/media'
import type { MediaSlotDef } from '../../lib/mediaSlots'
import { office } from './officeTheme'

function isLive(row?: ParishMedia) {
  if (!row) return false
  if (typeof row.slot_active === 'boolean') return row.slot_active && row.published
  return row.published
}

export default function MediaSlotCard({
  def,
  versions,
  busy,
  onReplace,
  onView,
  onResetCaptions,
  onRevert,
  onMakeLive,
  onRemoveVersion,
}: {
  def: MediaSlotDef
  /** Newest first — all uploads for this placement */
  versions: ParishMedia[]
  busy?: boolean
  onReplace: () => void
  onView: () => void
  onResetCaptions?: (row: ParishMedia) => void
  onRevert?: () => void
  onMakeLive?: (row: ParishMedia) => void
  onRemoveVersion?: (row: ParishMedia) => void
}) {
  const liveIndex = Math.max(0, versions.findIndex(isLive))
  const [index, setIndex] = useState(liveIndex)
  const row = versions[index]
  const live = versions.find(isLive)
  const isCustom = versions.length > 0
  const viewingLive = Boolean(row && isLive(row))
  const pageLabel = def.page.charAt(0).toUpperCase() + def.page.slice(1)
  const src = mediaDeliverySrc(row, def.fallback, 640, 400)

  useEffect(() => {
    setIndex(Math.max(0, versions.findIndex(isLive)))
  }, [versions])

  const prev = () => setIndex(i => (i - 1 + Math.max(versions.length, 1)) % Math.max(versions.length, 1))
  const next = () => setIndex(i => (i + 1) % Math.max(versions.length, 1))

  return (
    <article
      className="overflow-hidden transition-shadow duration-200 hover:shadow-lg"
      style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}
    >
      <div className="relative" style={{ aspectRatio: '16/10', backgroundColor: '#E8DFD0' }}>
        {row?.media_type === 'video' ? (
          <video src={parishVideo(row.cloudinary_id || row.url, 640)} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
        ) : src ? (
          <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <img
            src={mediaDeliverySrc(undefined, def.fallback, 640, 400)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        )}

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isCustom ? (
            <span
              className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1"
              style={{
                backgroundColor: viewingLive ? 'rgba(74,16,25,0.92)' : 'rgba(28,26,24,0.72)',
                color: viewingLive ? '#E8B84B' : '#F0E8D8',
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {viewingLive ? 'Live on site' : 'Previous upload'}
            </span>
          ) : (
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-2 py-1"
              style={{ backgroundColor: 'rgba(28,26,24,0.65)', color: '#F0E8D8', fontFamily: "'DM Mono', monospace" }}
            >
              Site default
            </span>
          )}
        </div>

        {versions.length > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(12,3,6,0.55)', color: '#FAF6F0', border: 'none' }}
              aria-label="Previous version"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(12,3,6,0.55)', color: '#FAF6F0', border: 'none' }}
              aria-label="Next version"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {versions.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className="rounded-full"
                  style={{
                    width: i === index ? 16 : 7,
                    height: 7,
                    backgroundColor: i === index ? office.gold : 'rgba(255,255,255,0.55)',
                    border: 'none',
                    transition: 'width 0.2s ease',
                  }}
                  aria-label={`Version ${i + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="font-semibold text-sm leading-snug" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
            {def.label}
          </p>
          <p className="text-[10px] tracking-wide mt-0.5 capitalize" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
            {pageLabel} · {def.section.replace(/-/g, ' ')}
            {versions.length > 0 ? ` · ${index + 1}/${versions.length}` : ''}
            {live && versions.length > 1 ? ' · history kept' : ''}
          </p>
        </div>

        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: office.mute }}>
          {def.hint}
        </p>

        {(row?.caption || def.defaultCaption) ? (
          <div className="text-[11px] px-3 py-2" style={{ backgroundColor: office.paper, borderLeft: `2px solid ${office.gold}` }}>
            {row?.caption || def.defaultCaption}
            {(row?.subtitle || def.defaultSubtitle) ? (
              <span className="block mt-0.5 opacity-70">{row?.subtitle || def.defaultSubtitle}</span>
            ) : null}
          </div>
        ) : null}

        <div className="text-[10px] tracking-widest uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
          {def.aspect} recommended
        </div>

        {row && !viewingLive && onMakeLive ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onMakeLive(row)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-[10px] tracking-widest uppercase min-h-[40px] disabled:opacity-50"
            style={{ backgroundColor: office.gold, color: '#1C1A18', fontFamily: "'DM Mono', monospace", border: 'none' }}
          >
            Make this live on site
          </button>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={onReplace}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-[10px] tracking-widest uppercase min-h-[40px] transition-opacity disabled:opacity-50"
            style={{ backgroundColor: office.wine, color: '#FAF6F0', fontFamily: "'DM Mono', monospace", border: 'none' }}
          >
            {busy ? <Spinner /> : isCustom ? <RefreshIcon /> : <UploadIcon />}
            {busy ? 'Saving…' : isCustom ? 'Replace' : 'Upload'}
          </button>
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-[10px] tracking-widest uppercase min-h-[40px]"
            style={{ border: `1px solid ${office.gold}`, color: office.wine, fontFamily: "'DM Mono', monospace", backgroundColor: 'transparent' }}
          >
            <ExternalIcon />
            View
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {live && onResetCaptions && def.defaultCaption ? (
            <button
              type="button"
              onClick={() => onResetCaptions(live)}
              className="text-[10px] tracking-widest uppercase min-h-[36px] px-2"
              style={{ color: office.mute, fontFamily: "'DM Mono', monospace", background: 'none', border: 'none' }}
            >
              Reset text
            </button>
          ) : null}
          {isCustom && onRevert ? (
            <button
              type="button"
              onClick={onRevert}
              disabled={busy}
              className="text-[10px] tracking-widest uppercase min-h-[36px] px-2"
              style={{ color: office.wine, fontFamily: "'DM Mono', monospace", background: 'none', border: 'none' }}
            >
              Use site default
            </button>
          ) : null}
          {row && !viewingLive && onRemoveVersion ? (
            <button
              type="button"
              onClick={() => onRemoveVersion(row)}
              disabled={busy}
              className="text-[10px] tracking-widest uppercase min-h-[36px] px-2"
              style={{ color: office.mute, fontFamily: "'DM Mono', monospace", background: 'none', border: 'none' }}
            >
              Delete this version
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function UploadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 3v12M7 10l5-5 5 5M5 21h14" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 12a8 8 0 0114.9-4M20 12a8 8 0 01-14.9 4" />
      <path d="M20 4v5h-5M4 20v-5h5" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <path d="M12 3a9 9 0 109 9" />
    </svg>
  )
}
