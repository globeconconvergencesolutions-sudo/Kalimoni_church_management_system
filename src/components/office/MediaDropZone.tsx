import { useCallback, useEffect, useId, useRef, useState, type DragEvent } from 'react'
import {
  mediaUploadHint,
  validateParishMediaFile,
} from '../../lib/mediaUploadRules'
import { office } from './officeTheme'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaDropZone({
  file,
  onFile,
  accept,
  label = 'Choose a file',
  hint,
  disabled = false,
  compact = false,
  allowVideo = true,
  onValidationError,
}: {
  file: File | null
  onFile: (file: File | null) => void
  accept: string
  label?: string
  hint?: string
  disabled?: boolean
  compact?: boolean
  allowVideo?: boolean
  onValidationError?: (message: string | null) => void
}) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const resolvedHint = hint ?? mediaUploadHint(allowVideo)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const applyFile = useCallback(
    (next: File | null) => {
      if (!next) {
        setLocalError(null)
        onValidationError?.(null)
        onFile(null)
        return
      }
      const check = validateParishMediaFile(next, { allowVideo })
      if (!check.ok) {
        setLocalError(check.error)
        onValidationError?.(check.error)
        onFile(null)
        if (inputRef.current) inputRef.current.value = ''
        return
      }
      setLocalError(null)
      onValidationError?.(null)
      onFile(next)
    },
    [allowVideo, onFile, onValidationError],
  )

  const pick = useCallback(() => {
    if (!disabled) inputRef.current?.click()
  }, [disabled])

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (disabled) return
      const dropped = e.dataTransfer.files?.[0]
      if (dropped) applyFile(dropped)
    },
    [applyFile, disabled],
  )

  const isVideo = file ? file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name) : false

  return (
    <div className={compact ? '' : 'w-full'}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={e => {
          const picked = e.target.files?.[0] ?? null
          applyFile(picked)
          e.target.value = ''
        }}
      />

      {localError ? (
        <p
          className="mb-2 text-xs px-3 py-2"
          style={{ backgroundColor: 'rgba(74,16,25,0.08)', border: `1px solid ${office.wine}`, color: office.burgundy }}
          role="alert"
        >
          {localError}
        </p>
      ) : null}

      {!file ? (
        <button
          type="button"
          onClick={pick}
          onDragOver={e => { e.preventDefault(); if (!disabled) setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          disabled={disabled}
          className="w-full text-left transition-all duration-200"
          style={{
            border: `2px dashed ${dragOver ? office.gold : office.line}`,
            backgroundColor: dragOver ? 'rgba(200,146,42,0.06)' : '#fff',
            padding: compact ? '1.25rem' : '1.75rem 1.5rem',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <div className={`flex ${compact ? 'flex-row items-center gap-4' : 'flex-col items-center text-center gap-3'}`}>
            <div
              className="shrink-0 flex items-center justify-center rounded-full"
              style={{
                width: compact ? 44 : 52,
                height: compact ? 44 : 52,
                backgroundColor: dragOver ? 'rgba(200,146,42,0.18)' : 'rgba(200,146,42,0.1)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={office.gold} strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 3v12M7 10l5-5 5 5M5 21h14" />
              </svg>
            </div>
            <div className={compact ? 'min-w-0' : ''}>
              <p className="font-semibold text-sm" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
                {dragOver ? 'Drop to upload' : label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: office.mute }}>
                {resolvedHint}
              </p>
              {!compact ? (
                <span
                  className="inline-block mt-3 text-[10px] tracking-widest uppercase px-3 py-1.5"
                  style={{ border: `1px solid ${office.gold}`, color: office.wine, fontFamily: "'DM Mono', monospace" }}
                >
                  Browse files
                </span>
              ) : null}
            </div>
          </div>
        </button>
      ) : (
        <div
          className="overflow-hidden"
          style={{ border: `1px solid ${office.gold}`, backgroundColor: '#fff' }}
        >
          <div className="relative" style={{ aspectRatio: compact ? '16/9' : '2/1', backgroundColor: '#E8DFD0', maxHeight: compact ? 200 : 280 }}>
            {isVideo && preview ? (
              <video src={preview} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
            ) : preview ? (
              <img src={preview} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : null}
            <div className="absolute top-2 right-2 flex gap-1.5">
              <span
                className="text-[9px] tracking-widest uppercase px-2 py-0.5"
                style={{ backgroundColor: 'rgba(74,16,25,0.88)', color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}
              >
                {isVideo ? 'Video' : 'Image'}
              </span>
              <span
                className="text-[9px] tracking-widest uppercase px-2 py-0.5"
                style={{ backgroundColor: 'rgba(200,146,42,0.95)', color: '#1C1A18', fontFamily: "'DM Mono', monospace" }}
              >
                Ready
              </span>
            </div>
          </div>
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
                {file.name}
              </p>
              <p className="text-[10px] tracking-wide mt-0.5" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                {formatBytes(file.size)} · click <strong style={{ color: office.wine }}>Save</strong> below to publish
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={pick}
                disabled={disabled}
                className="px-3 py-2 text-[10px] tracking-widest uppercase min-h-[36px]"
                style={{ border: `1px solid ${office.gold}`, color: office.wine, fontFamily: "'DM Mono', monospace", background: 'transparent' }}
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => applyFile(null)}
                disabled={disabled}
                className="px-3 py-2 text-[10px] tracking-widest uppercase min-h-[36px]"
                style={{ color: office.mute, fontFamily: "'DM Mono', monospace", background: 'none', border: 'none' }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
