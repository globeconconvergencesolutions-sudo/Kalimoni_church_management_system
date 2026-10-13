import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { UploadProgress } from '../../lib/mediaAdmin'
import { office } from './officeTheme'

const mono = { fontFamily: "'DM Mono', monospace" }

/** Small ring spinner that inherits the surrounding text colour. */
export function Spinner({ size = 14, className = '', style }: { size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin shrink-0 ${className}`}
      style={style}
      role="presentation"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.22" strokeWidth="3" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function uploadPhaseLabel(p: UploadProgress): string {
  if (p.phase === 'reading') return 'Preparing file'
  if (p.phase === 'uploading') return `Uploading ${p.percent}%`
  if (p.phase === 'processing') return 'Processing on the server'
  return 'Done'
}

/**
 * Upload progress panel: phase label, percentage bar, and an optional
 * "file 2 of 5" counter for batches.
 */
export function UploadProgressBar({
  progress,
  fileName,
  batch,
  tone = 'light',
}: {
  progress: UploadProgress
  fileName?: string
  batch?: { index: number; total: number }
  tone?: 'light' | 'dark'
}) {
  const indeterminate = progress.phase === 'reading' || progress.phase === 'processing'
  const pct = progress.phase === 'done' ? 100 : progress.phase === 'processing' ? 100 : progress.percent
  const fg = tone === 'dark' ? office.paper : office.burgundy
  return (
    <div
      className="px-4 py-3"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : pct}
      aria-valuetext={uploadPhaseLabel(progress)}
      style={{
        backgroundColor: tone === 'dark' ? 'rgba(28,8,14,0.85)' : 'rgba(200,146,42,0.08)',
        border: `1px solid ${tone === 'dark' ? 'rgba(200,146,42,0.4)' : office.gold}`,
        color: fg,
      }}
    >
      <div className="flex items-center gap-2.5 text-sm">
        <Spinner size={15} style={{ color: office.gold }} />
        <span className="font-medium" style={{ fontFamily: "'Lora', serif" }}>{uploadPhaseLabel(progress)}</span>
        {batch && batch.total > 1 ? (
          <span className="ml-auto text-[10px] tracking-widest uppercase" style={{ ...mono, color: office.gold }}>
            File {batch.index + 1} of {batch.total}
          </span>
        ) : null}
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden relative" style={{ backgroundColor: tone === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(107,26,42,0.1)' }}>
        <div
          className={`h-full ${indeterminate ? 'office-progress-pulse' : ''}`}
          style={{ width: `${pct}%`, backgroundColor: office.gold, transition: 'width 220ms ease-out' }}
        />
      </div>
      <p className="mt-2 text-[10px] truncate" style={{ ...mono, color: tone === 'dark' ? '#F0E8D8AA' : office.mute }}>
        {fileName ? `${fileName} · ` : ''}
        {progress.phase === 'processing' ? 'Optimising for the website — nearly there' : 'Please keep this page open'}
      </p>
    </div>
  )
}

export type OfficeActivityState = {
  label: string
  done?: number
  total?: number
} | null

/** Floating pill for longer jobs (bulk remove, batch uploads, category moves). */
export function OfficeActivity({ activity }: { activity: OfficeActivityState }) {
  if (!activity) return null
  const { label, done, total } = activity
  const hasCount = typeof done === 'number' && typeof total === 'number' && total > 1
  return (
    <div
      className="fixed bottom-4 right-4 left-4 sm:left-auto z-[60] flex items-center gap-3 px-4 py-3 shadow-lg office-activity-in"
      style={{ backgroundColor: office.night, color: office.paper, border: `1px solid ${office.wine}`, minWidth: 260 }}
      role="status"
      aria-live="polite"
    >
      <Spinner size={18} style={{ color: office.goldLite }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate" style={{ fontFamily: "'Lora', serif" }}>{label}</p>
        {hasCount ? (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <div className="h-full" style={{ width: `${Math.round((done! / total!) * 100)}%`, backgroundColor: office.gold, transition: 'width 220ms ease-out' }} />
            </div>
            <span className="text-[10px] shrink-0" style={{ ...mono, color: office.goldLite }}>
              {done}/{total}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** Overlay shown on a card/tile while an action runs against it. */
export function BusyOverlay({ label, dark = true }: { label: string; dark?: boolean }) {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2"
      style={{ backgroundColor: dark ? 'rgba(28,8,14,0.62)' : 'rgba(250,246,240,0.78)', backdropFilter: 'blur(1.5px)' }}
      role="status"
      aria-live="polite"
    >
      <Spinner size={22} style={{ color: dark ? office.goldLite : office.wine }} />
      <span className="text-[9px] tracking-[0.2em] uppercase" style={{ ...mono, color: dark ? office.paper : office.wine }}>
        {label}
      </span>
    </div>
  )
}

/** Shimmering placeholder block. */
export function Skeleton({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <div className={`office-skeleton ${className}`} style={style} aria-hidden />
}

export function SkeletonGrid({ count = 8, aspect = '5/4', className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' }: { count?: number; aspect?: string; className?: string }) {
  return (
    <div className={className} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} style={{ aspectRatio: aspect, animationDelay: `${i * 70}ms` }} />
      ))}
    </div>
  )
}

/** Placeholder list rows for admin tables (notices, events, posts…). */
export function SkeletonRows({ count = 4, label = 'Loading' }: { count?: number; label?: string }) {
  return (
    <div className="space-y-3" role="status" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="p-4 flex items-center gap-4" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
          <Skeleton className="w-12 h-12 shrink-0" style={{ animationDelay: `${i * 90}ms` }} />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-2.5 w-24" style={{ animationDelay: `${i * 90}ms` }} />
            <Skeleton className="h-3.5 w-3/5" style={{ animationDelay: `${i * 90}ms` }} />
            <Skeleton className="h-2.5 w-2/5" style={{ animationDelay: `${i * 90}ms` }} />
          </div>
          <Skeleton className="hidden sm:block h-9 w-24 shrink-0" style={{ animationDelay: `${i * 90}ms` }} />
        </div>
      ))}
    </div>
  )
}

/**
 * Button that tracks its own async action: shows a spinner while the promise
 * returned by onClick is pending and ignores repeat clicks.
 */
export function AsyncActionButton({
  onClick,
  disabled,
  className = '',
  style,
  children,
  title,
}: {
  onClick: () => Promise<unknown> | void
  disabled?: boolean
  className?: string
  style?: CSSProperties
  children: ReactNode
  title?: string
}) {
  const [pending, setPending] = useState(false)
  const mounted = useRef(true)
  useEffect(() => () => { mounted.current = false }, [])

  const handle = async () => {
    if (pending) return
    const result = onClick()
    if (!result || typeof (result as Promise<unknown>).then !== 'function') return
    setPending(true)
    try {
      await result
    } finally {
      if (mounted.current) setPending(false)
    }
  }

  return (
    <button
      type="button"
      title={title}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      onClick={() => { void handle() }}
      className={`inline-flex items-center justify-center gap-1.5 ${className}`}
      style={{ ...style, opacity: disabled && !pending ? 0.45 : 1, cursor: disabled || pending ? 'not-allowed' : undefined }}
    >
      {pending ? <Spinner size={12} /> : null}
      {children}
    </button>
  )
}

/** Warn before closing or reloading the tab while work is in flight. */
export function useLeaveGuard(active: boolean) {
  useEffect(() => {
    if (!active) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [active])
}
