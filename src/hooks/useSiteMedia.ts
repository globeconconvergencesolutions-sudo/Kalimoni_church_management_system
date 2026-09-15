import { useEffect, useState } from 'react'
import { fetchPublishedSlots } from '../lib/mediaAdmin'
import { cloudinaryVersionFromUrl, parishImage, parishVideoPoster, type ParishMedia } from '../lib/media'
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

function ensureLoad(): Promise<Record<string, ParishMedia>> {
  if (!loadPromise) loadPromise = loadSlots()
  return loadPromise
}

export function useSiteMedia() {
  const [slots, setSlots] = useState<Record<string, ParishMedia>>(cachedSlots ?? {})
  const [ready, setReady] = useState(Boolean(cachedSlots))

  useEffect(() => {
    let cancelled = false
    void ensureLoad().then(map => {
      if (cancelled) return
      cachedSlots = map
      setSlots(map)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const row = (key: string) => slots[key]

  const src = (key: string, fallback: string, width = 800, height?: number): string => {
    const def = getSlotDef(key)
    const fb = fallback || def?.fallback || ''
    const r = row(key)
    // Avoid flashing the Unsplash default while custom slots are still loading
    if (!ready && !r) return ''
    const raw = r?.cloudinary_id || r?.url || fb
    if (!raw) return ''
    const version = cloudinaryVersionFromUrl(r?.url)
    if (r?.media_type === 'video') return parishVideoPoster(raw, width, height ?? Math.round(width * 0.56), version)
    return parishImage(raw, width, height ?? Math.round(width * 0.62), version)
  }

  const bg = (key: string, fallback: string, width = 1600, height = 800): string => {
    const url = src(key, fallback, width, height)
    return url ? `url(${url})` : 'none'
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
