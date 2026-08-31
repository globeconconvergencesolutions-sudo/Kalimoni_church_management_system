import { useEffect, useState } from 'react'
import { fetchEucharistSlots, fetchMassList } from '../lib/cms'
import { EUCHARIST_SLOTS, MASS_LIST_ROWS, type EucharistSlot, type MassListRow } from '../data/massSchedule'

export function useMassSchedule() {
  const [list, setList] = useState<MassListRow[]>(MASS_LIST_ROWS)
  const [slots, setSlots] = useState<EucharistSlot[]>(EUCHARIST_SLOTS)

  useEffect(() => {
    void Promise.all([fetchMassList(), fetchEucharistSlots()]).then(([rows, eucharist]) => {
      setList(rows)
      setSlots(eucharist)
    })
  }, [])

  return { list, slots }
}
