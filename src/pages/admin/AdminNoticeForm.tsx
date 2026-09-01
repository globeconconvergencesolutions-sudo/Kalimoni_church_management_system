import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { createNotice, fetchNotice, updateNotice } from '../../lib/notices'
import { getSupabase } from '../../lib/supabase'
import type { NoticeDraft, NoticeSeverity } from '../../lib/noticeTypes'
import OfficePage, { OfficeButton } from '../../components/office/OfficePage'
import { office } from '../../components/office/officeTheme'

function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInput(value: string): string | null {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

const emptyDraft: NoticeDraft = {
  title: '',
  body: '',
  severity: 'info',
  pin: false,
  starts_at: null,
  ends_at: null,
  published: true,
}

export default function AdminNoticeForm() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const [draft, setDraft] = useState<NoticeDraft>(emptyDraft)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(isNew)

  useEffect(() => {
    if (isNew || !id) return
    void fetchNotice(id).then(row => {
      if (!row) {
        setError('Notice not found.')
        setLoaded(true)
        return
      }
      setDraft({
        title: row.title,
        body: row.body,
        severity: row.severity,
        pin: row.pin,
        starts_at: row.starts_at,
        ends_at: row.ends_at,
        published: row.published,
      })
      setLoaded(true)
    })
  }, [id, isNew])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const payload: NoticeDraft = {
      ...draft,
      title: draft.title.trim(),
      body: draft.body.trim(),
    }
    if (!payload.title) {
      setBusy(false)
      setError('Title is required.')
      return
    }

    if (isNew) {
      const userRes = await getSupabase()?.auth.getUser()
      const result = await createNotice(payload, userRes?.data.user?.id ?? null)
      setBusy(false)
      if (result.error) {
        setError(result.error)
        return
      }
      navigate('/admin/notices')
      return
    }

    const result = await updateNotice(id!, payload)
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate('/admin/notices')
  }

  if (!loaded) {
    return <div className="text-sm" style={{ color: office.mute }}>Loading notice…</div>
  }

  return (
    <OfficePage
      kicker="Proclaim"
      title={isNew ? 'New notice' : 'Edit notice'}
      lede="A few clear words for the bar under the parish menu."
      back={{ to: '/admin/notices', label: 'All notices' }}
    >
      <form onSubmit={e => { void onSubmit(e) }} className="flex flex-col gap-4 max-w-2xl">
        <label className="text-xs" style={{ color: '#6B6259' }}>Title</label>
        <input
          required
          value={draft.title}
          onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
          className="px-3 py-3 text-sm min-h-[44px]"
          style={office.field}
        />
        <label className="text-xs" style={{ color: '#6B6259' }}>Body</label>
        <textarea
          rows={5}
          value={draft.body}
          onChange={e => setDraft(d => ({ ...d, body: e.target.value }))}
          className="px-3 py-3 text-sm"
          style={office.field}
        />
        <label className="text-xs" style={{ color: '#6B6259' }}>Severity</label>
        <select
          value={draft.severity}
          onChange={e => setDraft(d => ({ ...d, severity: e.target.value as NoticeSeverity }))}
          className="px-3 py-3 text-sm min-h-[44px]"
          style={office.field}
        >
          <option value="info">Info — gold bar</option>
          <option value="urgent">Urgent — burgundy bar + spotlight</option>
        </select>
        <label className="flex items-center gap-2 text-sm" style={{ color: '#4A3A30' }}>
          <input type="checkbox" checked={draft.pin} onChange={e => setDraft(d => ({ ...d, pin: e.target.checked }))} />
          Pin to the front of the flowing bar
        </label>
        <label className="flex items-center gap-2 text-sm" style={{ color: '#4A3A30' }}>
          <input type="checkbox" checked={draft.published} onChange={e => setDraft(d => ({ ...d, published: e.target.checked }))} />
          Published on the parish website
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs block mb-1" style={{ color: '#6B6259' }}>Starts (optional)</label>
            <input
              type="datetime-local"
              value={toLocalInput(draft.starts_at)}
              onChange={e => setDraft(d => ({ ...d, starts_at: fromLocalInput(e.target.value) }))}
              className="w-full px-3 py-3 text-sm min-h-[44px]"
              style={office.field}
            />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: '#6B6259' }}>Ends (optional)</label>
            <input
              type="datetime-local"
              value={toLocalInput(draft.ends_at)}
              onChange={e => setDraft(d => ({ ...d, ends_at: fromLocalInput(e.target.value) }))}
              className="w-full px-3 py-3 text-sm min-h-[44px]"
              style={office.field}
            />
          </div>
        </div>
        {error ? <p className="text-sm" style={{ color: office.wine }}>{error}</p> : null}
        <OfficeButton type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save notice'}</OfficeButton>
      </form>
    </OfficePage>
  )
}
