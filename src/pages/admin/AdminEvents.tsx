import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { deleteStaffEvent, fetchStaffEvents, type StaffEvent } from '../../lib/cms'

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
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
            Sprint 2
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
            Parish calendar
          </h1>
          <p className="text-sm mt-2 max-w-xl" style={{ color: '#6B6259' }}>
            Published events appear on the home strip and the Events page.
          </p>
        </div>
        <Link
          to="/admin/events/new"
          className="px-4 py-3 text-sm font-semibold shrink-0 min-h-[44px] flex items-center"
          style={{ backgroundColor: '#6B1A2A', color: '#FAF6F0' }}
        >
          New event
        </Link>
      </div>

      {error ? (
        <div className="p-4 mb-6 text-sm" style={{ backgroundColor: '#F0E8D8', color: '#6B1A2A' }}>
          {error}
        </div>
      ) : null}

      {events.length === 0 && !error ? (
        <p className="text-sm" style={{ color: '#6B6259' }}>
          No events in the database yet. Import prototype content, or add the first feast day here.
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
    </div>
  )
}
