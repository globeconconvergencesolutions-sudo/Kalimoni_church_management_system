import { useEffect, useId, useRef, type ReactNode } from 'react'
import { office } from './officeTheme'
import { OfficeButton } from './OfficePage'

export type OfficeConfirmTone = 'danger' | 'default'

export type OfficeConfirmProps = {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: OfficeConfirmTone
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Branded confirmation dialog — replaces window.confirm across the parish office.
 */
export default function OfficeConfirm({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  busy = false,
  onConfirm,
  onCancel,
}: OfficeConfirmProps) {
  const titleId = useId()
  const descId = useId()
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const t = window.setTimeout(() => confirmRef.current?.focus(), 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [open, busy, onCancel])

  if (!open) return null

  const confirmStyle =
    tone === 'danger'
      ? { backgroundColor: office.wine, color: '#FAF6F0' }
      : { backgroundColor: office.wine, color: '#FAF6F0' }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 sm:p-4"
      style={{ backgroundColor: 'rgba(12,3,6,0.55)' }}
      onClick={() => !busy && onCancel()}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden shadow-2xl"
        style={{ backgroundColor: '#FAF6F0', border: `1px solid ${office.line}` }}
      >
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-2">
          <div className="flex items-start gap-3">
            <div
              className="shrink-0 w-10 h-10 flex items-center justify-center"
              style={{
                backgroundColor: tone === 'danger' ? 'rgba(107,26,42,0.12)' : 'rgba(200,146,42,0.14)',
                color: tone === 'danger' ? office.wine : office.gold,
              }}
              aria-hidden
            >
              {tone === 'danger' ? <WarnIcon /> : <AskIcon />}
            </div>
            <div className="min-w-0 pt-0.5">
              <h2 id={titleId} className="text-lg font-bold leading-snug" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
                {title}
              </h2>
              {description ? (
                <div id={descId} className="text-sm mt-2 leading-relaxed" style={{ color: office.mute }}>
                  {description}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className="px-5 sm:px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2"
          style={{ borderTop: `1px solid ${office.line}`, backgroundColor: '#fff', marginTop: '1rem' }}
        >
          <OfficeButton type="button" variant="ghost" disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </OfficeButton>
          <button
            ref={confirmRef}
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold min-h-[44px] transition-all hover:brightness-110 disabled:opacity-60"
            style={{ ...confirmStyle, fontFamily: "'Lora', serif", border: 'none' }}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function WarnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
    </svg>
  )
}

function AskIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v.01M9.5 9.5a2.5 2.5 0 114.2 1.8c-.7.7-1.7 1.2-1.7 2.2" />
    </svg>
  )
}
