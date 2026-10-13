import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  createGalleryCategory,
  deleteGalleryCategory,
  renameGalleryCategory,
  reorderGalleryCategories,
  updateGalleryCategory,
  type GalleryCategory,
} from '../../lib/galleryCategories'
import { OfficeButton } from './OfficePage'
import { office } from './officeTheme'
import { Spinner } from './OfficeLoaders'

const mono = { fontFamily: "'DM Mono', monospace" }

export default function GalleryCategoryManager({
  categories,
  counts,
  missingTable,
  onClose,
  onChanged,
}: {
  categories: GalleryCategory[]
  counts: Record<string, number>
  missingTable: boolean
  onClose: () => void
  onChanged: (message: string) => Promise<void> | void
}) {
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [busy, setBusy] = useState(false)
  /** Which action is running, e.g. "add", "vis:<id>", "del:<id>" — drives the spinners */
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [deleting, setDeleting] = useState<GalleryCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const run = async (task: () => Promise<{ ok: boolean; error: string | null }>, message: string, key: string) => {
    setBusy(true)
    setPending(key)
    setError(null)
    try {
      const result = await task()
      if (!result.ok) {
        setError(result.error || 'Something went wrong. Nothing was changed.')
        return false
      }
      await onChanged(message)
      return true
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  const onAdd = async (e: FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    const ok = await run(
      () => createGalleryCategory(name, { description: newDesc, sortOrder: (categories.length + 1) * 10 }),
      `Category "${name}" created.`,
      'add',
    )
    if (ok) {
      setNewName('')
      setNewDesc('')
    }
  }

  const startEdit = (cat: GalleryCategory) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditDesc(cat.description || '')
    setDeleting(null)
  }

  const saveEdit = async (cat: GalleryCategory) => {
    const name = editName.trim()
    if (!name) {
      setError('Give the category a name.')
      return
    }
    const renamed = name !== cat.name
    const ok = await run(async () => {
      if (renamed) {
        const r = await renameGalleryCategory(cat, name)
        if (!r.ok) return r
      }
      if ((cat.description || '') !== editDesc.trim()) {
        const target = renamed ? { ...cat, name } : cat
        return updateGalleryCategory(target, { description: editDesc.trim() })
      }
      return { ok: true, error: null }
    }, renamed ? `Renamed to "${name}" — ${counts[cat.name] ?? 0} item(s) moved with it.` : `"${cat.name}" updated.`, `edit:${cat.id}`)
    if (ok) setEditingId(null)
  }

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= categories.length) return
    const next = [...categories]
    ;[next[index], next[target]] = [next[target], next[index]]
    await run(() => reorderGalleryCategories(next), 'Category order saved.', `order:${categories[index].id}`)
  }

  const startDelete = (cat: GalleryCategory) => {
    setDeleting(cat)
    setEditingId(null)
    setDeleteTarget(categories.find(c => c.id !== cat.id)?.name ?? '')
  }

  const confirmDelete = async () => {
    if (!deleting) return
    const count = counts[deleting.name] ?? 0
    if (count > 0 && !deleteTarget) {
      setError('Choose where the items in this category should go.')
      return
    }
    const ok = await run(
      () => deleteGalleryCategory(deleting, count > 0 ? deleteTarget : null),
      count > 0
        ? `"${deleting.name}" deleted — ${count} item(s) moved to ${deleteTarget}.`
        : `"${deleting.name}" deleted.`,
      `del:${deleting.id}`,
    )
    if (ok) setDeleting(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
      style={{ backgroundColor: 'rgba(12,3,6,0.6)' }}
      onClick={() => !busy && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-cat-title"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{ backgroundColor: office.ivory, border: `1px solid ${office.line}` }}
      >
        <div className="px-5 sm:px-6 py-4 flex items-start justify-between gap-4" style={{ borderBottom: `1px solid ${office.line}`, backgroundColor: '#fff' }}>
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: office.gold, ...mono }}>
              Gallery library
            </p>
            <h2 id="gallery-cat-title" className="text-xl font-bold" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
              Manage categories
            </h2>
            <p className="text-xs mt-1" style={{ color: office.mute }}>
              Categories become the filter buttons on the public gallery, in this order.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center shrink-0 text-lg"
            style={{ color: office.mute, border: `1px solid ${office.line}` }}
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
          {missingTable ? (
            <div className="p-3 text-xs leading-relaxed" style={{ backgroundColor: office.paper, borderLeft: `3px solid ${office.gold}`, color: office.wine }}>
              Custom categories are not switched on yet. Ask your developer to run the
              <strong> 20261013_gallery_categories </strong>
              migration in Supabase. You can still move items between the built-in categories.
            </div>
          ) : null}

          {error ? (
            <div className="p-3 text-sm" role="alert" style={{ backgroundColor: 'rgba(74,16,25,0.08)', borderLeft: `3px solid ${office.wine}`, color: office.burgundy }}>
              {error}
            </div>
          ) : null}

          {/* Add new */}
          <form onSubmit={e => { void onAdd(e) }} className="p-4 space-y-3" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
            <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: office.mute, ...mono }}>
              New category
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Choir, Lent 2026, Jumuia"
                maxLength={60}
                disabled={busy || missingTable}
                className="flex-1 px-3 py-2.5 text-sm min-h-[44px]"
                style={office.field}
              />
              <OfficeButton type="submit" loading={pending === 'add'} disabled={busy || missingTable || !newName.trim()}>
                {pending === 'add' ? 'Adding…' : 'Add category'}
              </OfficeButton>
            </div>
            <input
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Short description shown on the public gallery (optional)"
              maxLength={200}
              disabled={busy || missingTable}
              className="w-full px-3 py-2.5 text-sm min-h-[40px]"
              style={office.field}
            />
          </form>

          {/* List */}
          <ul className="space-y-2">
            {categories.map((cat, i) => {
              const count = counts[cat.name] ?? 0
              const editing = editingId === cat.id
              const isDeleting = deleting?.id === cat.id
              return (
                <li key={cat.id} className="p-3 sm:p-4" style={{ backgroundColor: '#fff', border: `1px solid ${isDeleting ? office.wine : office.line}` }}>
                  {editing ? (
                    <div className="space-y-2">
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        maxLength={60}
                        autoFocus
                        className="w-full px-3 py-2 text-sm min-h-[40px]"
                        style={office.field}
                      />
                      <input
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        placeholder="Description (optional)"
                        maxLength={200}
                        className="w-full px-3 py-2 text-sm min-h-[40px]"
                        style={office.field}
                      />
                      {editName.trim() && editName.trim() !== cat.name && count > 0 ? (
                        <p className="text-[11px]" style={{ color: office.mute }}>
                          All {count} item(s) in “{cat.name}” will move to the new name.
                        </p>
                      ) : null}
                      <div className="flex gap-2 justify-end">
                        <SmallButton onClick={() => setEditingId(null)} disabled={busy}>Cancel</SmallButton>
                        <SmallButton primary loading={pending === `edit:${cat.id}`} onClick={() => { void saveEdit(cat) }} disabled={busy || missingTable}>
                          {pending === `edit:${cat.id}` ? (editName.trim() !== cat.name && count > 0 ? `Moving ${count}…` : 'Saving…') : 'Save'}
                        </SmallButton>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col shrink-0 items-center justify-center" style={{ minWidth: 28 }}>
                        {pending === `order:${cat.id}` ? <Spinner size={14} style={{ color: office.gold }} /> : null}
                        {pending === `order:${cat.id}` ? null : <>
                        <ArrowButton label="Move up" disabled={busy || missingTable || i === 0} onClick={() => { void move(i, -1) }}>▲</ArrowButton>
                        <ArrowButton label="Move down" disabled={busy || missingTable || i === categories.length - 1} onClick={() => { void move(i, 1) }}>▼</ArrowButton>
                        </>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>{cat.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5" style={{ ...mono, backgroundColor: office.paper, color: office.mute }}>
                            {count} item{count === 1 ? '' : 's'}
                          </span>
                          {!cat.visible ? (
                            <span className="text-[9px] tracking-widest uppercase px-1.5 py-0.5" style={{ ...mono, backgroundColor: office.ink, color: office.paper }}>
                              Hidden
                            </span>
                          ) : null}
                          {cat.id.startsWith('unlisted-') ? (
                            <span className="text-[9px] tracking-widest uppercase px-1.5 py-0.5" style={{ ...mono, border: `1px solid ${office.gold}`, color: office.gold }}>
                              Unlisted
                            </span>
                          ) : null}
                        </div>
                        {cat.description ? (
                          <p className="text-xs mt-0.5 truncate" style={{ color: office.mute }}>{cat.description}</p>
                        ) : null}
                      </div>
                      <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                        <SmallButton
                          loading={pending === `vis:${cat.id}`}
                          onClick={() => { void run(() => updateGalleryCategory(cat, { visible: !cat.visible }), cat.visible ? `"${cat.name}" hidden from the public gallery.` : `"${cat.name}" is visible on the public gallery.`, `vis:${cat.id}`) }}
                          disabled={busy || missingTable}
                          title={cat.visible ? 'Hide this category (and its items) from the public gallery' : 'Show on the public gallery'}
                        >
                          {cat.visible ? 'Hide' : 'Show'}
                        </SmallButton>
                        <SmallButton onClick={() => startEdit(cat)} disabled={busy || missingTable}>Edit</SmallButton>
                        <SmallButton danger onClick={() => startDelete(cat)} disabled={busy || categories.length < 2}>Delete</SmallButton>
                      </div>
                    </div>
                  )}

                  {isDeleting ? (
                    <div className="mt-3 pt-3 space-y-2" style={{ borderTop: `1px solid ${office.line}` }}>
                      {count > 0 ? (
                        <>
                          <p className="text-xs" style={{ color: office.burgundy }}>
                            Move its {count} item{count === 1 ? '' : 's'} to:
                          </p>
                          <select
                            value={deleteTarget}
                            onChange={e => setDeleteTarget(e.target.value)}
                            className="w-full px-3 py-2 text-sm min-h-[40px]"
                            style={office.field}
                          >
                            {categories.filter(c => c.id !== cat.id).map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <p className="text-xs" style={{ color: office.burgundy }}>This category is empty — nothing will be moved.</p>
                      )}
                      <div className="flex gap-2 justify-end">
                        <SmallButton onClick={() => setDeleting(null)} disabled={busy}>Cancel</SmallButton>
                        <SmallButton danger loading={pending === `del:${cat.id}`} onClick={() => { void confirmDelete() }} disabled={busy}>
                          {pending === `del:${cat.id}` ? (count > 0 ? `Moving ${count} & deleting…` : 'Deleting…') : count > 0 ? 'Move items & delete' : 'Delete category'}
                        </SmallButton>
                      </div>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="px-5 sm:px-6 py-3 flex items-center justify-between gap-3" style={{ borderTop: `1px solid ${office.line}`, backgroundColor: office.paper }}>
          <p className="text-[10px]" style={{ color: office.mute, ...mono }}>
            {busy ? (
              <span className="inline-flex items-center gap-2" style={{ color: office.gold }}>
                <Spinner size={11} /> Saving changes…
              </span>
            ) : (
              'Changes save immediately'
            )}
          </p>
          <OfficeButton variant="ghost" onClick={onClose} disabled={busy}>Done</OfficeButton>
        </div>
      </div>
    </div>
  )
}

function SmallButton({
  children,
  onClick,
  disabled,
  primary,
  danger,
  title,
  loading,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  primary?: boolean
  danger?: boolean
  title?: string
  loading?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      title={title}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] tracking-widest uppercase min-h-[32px] ${loading ? '' : 'disabled:opacity-40'}`}
      style={{
        ...mono,
        backgroundColor: primary ? office.wine : danger ? 'rgba(107,26,42,0.06)' : '#fff',
        color: primary ? office.ivory : office.wine,
        border: `1px solid ${primary ? office.wine : danger ? office.wine : office.line}`,
      }}
    >
      {loading ? <Spinner size={11} /> : null}
      {children}
    </button>
  )
}

function ArrowButton({ children, onClick, disabled, label }: { children: ReactNode; onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-7 h-5 text-[9px] leading-none disabled:opacity-25"
      style={{ color: office.wine }}
    >
      {children}
    </button>
  )
}
