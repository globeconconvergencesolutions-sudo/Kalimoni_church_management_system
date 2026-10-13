import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { fetchStaffEvent, saveStaffEvent, slugify } from '../../lib/cms'
import OfficePage, { OfficeAlert, OfficeButton } from '../../components/office/OfficePage'
import { office } from '../../components/office/officeTheme'
import ParishLoader from '../../components/office/ParishLoader'

const ICONS = ['✦', '✝', '❧', '♦', '◈', '♡']
const COLOURS = ['#6B1A2A', '#4A3A10', '#1A3A4A', '#2A1A4A', '#C8922A', '#2A6B3A']

const empty = {
  slug: '',
  date: '',
  month: '',
  title: '',
  category: 'Parish',
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
  const [ok, setOk] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(isNew)
  const [slugTouched, setSlugTouched] = useState(false)

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
        color: row.color || '#6B1A2A',
        icon: row.icon || '✦',
        published: row.published,
        sortOrder: row.sortOrder,
      })
      setSlugTouched(true)
      setLoaded(true)
    })
  }, [id, isNew])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setOk(null)
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
    if (isNew) {
      navigate('/admin/events')
      return
    }
    setOk('Event saved.')
  }

  if (!loaded) {
    return <ParishLoader caption="Opening event" tone="light" fullscreen={false} />
  }

  const field = office.field

  return (
    <OfficePage
      kicker="Calendar"
      title={isNew ? 'New event' : 'Edit event'}
      lede="Feast days and gatherings for the public calendar — plain fields, no technical clutter."
      back={{ to: '/admin/events', label: 'All events' }}
    >
      {error ? <OfficeAlert tone="error">{error}</OfficeAlert> : null}
      {ok ? <OfficeAlert tone="ok">{ok}</OfficeAlert> : null}

      <form onSubmit={e => { void onSubmit(e) }} className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 sm:p-6 space-y-4" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
          <div>
            <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>Title</label>
            <input
              required
              value={draft.title}
              onChange={e => {
                const title = e.target.value
                setDraft(d => ({ ...d, title, slug: slugTouched ? d.slug : slugify(title) }))
              }}
              className="w-full px-3 py-3 text-base min-h-[48px]"
              style={{ ...field, fontFamily: "'Lora', serif", fontWeight: 600 }}
            />
          </div>
          <div>
            <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>Description</label>
            <textarea required rows={4} value={draft.desc} onChange={e => setDraft(d => ({ ...d, desc: e.target.value }))} className="w-full px-3 py-3 text-sm" style={field} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>Date label</label>
              <input required value={draft.date} onChange={e => setDraft(d => ({ ...d, date: e.target.value }))} placeholder="Oct 1, 2026" className="w-full px-3 py-3 text-sm min-h-[44px]" style={field} />
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>Month filter</label>
              <input required value={draft.month} onChange={e => setDraft(d => ({ ...d, month: e.target.value }))} placeholder="Oct 2026" className="w-full px-3 py-3 text-sm min-h-[44px]" style={field} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>Category</label>
              <input value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))} className="w-full px-3 py-3 text-sm min-h-[44px]" style={field} />
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>Time</label>
              <input value={draft.time} onChange={e => setDraft(d => ({ ...d, time: e.target.value }))} placeholder="10:00 AM" className="w-full px-3 py-3 text-sm min-h-[44px]" style={field} />
            </div>
          </div>
          <div>
            <label className="text-[10px] tracking-widest uppercase block mb-2" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>Colour</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COLOURS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setDraft(d => ({ ...d, color: c }))}
                  className="w-9 h-9"
                  style={{ backgroundColor: c, border: draft.color === c ? `2px solid ${office.gold}` : '2px solid transparent' }}
                  aria-label={`Colour ${c}`}
                />
              ))}
            </div>
            <input type="color" value={draft.color} onChange={e => setDraft(d => ({ ...d, color: e.target.value }))} className="h-10 w-20" />
          </div>
          <div>
            <label className="text-[10px] tracking-widest uppercase block mb-2" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setDraft(d => ({ ...d, icon }))}
                  className="w-11 h-11 text-lg"
                  style={{
                    backgroundColor: draft.icon === icon ? draft.color : '#FAF6F0',
                    color: draft.icon === icon ? '#FAF6F0' : office.burgundy,
                    border: `1px solid ${office.line}`,
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>Web slug</label>
              <input
                value={draft.slug}
                onChange={e => {
                  setSlugTouched(true)
                  setDraft(d => ({ ...d, slug: e.target.value }))
                }}
                placeholder="auto from title"
                className="w-full px-3 py-3 text-sm min-h-[44px]"
                style={field}
              />
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>Sort order</label>
              <input type="number" value={draft.sortOrder} onChange={e => setDraft(d => ({ ...d, sortOrder: Number(e.target.value) }))} className="w-full px-3 py-3 text-sm min-h-[44px]" style={field} />
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="p-5 space-y-4" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
            <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>Publish</p>
            <label className="flex items-start gap-3 text-sm" style={{ color: '#4A3A30' }}>
              <input type="checkbox" className="mt-1" checked={draft.published} onChange={e => setDraft(d => ({ ...d, published: e.target.checked }))} />
              <span>
                <span className="font-semibold block" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
                  {draft.published ? 'Published' : 'Draft'}
                </span>
                <span className="text-xs" style={{ color: office.mute }}>
                  {draft.published ? 'Shown on Events and the homepage.' : 'Hidden until you publish.'}
                </span>
              </span>
            </label>
            <OfficeButton type="submit" disabled={busy} loading={busy}>
              {busy ? 'Saving…' : isNew ? 'Create event' : 'Save changes'}
            </OfficeButton>
            <Link to="/admin/events" className="block text-center text-[10px] tracking-widest uppercase py-2" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
              Cancel
            </Link>
          </div>
          <div className="p-5" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
            <p className="text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>Preview</p>
            <div className="flex gap-3 items-start">
              <div className="w-12 h-12 flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: draft.color, color: '#FAF6F0' }}>
                {draft.icon}
              </div>
              <div>
                <div className="font-semibold" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>{draft.title || 'Event title'}</div>
                <p className="text-sm mt-1" style={{ color: office.mute }}>{draft.date || 'Date'} · {draft.time || 'Time'}</p>
                <p className="text-sm mt-2 line-clamp-3" style={{ color: office.mute }}>{draft.desc || 'Description'}</p>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </OfficePage>
  )
}
