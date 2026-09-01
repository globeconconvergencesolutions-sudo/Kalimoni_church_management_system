import { useEffect, useState } from 'react'
import { fetchPublishedSlots } from '../lib/mediaAdmin'
import { parishImage, parishVideoPoster, type ParishMedia } from '../lib/media'
import { getSlotDef } from '../lib/mediaSlots'

let cachedSlots: Record<string, ParishMedia> | null = null
let loadPromise: Promise<Record<string, ParishMedia>> | null = null

async function loadSlots(): Promise<Record<string, ParishMedia>> {
  const rows = await fetchPublishedSlots()
  const map: Record<string, ParishMedia> = {}
  for (const row of rows) {
    if (row.slot_key) map[row.slot_key] = row
  }
  return map
}

export function useSiteMedia() {
  const [slots, setSlots] = useState<Record<string, ParishMedia>>(cachedSlots ?? {})
  const [ready, setReady] = useState(Boolean(cachedSlots))

  useEffect(() => {
    if (cachedSlots) return
    if (!loadPromise) loadPromise = loadSlots()
    void loadPromise.then(map => {
      cachedSlots = map
      setSlots(map)
      setReady(true)
    })
  }, [])

  const row = (key: string) => slots[key]

  const src = (key: string, fallback: string, width = 800, height?: number): string => {
    const def = getSlotDef(key)
    const fb = fallback || def?.fallback || ''
    const r = row(key)
    const raw = r?.cloudinary_id || r?.url || fb
    if (r?.media_type === 'video') return parishVideoPoster(raw, width, height ?? Math.round(width * 0.56))
    return parishImage(raw, width, height ?? Math.round(width * 0.62))
  }

  const bg = (key: string, fallback: string, width = 1600, height = 800): string => {
    const url = src(key, fallback, width, height)
    return `url(${url})`
  }

  const caption = (key: string): string => {
    const r = row(key)
    if (r?.caption?.trim()) return r.caption.trim()
    return getSlotDef(key)?.defaultCaption ?? ''
  }

  const subtitle = (key: string): string => {
    const r = row(key)
    if (r?.subtitle?.trim()) return r.subtitle.trim()
    return getSlotDef(key)?.defaultSubtitle ?? ''
  }

  const hasCustom = (key: string) => Boolean(row(key))

  return { slots, ready, src, bg, caption, subtitle, hasCustom, row }
}

export function invalidateSiteMediaCache() {
  cachedSlots = null
  loadPromise = null
}
