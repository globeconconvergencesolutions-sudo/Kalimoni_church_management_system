import { useEffect, useState } from 'react'
import { fetchPublishedEvents } from '../lib/cms'
import { PARISH_EVENTS, type ParishEvent } from '../data/parishEvents'

export function usePublishedEvents() {
  const [events, setEvents] = useState<ParishEvent[]>(PARISH_EVENTS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void fetchPublishedEvents().then(result => {
      setEvents(result.events)
      setReady(true)
    })
  }, [])

  return { events, ready }
}
