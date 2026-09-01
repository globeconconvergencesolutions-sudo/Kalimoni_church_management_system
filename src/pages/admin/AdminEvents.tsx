import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { deleteStaffEvent, fetchStaffEvents, type StaffEvent } from '../../lib/cms'
import OfficePage, { OfficeAlert, OfficeButton } from '../../components/office/OfficePage'

export default function AdminEvents() {
  const [events, setEvents] = useState<StaffEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    const result = await fetchStaffEvents()
    setEvents(result.events)
    setError(result.error)
  }

  useEffect(() => {
    void load()
  }, [])

  const onDelete = async (id: string) => {
    if (!window.confirm('Remove this calendar item?')) return
    setBusyId(id)
    const err = await deleteStaffEvent(id)
    setBusyId(null)
    if (err) {
      setError(err)
      return
    }
    await load()
  }

  return (
    <OfficePage
      kicker="Calendar"
      title="Parish calendar"
      lede="Feast days and gatherings that appear on the homepage and the Events page."
      action={<OfficeButton to="/admin/events/new">New event</OfficeButton>}
    >
      {error ? <OfficeAlert>{error}</OfficeAlert> : null}

      {events.length === 0 && !error ? (
        <p className="text-sm" style={{ color: '#6B6259' }}>
          No events yet. Add the next feast day or parish gathering.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map(ev => (
            <div
              key={ev.dbId}
              className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
              style={{ backgroundColor: '#fff', border: '1px solid #E8DFD0' }}
            >
              <div>
                <div className="flex flex-wrap gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: ev.published ? '#2A6B3A' : '#8A7A70', fontFamily: "'DM Mono', monospace" }}>
                    {ev.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
                    {ev.month}
                  </span>
                </div>
                <div className="font-semibold" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>{ev.title}</div>
                <p className="text-sm mt-1" style={{ color: '#6B6259' }}>{ev.date} · {ev.time}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  to={`/admin/events/${ev.dbId}`}
                  className="px-3 py-2 text-xs uppercase tracking-widest min-h-[44px] flex items-center"
                  style={{ border: '1px solid #C8922A', color: '#6B1A2A', fontFamily: "'DM Mono', monospace" }}
                >
                  Edit
                </Link>
                <button
                  type="button"
                  disabled={busyId === ev.dbId}
                  onClick={() => { void onDelete(ev.dbId) }}
                  className="px-3 py-2 text-xs uppercase tracking-widest min-h-[44px]"
                  style={{ color: '#6B1A2A', fontFamily: "'DM Mono', monospace" }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </OfficePage>
  )
}
