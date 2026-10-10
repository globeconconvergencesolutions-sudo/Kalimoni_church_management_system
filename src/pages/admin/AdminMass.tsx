import { useEffect, useState, type FormEvent } from 'react'
import { deleteStaffMassSlot, fetchStaffMassSlots, saveStaffMassSlot, type StaffMassSlot } from '../../lib/cms'
import OfficePage, { OfficeAlert, OfficeButton } from '../../components/office/OfficePage'
import { useOfficeConfirm } from '../../components/office/useOfficeConfirm'
import { office } from '../../components/office/officeTheme'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type Draft = Omit<StaffMassSlot, 'id'> & { id?: string }

const blank: Draft = {
  weekday: 0,
  minutesFromMidnight: 450,
  displayTime: '7:30 AM',
  displayLabel: 'Sunday',
  kind: 'eucharist',
  listGroup: null,
  sortOrder: 0,
  published: true,
}

function minutesToClock(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) return '07:30'
  const m = Math.max(0, Math.min(23 * 60 + 59, Math.round(minutes)))
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

function clockToMinutes(clock: string): number {
  const [hRaw, mRaw] = clock.split(':')
  const h = Number(hRaw)
  const min = Number(mRaw)
  if (Number.isNaN(h) || Number.isNaN(min)) return 450
  return Math.max(0, Math.min(23, h)) * 60 + Math.max(0, Math.min(59, min))
}

