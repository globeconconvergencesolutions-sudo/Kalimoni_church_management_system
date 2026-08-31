import { useCallback, useEffect, useState } from 'react'
import { fetchLiveNotices } from '../lib/notices'
import type { Notice } from '../lib/noticeTypes'

export function useLiveNotices() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [ready, setReady] = useState(false)

  const load = useCallback(async () => {
    const rows = await fetchLiveNotices()
    setNotices(rows)
    setReady(true)
  }, [])

  useEffect(() => {
    void load()
    const id = window.setInterval(() => { void load() }, 60_000)
    const onFocus = () => { void load() }
    window.addEventListener('focus', onFocus)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [load])

  return { notices, ready, reload: load }
}
