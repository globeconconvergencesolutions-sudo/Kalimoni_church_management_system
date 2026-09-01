import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { fetchStaffEvent, saveStaffEvent, slugify } from '../../lib/cms'
import OfficePage, { OfficeAlert, OfficeButton } from '../../components/office/OfficePage'
import { office } from '../../components/office/officeTheme'

const empty = {
  slug: '',
  date: '',
  month: '',
  title: '',
  category: '',
  time: '',
  desc: '',
  color: '#6B1A2A',
  icon: '✦',
  published: true,
  sortOrder: 0,
}

export default function AdminEventForm() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const [draft, setDraft] = useState(empty)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(isNew)

  useEffect(() => {
    if (isNew || !id) return
    void fetchStaffEvent(id).then(row => {
      if (!row) {
        setError('Event not found.')
        setLoaded(true)
        return
      }
      setDraft({
        slug: row.id,
        date: row.date,
        month: row.month,
        title: row.title,
        category: row.category,
        time: row.time,
        desc: row.desc,
        color: row.color,
        icon: row.icon,
        published: row.published,
        sortOrder: row.sortOrder,
      })
      setLoaded(true)
    })
  }, [id, isNew])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const err = await saveStaffEvent({
      dbId: isNew ? undefined : id,
      slug: draft.slug.trim() || slugify(draft.title),
      date: draft.date.trim(),
      month: draft.month.trim(),
      title: draft.title.trim(),
      category: draft.category.trim(),
      time: draft.time.trim(),
      desc: draft.desc.trim(),
      color: draft.color.trim() || '#6B1A2A',
      icon: draft.icon.trim() || '✦',
      published: draft.published,
      sortOrder: Number(draft.sortOrder) || 0,
    })
    setBusy(false)
    if (err) {
      setError(err)
      return
    }
    navigate('/admin/events')
  }

  if (!loaded) {
    return <p className="text-sm" style={{ color: office.mute }}>Loading event…</p>
  }

  const field = office.field

  return (
    <OfficePage
      kicker="Calendar"
      title={isNew ? 'New event' : 'Edit event'}
      lede="Feast days and gatherings for the public calendar."
      back={{ to: '/admin/events', label: 'All events' }}
    >
      <form onSubmit={e => { void onSubmit(e) }} className="flex flex-col gap-4 max-w-2xl">
        <label className="text-xs" style={{ color: '#6B6259' }}>Title</label>
        <input required value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} className="px-3 py-3 text-sm min-h-[44px]" style={field} />
        <label className="text-xs" style={{ color: '#6B6259' }}>Slug</label>
        <input value={draft.slug} onChange={e => setDraft(d => ({ ...d, slug: e.target.value }))} placeholder="auto from title if empty" className="px-3 py-3 text-sm min-h-[44px]" style={field} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs block mb-1" style={{ color: '#6B6259' }}>Date label</label>
            <input required value={draft.date} onChange={e => setDraft(d => ({ ...d, date: e.target.value }))} placeholder="Oct 1, 2026" className="w-full px-3 py-3 text-sm min-h-[44px]" style={field} />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: '#6B6259' }}>Month filter</label>
            <input required value={draft.month} onChange={e => setDraft(d => ({ ...d, month: e.target.value }))} placeholder="Oct 2026" className="w-full px-3 py-3 text-sm min-h-[44px]" style={field} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs block mb-1" style={{ color: '#6B6259' }}>Category</label>
            <input value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))} className="w-full px-3 py-3 text-sm min-h-[44px]" style={field} />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: '#6B6259' }}>Time label</label>
            <input value={draft.time} onChange={e => setDraft(d => ({ ...d, time: e.target.value }))} className="w-full px-3 py-3 text-sm min-h-[44px]" style={field} />
          </div>
        </div>
        <label className="text-xs" style={{ color: '#6B6259' }}>Description</label>
        <textarea required rows={4} value={draft.desc} onChange={e => setDraft(d => ({ ...d, desc: e.target.value }))} className="px-3 py-3 text-sm" style={field} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs block mb-1" style={{ color: '#6B6259' }}>Colour</label>
            <input value={draft.color} onChange={e => setDraft(d => ({ ...d, color: e.target.value }))} className="w-full px-3 py-3 text-sm min-h-[44px]" style={field} />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: '#6B6259' }}>Icon</label>
            <input value={draft.icon} onChange={e => setDraft(d => ({ ...d, icon: e.target.value }))} className="w-full px-3 py-3 text-sm min-h-[44px]" style={field} />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: '#6B6259' }}>Sort order</label>
            <input type="number" value={draft.sortOrder} onChange={e => setDraft(d => ({ ...d, sortOrder: Number(e.target.value) }))} className="w-full px-3 py-3 text-sm min-h-[44px]" style={field} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm" style={{ color: '#4A3A30' }}>
          <input type="checkbox" checked={draft.published} onChange={e => setDraft(d => ({ ...d, published: e.target.checked }))} />
          Published on the parish website
        </label>
        {error ? <OfficeAlert>{error}</OfficeAlert> : null}
        <OfficeButton type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save event'}
        </OfficeButton>
      </form>
    </OfficePage>
  )
}
