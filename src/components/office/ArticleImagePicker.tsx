import { useEffect, useState } from 'react'
import { parishImage, type ParishMedia } from '../../lib/media'
import { fetchStaffMedia, uploadParishMedia, type UploadProgress } from '../../lib/mediaAdmin'
import { MEDIA_IMAGE_ACCEPT, mediaUploadHint } from '../../lib/mediaUploadRules'
import MediaDropZone from './MediaDropZone'
import { OfficeButton } from './OfficePage'
import { office } from './officeTheme'
import { SkeletonGrid, Spinner, uploadPhaseLabel, useLeaveGuard } from './OfficeLoaders'

function mediaSrc(item: ParishMedia): string {
  return item.cloudinary_id || item.url
}

export default function ArticleImagePicker({
  value,
  onChange,
  label = 'Photo',
  hint = 'Upload a photo from your device, or choose one already in the parish library.',
  disabled = false,
  aspect = '16/10',
}: {
  value: string
  onChange: (next: string) => void
  label?: string
  hint?: string
  disabled?: boolean
  aspect?: string
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [library, setLibrary] = useState<ParishMedia[]>([])
  const [libraryBusy, setLibraryBusy] = useState(false)
  const [query, setQuery] = useState('')
  const [progress, setProgress] = useState<UploadProgress | null>(null)

  useLeaveGuard(busy)

  const preview = value ? parishImage(value, 960, 600) : ''

  useEffect(() => {
    if (!pickerOpen) return
    let cancelled = false
    setLibraryBusy(true)
    void fetchStaffMedia().then(result => {
      if (cancelled) return
      setLibraryBusy(false)
      if (result.error) {
        setError(result.error)
        setLibrary([])
        return
      }
      setLibrary(result.media.filter(m => m.media_type !== 'video'))
    })
    return () => { cancelled = true }
  }, [pickerOpen])

  const onUpload = async (file: File | null) => {
    if (!file) return
    setBusy(true)
    setError(null)
    setProgress({ phase: 'reading', percent: 0 })
    const result = await uploadParishMedia(
      file,
      {
        mode: 'gallery',
        title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Article photo',
        category: 'Church Life',
        alt: label,
        caption: label,
      },
      setProgress,
    )
    setBusy(false)
    setProgress(null)
    if (!result.ok || !result.media) {
      setError(result.error || 'Could not upload this photo.')
      return
    }
    onChange(mediaSrc(result.media))
  }

  const filtered = library.filter(item => {
    if (!query.trim()) return true
    const q = query.trim().toLowerCase()
    return [item.title, item.caption, item.alt, item.category, item.folder]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(q))
  })

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] tracking-[0.18em] uppercase mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
          {label}
        </p>
        <p className="text-xs" style={{ color: office.mute }}>{hint}</p>
      </div>

      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: aspect, backgroundColor: '#E8DFD0', border: `1px solid ${office.line}` }}
      >
        {preview ? (
          <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <p className="text-sm" style={{ color: office.mute }}>No photo yet — upload or choose from the library.</p>
          </div>
        )}
        {busy ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6"
            style={{ backgroundColor: 'rgba(28,8,14,0.62)' }}
            role="status"
            aria-live="polite"
          >
            <Spinner size={26} style={{ color: office.goldLite }} />
            <p className="text-xs tracking-widest uppercase text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
              {progress ? uploadPhaseLabel(progress) : 'Uploading'}
            </p>
            <div className="w-full max-w-[220px] h-1 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
              <div
                className={`h-full ${progress?.phase === 'uploading' ? '' : 'office-progress-pulse'}`}
                style={{
                  width: `${progress?.phase === 'uploading' ? progress.percent : progress?.phase === 'reading' ? 8 : 100}%`,
                  backgroundColor: office.gold,
                  transition: 'width 220ms ease-out',
                }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm" style={{ color: office.wine }}>{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <OfficeButton type="button" variant="ghost" disabled={disabled || busy} onClick={() => setPickerOpen(true)}>
          Choose from library
        </OfficeButton>
        {value ? (
          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => onChange('')}
            className="px-4 py-3 text-[10px] tracking-widest uppercase min-h-[44px]"
            style={{ color: office.wine, fontFamily: "'DM Mono', monospace", background: 'none', border: 'none' }}
          >
            Remove photo
          </button>
        ) : null}
      </div>

      <MediaDropZone
        file={null}
        onFile={file => { void onUpload(file) }}
        accept={MEDIA_IMAGE_ACCEPT}
        label="Drop a new photo here, or click to browse"
        hint={mediaUploadHint(false)}
        disabled={disabled || busy}
        allowVideo={false}
        compact
        onValidationError={setError}
      />

      {pickerOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          style={{ backgroundColor: 'rgba(12,3,6,0.72)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Choose a photo from the library"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
            style={{ backgroundColor: '#FAF6F0', border: `1px solid ${office.line}` }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-end gap-3 justify-between" style={{ borderBottom: `1px solid ${office.line}` }}>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
                  Parish library
                </p>
                <h3 className="text-lg font-semibold" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
                  Choose a photo
                </h3>
              </div>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search titles…"
                className="w-full sm:w-64 px-3 py-2.5 text-sm min-h-[44px]"
                style={office.field}
              />
            </div>
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              {libraryBusy ? (
                <SkeletonGrid count={6} aspect="4/3" className="grid grid-cols-2 sm:grid-cols-3 gap-3" />
              ) : filtered.length === 0 ? (
                <p className="text-sm" style={{ color: office.mute }}>No photos match. Upload one above instead.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filtered.map(item => {
                    const src = mediaSrc(item)
                    const selected = value === src || value === item.url || value === item.cloudinary_id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onChange(src)
                          setPickerOpen(false)
                        }}
                        className="text-left overflow-hidden"
                        style={{
                          border: `2px solid ${selected ? office.gold : office.line}`,
                          backgroundColor: '#fff',
                        }}
                      >
                        <div className="relative" style={{ aspectRatio: '4/3', backgroundColor: '#E8DFD0' }}>
                          <img
                            src={parishImage(src, 400, 300)}
                            alt={item.alt || item.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-semibold line-clamp-1" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
                            {item.title}
                          </p>
                          <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                            {item.category || 'Photo'}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="p-4 flex justify-end" style={{ borderTop: `1px solid ${office.line}` }}>
              <OfficeButton type="button" variant="ghost" onClick={() => setPickerOpen(false)}>
                Close
              </OfficeButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
