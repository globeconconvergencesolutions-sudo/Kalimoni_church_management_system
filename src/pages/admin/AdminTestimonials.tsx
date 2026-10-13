import { useEffect, useState } from 'react'
import {
  deleteTestimonial,
  fetchStaffTestimonials,
  saveStaffTestimonialMeta,
  setTestimonialStatus,
} from '../../lib/testimonials'
import type { Testimonial, TestimonialStatus } from '../../lib/testimonialTypes'
import OfficePage, { OfficeAlert, OfficeButton } from '../../components/office/OfficePage'
import { useOfficeConfirm } from '../../components/office/useOfficeConfirm'
import { office } from '../../components/office/officeTheme'
import { AsyncActionButton, SkeletonRows } from '../../components/office/OfficeLoaders'
import { getSupabase } from '../../lib/supabase'

const FILTERS: Array<{ id: TestimonialStatus | 'all'; label: string }> = [
  { id: 'pending', label: 'Pending' },
  { id: 'published', label: 'Live' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
]

function statusColor(status: TestimonialStatus) {
  if (status === 'published') return '#2A6B3A'
  if (status === 'rejected') return '#8A7A70'
  return office.wine
}

export default function AdminTestimonials() {
  const { confirm, dialog: confirmDialog } = useOfficeConfirm()
  const [filter, setFilter] = useState<TestimonialStatus | 'all'>('pending')
  const [rows, setRows] = useState<Testimonial[]>([])
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuote, setEditQuote] = useState('')
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editSort, setEditSort] = useState(0)

  const [loaded, setLoaded] = useState(false)

  const load = async () => {
    const result = await fetchStaffTestimonials(filter)
    setRows(result.rows)
    setError(result.error)
  }

  useEffect(() => {
    void load().finally(() => setLoaded(true))
  }, [filter])

  const reviewerId = async (): Promise<string | null> => {
    const supabase = getSupabase()
    if (!supabase) return null
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? null
  }

  const onStatus = async (row: Testimonial, status: TestimonialStatus) => {
    setBusyId(row.id)
    setError(null)
    setOk(null)
    const reviewedBy = await reviewerId()
    const err = await setTestimonialStatus(row.id, status, reviewedBy)
    setBusyId(null)
    if (err) {
      setError(err)
      return
    }
    setOk(
      status === 'published'
        ? 'Testimony published on the homepage.'
        : status === 'rejected'
          ? 'Testimony rejected.'
          : 'Moved back to pending.',
    )
    await load()
  }

  const onDelete = async (row: Testimonial) => {
    const okConfirm = await confirm({
      title: 'Remove this testimony?',
      description: `Words from ${row.display_name} will be permanently deleted.`,
      confirmLabel: 'Remove',
      tone: 'danger',
    })
    if (!okConfirm) return
    setBusyId(row.id)
    setError(null)
    setOk(null)
    const err = await deleteTestimonial(row.id)
    setBusyId(null)
    if (err) {
      setError(err)
      return
    }
    setOk('Testimony removed.')
    if (editingId === row.id) setEditingId(null)
    await load()
  }

  const startEdit = (row: Testimonial) => {
    setEditingId(row.id)
    setEditQuote(row.quote)
    setEditName(row.display_name)
    setEditRole(row.role ?? '')
    setEditSort(row.sort_order)
  }

  const saveEdit = async (id: string) => {
    setBusyId(id)
    setError(null)
    setOk(null)
    const err = await saveStaffTestimonialMeta(id, {
      quote: editQuote,
      display_name: editName,
      role: editRole || null,
      sort_order: editSort,
    })
    setBusyId(null)
    if (err) {
      setError(err)
      return
    }
    setOk('Testimony updated.')
    setEditingId(null)
    await load()
  }

  const pendingCount = rows.filter(r => r.status === 'pending').length

  return (
    <OfficePage
      kicker="Proclaim"
      title="Parish voices"
      lede="Stories submitted from the homepage. Approve what appears under Voices of the Parish."
    >
      {confirmDialog}
      {error ? <OfficeAlert tone="error">{error}</OfficeAlert> : null}
      {ok ? <OfficeAlert tone="ok">{ok}</OfficeAlert> : null}

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className="px-3 py-2 text-xs uppercase tracking-widest min-h-[40px]"
            style={{
              fontFamily: "'DM Mono', monospace",
              backgroundColor: filter === f.id ? '#6B1A2A' : '#fff',
              color: filter === f.id ? '#E8B84B' : '#6B6259',
              border: filter === f.id ? 'none' : `1px solid ${office.line}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-xs mb-4" style={{ color: office.mute }}>
        {rows.length} shown
        {filter === 'pending' || filter === 'all' ? ` · ${pendingCount} pending in this list` : ''}
      </p>

      {!loaded ? (
        <SkeletonRows />
      ) : rows.length === 0 && !error ? (
        <p className="text-sm" style={{ color: office.mute }}>
          {filter === 'pending'
            ? 'No pending testimonies. New submissions from the homepage will appear here.'
            : 'Nothing in this filter yet.'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map(row => (
            <div
              key={row.id}
              className="p-5 flex flex-col gap-3"
              style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}
            >
              <div className="flex flex-wrap gap-2">
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: statusColor(row.status), fontFamily: "'DM Mono', monospace" }}
                >
                  {row.status === 'published' ? 'Live' : row.status}
                </span>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                  {new Date(row.created_at).toLocaleString()}
                </span>
              </div>

              {editingId === row.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-sm min-h-[44px]"
                    style={office.field}
                    placeholder="Display name"
                  />
                  <input
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    className="w-full px-3 py-2 text-sm min-h-[44px]"
                    style={office.field}
                    placeholder="Role (optional)"
                  />
                  <textarea
                    value={editQuote}
                    onChange={e => setEditQuote(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 text-sm resize-none"
                    style={office.field}
                  />
                  <label className="text-xs flex items-center gap-2" style={{ color: office.mute }}>
                    Sort order
                    <input
                      type="number"
                      value={editSort}
                      onChange={e => setEditSort(Number(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-sm"
                      style={office.field}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <OfficeButton type="button" loading={busyId === row.id} onClick={() => { void saveEdit(row.id) }}>
                      Save
                    </OfficeButton>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-2 text-xs uppercase tracking-widest min-h-[40px]"
                      style={{ fontFamily: "'DM Mono', monospace", color: office.mute }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <blockquote className="text-base italic leading-relaxed" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
                    "{row.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
                      {row.display_name}
                    </div>
                    {row.role ? (
                      <div className="text-xs mt-0.5" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                        {row.role}
                      </div>
                    ) : null}
                  </div>
                </>
              )}

              {editingId !== row.id ? (
                <div className="flex flex-wrap gap-2">
                  {row.status !== 'published' ? (
                    <AsyncActionButton
                      disabled={busyId === row.id}
                      onClick={() => onStatus(row, 'published')}
                      className="px-3 py-2 text-xs uppercase tracking-widest min-h-[40px]"
                      style={{ backgroundColor: office.wine, color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}
                    >
                      Approve
                    </AsyncActionButton>
                  ) : null}
                  {row.status !== 'rejected' ? (
                    <AsyncActionButton
                      disabled={busyId === row.id}
                      onClick={() => onStatus(row, 'rejected')}
                      className="px-3 py-2 text-xs uppercase tracking-widest min-h-[40px]"
                      style={{ border: `1px solid ${office.line}`, color: office.wine, fontFamily: "'DM Mono', monospace" }}
                    >
                      Reject
                    </AsyncActionButton>
                  ) : null}
                  {row.status === 'rejected' || row.status === 'published' ? (
                    <AsyncActionButton
                      disabled={busyId === row.id}
                      onClick={() => onStatus(row, 'pending')}
                      className="px-3 py-2 text-xs uppercase tracking-widest min-h-[40px]"
                      style={{ fontFamily: "'DM Mono', monospace", color: office.mute }}
                    >
                      Back to pending
                    </AsyncActionButton>
                  ) : null}
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => startEdit(row)}
                    className="px-3 py-2 text-xs uppercase tracking-widest min-h-[40px]"
                    style={{ fontFamily: "'DM Mono', monospace", color: office.wine }}
                  >
                    Edit
                  </button>
                  <AsyncActionButton
                    disabled={busyId === row.id}
                    onClick={() => onDelete(row)}
                    className="px-3 py-2 text-xs uppercase tracking-widest min-h-[40px]"
                    style={{ fontFamily: "'DM Mono', monospace", color: office.wine }}
                  >
                    Remove
                  </AsyncActionButton>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </OfficePage>
  )
}
