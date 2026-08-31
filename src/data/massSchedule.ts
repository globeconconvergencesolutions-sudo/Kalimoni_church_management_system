export interface EucharistSlot {
  weekday: number
  minutesFromMidnight: number
  displayTime: string
}

export interface MassListRow {
  label: string
  times: string
}

export const EUCHARIST_SLOTS: EucharistSlot[] = [
  { weekday: 0, minutesFromMidnight: 450, displayTime: '7:30 AM' },
  { weekday: 0, minutesFromMidnight: 570, displayTime: '9:30 AM' },
  { weekday: 1, minutesFromMidnight: 1080, displayTime: '6:00 PM' },
  { weekday: 2, minutesFromMidnight: 420, displayTime: '7:00 AM' },
  { weekday: 3, minutesFromMidnight: 1080, displayTime: '6:00 PM' },
  { weekday: 4, minutesFromMidnight: 420, displayTime: '7:00 AM' },
  { weekday: 5, minutesFromMidnight: 420, displayTime: '7:00 AM' },
  { weekday: 6, minutesFromMidnight: 420, displayTime: '7:00 AM' },
]

export const MASS_LIST_ROWS: MassListRow[] = [
  { label: 'Sunday', times: '7:30 AM · 9:30 AM' },
  { label: 'Tue · Thu · Fri · Sat', times: '7:00 AM' },
  { label: 'Mon · Wed (Evening)', times: '6:00 PM' },
  { label: 'Adoration (Thu)', times: '6:00 – 7:00 PM' },
  { label: '1st Friday Vigil', times: '8:00 PM' },
  { label: 'Confession', times: '30 min before Mass' },
]

export function computeNextMass(slots: EucharistSlot[] = EUCHARIST_SLOTS): { displayDay: string; time: string; isImminent: boolean } {
  const now = new Date()
  const kenyaDate = new Date(now.getTime() + 3 * 60 * 60 * 1000)
  const dow = kenyaDate.getUTCDay()
  const currentMin = kenyaDate.getUTCHours() * 60 + kenyaDate.getUTCMinutes()
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  for (let offset = 0; offset < 8; offset++) {
    const targetDay = (dow + offset) % 7
    for (const slot of slots) {
      if (slot.weekday !== targetDay) continue
      if (offset === 0 && slot.minutesFromMidnight <= currentMin) continue
      const diffMin = offset * 24 * 60 + slot.minutesFromMidnight - currentMin
      const displayDay = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : DAY_NAMES[targetDay]
      return { displayDay, time: slot.displayTime, isImminent: diffMin <= 90 }
    }
  }
  return { displayDay: 'Sunday', time: '7:30 AM', isImminent: false }
}
