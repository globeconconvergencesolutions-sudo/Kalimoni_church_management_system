import { useRef } from 'react'
import { mediaDeliverySrc, parishVideo, type ParishMedia } from '../../lib/media'
import type { MediaSlotDef } from '../../lib/mediaSlots'
import { office } from './officeTheme'

export default function MediaSlotCard({
  def,
  row,
  busy,
  onReplace,
  onView,
  onResetCaptions,
  onRevert,
}: {
  def: MediaSlotDef
  row?: ParishMedia
  busy?: boolean
  onReplace: () => void
  onView: () => void
  onResetCaptions?: () => void
  onRevert?: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const src = mediaDeliverySrc(row, def.fallback, 640, 400)
  const isCustom = Boolean(row)
  const pageLabel = def.page.charAt(0).toUpperCase() + def.page.slice(1)

  return (
    <article
      className="overflow-hidden transition-shadow duration-200 hover:shadow-lg group"
      style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}
    >
      <div className="relative" style={{ aspectRatio: '16/10', backgroundColor: '#E8DFD0' }}>
        {row?.media_type === 'video' ? (
          <video src={parishVideo(row.cloudinary_id || row.url, 640)} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
        ) : (
          <img src={src} alt={def.label} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(28,8,15,0.82) 0%, rgba(28,8,15,0.15) 45%, transparent 100%)' }}
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isCustom ? (
            <span
              className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
              style={{ backgroundColor: office.wine, color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}
            >
              <CloudIcon />
              Live
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(28,26,24,0.55)', color: '#F0E8D8', fontFamily: "'DM Mono', monospace" }}
            >
              Default
            </span>
          )}
          {def.mediaType === 'video' ? (
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(200,146,42,0.9)', color: '#1C1A18', fontFamily: "'DM Mono', monospace" }}
            >
              Video
            </span>
          ) : null}
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white font-semibold text-sm leading-snug drop-shadow-sm" style={{ fontFamily: "'Lora', serif" }}>
            {def.label}
          </p>
          <p className="text-white/75 text-[10px] tracking-wide mt-0.5 capitalize" style={{ fontFamily: "'DM Mono', monospace" }}>
            {pageLabel} · {def.section.replace(/-/g, ' ')}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-3">
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
          {isCustom && onResetCaptions && def.defaultCaption ? (
            <button
              type="button"
              onClick={onResetCaptions}
              className="text-[10px] tracking-widest uppercase min-h-[40px] px-2"
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
              className="text-[10px] tracking-widest uppercase min-h-[40px] px-2"
              style={{ color: office.wine, fontFamily: "'DM Mono', monospace", background: 'none', border: 'none' }}
            >
              Revert
            </button>
          ) : null}
        </div>

        <input ref={fileRef} type="file" className="hidden" tabIndex={-1} aria-hidden />
      </div>
    </article>
  )
}

function CloudIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
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