function minutesToDisplay(minutes: number): string {
  const h24 = Math.floor(minutes / 60)
  const min = minutes % 60
  const period = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(min).padStart(2, '0')} ${period}`
}

function slotToDraft(slot: StaffMassSlot): Draft {
  return {
    id: slot.id,
    weekday: slot.weekday,
    minutesFromMidnight: slot.minutesFromMidnight,
    displayTime: slot.displayTime,
    displayLabel: slot.displayLabel,
    kind: slot.kind,
    listGroup: slot.listGroup,
    sortOrder: slot.sortOrder,
    published: slot.published,
  }
}

export default function AdminMass() {
  const { confirm, dialog: confirmDialog } = useOfficeConfirm()
  const [slots, setSlots] = useState<StaffMassSlot[]>([])
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(blank)
  const [busy, setBusy] = useState(false)

  const editing = Boolean(draft.id)

  const load = async () => {
    const result = await fetchStaffMassSlots()
    setSlots(result.slots)
    setError(result.error)
  }

  useEffect(() => {
    void load()
  }, [])

  const resetForm = () => setDraft(blank)

  const onSave = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setOk(null)

    const displayTime = draft.displayTime.trim()
    if (!displayTime) {
      setBusy(false)
      setError('Display time is required.')
      return
    }

    const payload: Draft = {
      ...draft,
      displayTime,
      displayLabel:
        draft.kind === 'eucharist'
          ? DAYS[draft.weekday ?? 0] || displayTime
          : draft.displayLabel.trim() || displayTime,
      weekday: draft.kind === 'eucharist' ? draft.weekday : null,
      minutesFromMidnight: draft.kind === 'eucharist' ? draft.minutesFromMidnight : null,
      listGroup: draft.kind === 'other' ? draft.listGroup || 'regular' : null,
    }

    const err = await saveStaffMassSlot(payload)
    setBusy(false)
    if (err) {
      setError(err)
      return
    }
    setOk(editing ? 'Mass time updated.' : 'Mass time added.')
    resetForm()
    await load()
  }

  const onToggle = async (slot: StaffMassSlot) => {
    setError(null)
    setOk(null)
    const err = await saveStaffMassSlot({ ...slotToDraft(slot), published: !slot.published })
    if (err) setError(err)
    else {
      setOk(slot.published ? 'Mass time unpublished.' : 'Mass time published.')
      await load()
    }
  }

  const onEdit = (slot: StaffMassSlot) => {
    setError(null)
    setOk(null)
    setDraft(slotToDraft(slot))
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const onDelete = async (id: string, label: string) => {
    const okConfirm = await confirm({
      title: 'Remove this Mass time?',
      description: `"${label}" will be removed from the countdown and schedule lists. This cannot be undone.`,
      confirmLabel: 'Remove',
      tone: 'danger',
    })
    if (!okConfirm) return
    setError(null)
    setOk(null)
    const err = await deleteStaffMassSlot(id)
    if (err) setError(err)
    else {
      if (draft.id === id) resetForm()
      setOk('Mass time removed.')
      await load()
    }
  }

  const field = office.field
  const eucharistCount = slots.filter(s => s.kind === 'eucharist').length
  const listCount = slots.filter(s => s.kind !== 'eucharist').length

  return (
    <OfficePage
      kicker="Calendar"
      title="Mass times"
      lede="Eucharist rows drive the Next Mass countdown. List rows appear on Events and Contact. Edit any row below, or add a new one."
    >
      {confirmDialog}
      {error ? <OfficeAlert tone="error">{error}</OfficeAlert> : null}
      {ok ? <OfficeAlert tone="ok">{ok}</OfficeAlert> : null}

      <form
        onSubmit={e => { void onSave(e) }}
        className="p-4 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3"
        style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}
      >
        <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
              {editing ? 'Edit Mass time' : 'Add a Mass time'}
            </p>
            <p className="text-xs mt-1" style={{ color: office.mute }}>
              {eucharistCount} countdown slot{eucharistCount === 1 ? '' : 's'} · {listCount} schedule list row{listCount === 1 ? '' : 's'}
            </p>
          </div>
          {editing ? (
            <button
              type="button"
              onClick={resetForm}
              className="text-[10px] tracking-widest uppercase min-h-[36px]"
              style={{ color: office.mute, fontFamily: "'DM Mono', monospace", background: 'none', border: 'none' }}
            >
              Cancel edit
            </button>
          ) : null}
        </div>

        <select
          value={draft.kind}
          onChange={e =>
            setDraft(d => ({
              ...d,
              kind: e.target.value,
              listGroup: e.target.value === 'other' ? d.listGroup || 'regular' : null,
              displayLabel: e.target.value === 'eucharist' ? DAYS[d.weekday ?? 0] : d.displayLabel,
            }))
          }
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
              onChange={e => {
                const weekday = Number(e.target.value)
                setDraft(d => ({ ...d, weekday, displayLabel: DAYS[weekday] }))
              }}
              className="px-3 py-3 text-sm min-h-[44px]"
              style={field}
            >
              {DAYS.map((name, i) => (
                <option key={name} value={i}>{name}</option>
              ))}
            </select>
            <div>
              <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                Clock time
              </label>
              <input
                type="time"
                required
                value={minutesToClock(draft.minutesFromMidnight)}
                onChange={e => {
                  const minutes = clockToMinutes(e.target.value)
                  setDraft(d => ({
                    ...d,
                    minutesFromMidnight: minutes,
                    displayTime: minutesToDisplay(minutes),
                  }))
                }}
                className="w-full px-3 py-3 text-sm min-h-[44px]"
                style={field}
              />
            </div>
          </>
        ) : (
          <input
            required
            value={draft.displayLabel}
            onChange={e => setDraft(d => ({ ...d, displayLabel: e.target.value, weekday: null, minutesFromMidnight: null }))}
            placeholder="Label (e.g. Sunday / Weekdays)"
            className="px-3 py-3 text-sm min-h-[44px]"
            style={field}
          />
        )}

        <div>
          <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
            Display time
          </label>
          <input
            required
            value={draft.displayTime}
            onChange={e => setDraft(d => ({ ...d, displayTime: e.target.value }))}
            placeholder="How it reads on the website"
            className="w-full px-3 py-3 text-sm min-h-[44px]"
            style={field}
          />
        </div>

        <div>
          <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
            Sort order
          </label>
          <input
            type="number"
            value={draft.sortOrder}
            onChange={e => setDraft(d => ({ ...d, sortOrder: Number(e.target.value) }))}
            className="w-full px-3 py-3 text-sm min-h-[44px]"
            style={field}
          />
        </div>

        <label className="flex items-center gap-2 text-sm sm:col-span-2" style={{ color: '#4A3A30' }}>
          <input
            type="checkbox"
            checked={draft.published}
            onChange={e => setDraft(d => ({ ...d, published: e.target.checked }))}
          />
          Published on the parish website
        </label>

        <div className="sm:col-span-2 flex flex-wrap gap-2">
          <OfficeButton type="submit" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Add Mass time'}
          </OfficeButton>
          {editing ? (
            <OfficeButton type="button" variant="ghost" disabled={busy} onClick={resetForm}>
              Clear form
            </OfficeButton>
          ) : null}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {slots.length === 0 && !error ? (
          <p className="text-sm" style={{ color: office.mute }}>No Mass times yet. Add the first Eucharist slot above.</p>
        ) : null}
        {slots.map(slot => {
          const label =
            slot.kind === 'eucharist' && slot.weekday !== null
              ? `${DAYS[slot.weekday]} · ${slot.displayTime}`
              : `${slot.displayLabel} · ${slot.displayTime}`
          const active = draft.id === slot.id
          return (
            <div
              key={slot.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              style={{
                backgroundColor: '#fff',
                border: `1px solid ${active ? office.gold : office.line}`,
              }}
            >
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
                  {slot.kind} {slot.published ? '· published' : '· draft'}
                  {slot.kind === 'eucharist' && slot.minutesFromMidnight !== null
                    ? ` · ${minutesToClock(slot.minutesFromMidnight)}`
                    : ''}
                  {active ? ' · editing' : ''}
                </div>
                <div className="font-semibold" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
                  {label}
                </div>
                <p className="text-xs mt-1" style={{ color: office.mute }}>
                  Sort {slot.sortOrder}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(slot)}
                  className="px-3 py-2 text-xs uppercase tracking-widest min-h-[44px]"
                  style={{ border: `1px solid ${office.gold}`, color: office.wine, fontFamily: "'DM Mono', monospace", background: active ? '#FAF6F0' : '#fff' }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => { void onToggle(slot) }}
                  className="px-3 py-2 text-xs uppercase tracking-widest min-h-[44px]"
                  style={{ border: `1px solid ${office.gold}`, color: office.wine, fontFamily: "'DM Mono', monospace", background: '#fff' }}
                >
                  {slot.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => { void onDelete(slot.id, label) }}
                  className="px-3 py-2 text-xs uppercase tracking-widest min-h-[44px]"
                  style={{ color: office.wine, fontFamily: "'DM Mono', monospace", background: 'none', border: 'none' }}
                >
                  Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </OfficePage>
  )
}
