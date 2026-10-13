import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { deleteStaffEvent, fetchStaffEvents, saveStaffEvent, type StaffEvent } from '../../lib/cms'
import OfficePage, { OfficeAlert, OfficeButton } from '../../components/office/OfficePage'
import { useOfficeConfirm } from '../../components/office/useOfficeConfirm'
import { office } from '../../components/office/officeTheme'
import { AsyncActionButton, SkeletonRows } from '../../components/office/OfficeLoaders'

export default function AdminEvents() {
  const { confirm, dialog: confirmDialog } = useOfficeConfirm()
  const [events, setEvents] = useState<StaffEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const [loaded, setLoaded] = useState(false)

  const load = async () => {
    const result = await fetchStaffEvents()
    setEvents(result.events)
    setError(result.error)
  }

  useEffect(() => {
    void load().finally(() => setLoaded(true))
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return events
    const q = query.trim().toLowerCase()
    return events.filter(ev =>
      [ev.title, ev.desc, ev.category, ev.month, ev.date, ev.time].join(' ').toLowerCase().includes(q),
    )
  }, [events, query])

  const onTogglePublish = async (ev: StaffEvent) => {
    setBusyId(ev.dbId)
    setError(null)
    setOk(null)
    const err = await saveStaffEvent({
      dbId: ev.dbId,
      slug: ev.id,
      date: ev.date,
      month: ev.month,
      title: ev.title,
      category: ev.category,
      time: ev.time,
      desc: ev.desc,
      color: ev.color,
      icon: ev.icon,
      published: !ev.published,
      sortOrder: ev.sortOrder,
    })
    setBusyId(null)
    if (err) {
      setError(err)
      return
    }
    setOk(ev.published ? 'Event unpublished.' : 'Event published.')
    await load()
  }

  const onDelete = async (ev: StaffEvent) => {
    const okConfirm = await confirm({
      title: 'Remove this calendar item?',
      description: `"${ev.title}" will be removed from the parish calendar. This cannot be undone.`,
      confirmLabel: 'Remove',
      tone: 'danger',
    })
    if (!okConfirm) return
    setBusyId(ev.dbId)
    setError(null)
    setOk(null)
    const err = await deleteStaffEvent(ev.dbId)
    setBusyId(null)
    if (err) {
      setError(err)
      return
    }
    setOk('Event removed.')
    await load()
  }

  return (
    <OfficePage
      kicker="Calendar"
      title="Parish calendar"
      lede="Feast days and gatherings that appear on the homepage and the Events page."
      action={<OfficeButton to="/admin/events/new">New event</OfficeButton>}
    >
      {confirmDialog}
      {error ? <OfficeAlert tone="error">{error}</OfficeAlert> : null}
      {ok ? <OfficeAlert tone="ok">{ok}</OfficeAlert> : null}

      <div className="mb-5">
        <p className="text-xs mb-2" style={{ color: office.mute }}>
          {events.length} event{events.length === 1 ? '' : 's'} · {events.filter(e => e.published).length} live
        </p>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search events…"
          className="w-full px-3 py-3 text-sm min-h-[44px]"
          style={office.field}
        />
      </div>

      {!loaded ? (
        <SkeletonRows />
      ) : events.length === 0 && !error ? (
        <p className="text-sm" style={{ color: office.mute }}>
          No events yet. Add the next feast day or parish gathering.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm" style={{ color: office.mute }}>No events match this search.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(ev => (
            <div
              key={ev.dbId}
              className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
              style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}
            >
              <div className="flex gap-3 items-start">
                <div
                  className="w-12 h-12 shrink-0 flex items-center justify-center text-lg"
                  style={{ backgroundColor: ev.color || office.wine, color: '#FAF6F0' }}
                  aria-hidden
                >
                  {ev.icon || '✦'}
                </div>
                <div>
                  <div className="flex flex-wrap gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: ev.published ? '#2A6B3A' : '#8A7A70', fontFamily: "'DM Mono', monospace" }}>
                      {ev.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
                      {ev.month}
                    </span>
                  </div>
                  <div className="font-semibold" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>{ev.title}</div>
                  <p className="text-sm mt-1" style={{ color: office.mute }}>{ev.date} · {ev.time}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Link
                  to={`/admin/events/${ev.dbId}`}
                  className="px-3 py-2 text-xs uppercase tracking-widest min-h-[44px] flex items-center"
                  style={{ border: `1px solid ${office.gold}`, color: office.wine, fontFamily: "'DM Mono', monospace" }}
                >
                  Edit
                </Link>
                <AsyncActionButton
                  disabled={busyId === ev.dbId}
                  onClick={() => onTogglePublish(ev)}
                  className="px-3 py-2 text-xs uppercase tracking-widest min-h-[44px]"
                  style={{ border: `1px solid ${office.gold}`, color: office.wine, fontFamily: "'DM Mono', monospace", background: '#fff' }}
                >
                  {ev.published ? 'Unpublish' : 'Publish'}
                </AsyncActionButton>
                <AsyncActionButton
                  disabled={busyId === ev.dbId}
                  onClick={() => onDelete(ev)}
                  className="px-3 py-2 text-xs uppercase tracking-widest min-h-[44px]"
                  style={{ color: office.wine, fontFamily: "'DM Mono', monospace", background: 'none', border: 'none' }}
                >
                  Remove
                </AsyncActionButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </OfficePage>
  )
}
