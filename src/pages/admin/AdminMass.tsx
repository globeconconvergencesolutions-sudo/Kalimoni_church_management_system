import { useEffect, useState, type FormEvent } from 'react'
import { deleteStaffMassSlot, fetchStaffMassSlots, saveStaffMassSlot, type StaffMassSlot } from '../../lib/cms'
import OfficePage, { OfficeAlert, OfficeButton } from '../../components/office/OfficePage'
import { office } from '../../components/office/officeTheme'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const blank: Omit<StaffMassSlot, 'id'> & { id?: string } = {
  weekday: 0,
  minutesFromMidnight: 450,
  displayTime: '7:30 AM',
  displayLabel: 'Sunday',
  kind: 'eucharist',
  listGroup: null,
  sortOrder: 0,
  published: true,
}

export default function AdminMass() {
  const [slots, setSlots] = useState<StaffMassSlot[]>([])
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState(blank)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    const result = await fetchStaffMassSlots()
    setSlots(result.slots)
    setError(result.error)
  }

  useEffect(() => {
    void load()
  }, [])

  const onAdd = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const err = await saveStaffMassSlot({
      ...draft,
      displayTime: draft.displayTime.trim(),
      displayLabel: draft.kind === 'eucharist' ? draft.displayTime.trim() : draft.displayLabel.trim(),
      weekday: draft.kind === 'eucharist' ? draft.weekday : null,
      minutesFromMidnight: draft.kind === 'eucharist' ? draft.minutesFromMidnight : null,
      listGroup: draft.kind === 'other' ? 'regular' : null,
    })
    setBusy(false)
    if (err) {
      setError(err)
      return
    }
    setDraft(blank)
    await load()
  }

  const onToggle = async (slot: StaffMassSlot) => {
    const err = await saveStaffMassSlot({ ...slot, published: !slot.published })
    if (err) setError(err)
    else await load()
  }

  const onDelete = async (id: string) => {
    if (!window.confirm('Remove this Mass time?')) return
    const err = await deleteStaffMassSlot(id)
    if (err) setError(err)
    else await load()
  }

  const field = office.field

  return (
    <OfficePage
      kicker="Calendar"
      title="Mass times"
      lede="Eucharist rows drive the Next Mass countdown. List rows appear on Events and Contact."
    >
      {error ? <OfficeAlert>{error}</OfficeAlert> : null}

      <form onSubmit={e => { void onAdd(e) }} className="p-4 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ backgroundColor: '#fff', border: '1px solid #E8DFD0' }}>
        <label className="text-xs sm:col-span-2" style={{ color: '#6B6259' }}>Add a slot</label>
        <select
          value={draft.kind}
          onChange={e => setDraft(d => ({ ...d, kind: e.target.value, listGroup: e.target.value === 'other' ? 'regular' : null }))}
          className="px-3 py-3 text-sm min-h-[44px]"
          style={field}
        >
          <option value="eucharist">Eucharist (countdown)</option>
          <option value="other">Schedule list row</option>
        </select>
        {draft.kind === 'eucharist' ? (
          <>
            <select
              value={draft.weekday ?? 0}
              onChange={e => setDraft(d => ({ ...d, weekday: Number(e.target.value) }))}
              className="px-3 py-3 text-sm min-h-[44px]"
              style={field}
            >
              {DAYS.map((name, i) => (
                <option key={name} value={i}>{name}</option>
              ))}
            </select>
            <input
              type="number"
              required
              value={draft.minutesFromMidnight ?? 0}
              onChange={e => setDraft(d => ({ ...d, minutesFromMidnight: Number(e.target.value) }))}
              placeholder="Minutes from midnight (450 = 7:30 AM)"
              className="px-3 py-3 text-sm min-h-[44px]"
              style={field}
            />
          </>
        ) : (
          <input
            required
            value={draft.displayLabel}
            onChange={e => setDraft(d => ({ ...d, displayLabel: e.target.value, weekday: null, minutesFromMidnight: null }))}
            placeholder="Label (e.g. Sunday)"
            className="px-3 py-3 text-sm min-h-[44px] sm:col-span-2"
            style={field}
          />
        )}
        <input
          required
          value={draft.displayTime}
          onChange={e => setDraft(d => ({ ...d, displayTime: e.target.value }))}
          placeholder="Display time"
          className="px-3 py-3 text-sm min-h-[44px]"
          style={field}
        />
        <input
          type="number"
          value={draft.sortOrder}
          onChange={e => setDraft(d => ({ ...d, sortOrder: Number(e.target.value) }))}
          className="px-3 py-3 text-sm min-h-[44px]"
          style={field}
        />
        <div className="sm:col-span-2">
          <OfficeButton type="submit" disabled={busy}>{busy ? 'Saving…' : 'Add Mass time'}</OfficeButton>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {slots.map(slot => (
          <div key={slot.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ backgroundColor: '#fff', border: '1px solid #E8DFD0' }}>
            <div>
              <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
                {slot.kind} {slot.published ? '· published' : '· draft'}
              </div>
              <div className="font-semibold" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
                {slot.kind === 'eucharist' && slot.weekday !== null
                  ? `${DAYS[slot.weekday]} · ${slot.displayTime}`
                  : `${slot.displayLabel} · ${slot.displayTime}`}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { void onToggle(slot) }} className="px-3 py-2 text-xs uppercase tracking-widest min-h-[44px]" style={{ border: '1px solid #C8922A', color: '#6B1A2A', fontFamily: "'DM Mono', monospace" }}>
                {slot.published ? 'Unpublish' : 'Publish'}
              </button>
              <button type="button" onClick={() => { void onDelete(slot.id) }} className="px-3 py-2 text-xs uppercase tracking-widest min-h-[44px]" style={{ color: '#6B1A2A', fontFamily: "'DM Mono', monospace" }}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </OfficePage>
  )
}
