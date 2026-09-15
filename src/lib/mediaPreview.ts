import { getSlotDef } from '../lib/mediaSlots'

/** DOM id for a media placement — used by admin "View" and deep links. */
export function mediaSlotDomId(slotKey: string): string {
  return `media-slot-${slotKey.replace(/\./g, '__')}`
}

export function mediaSlotKeyFromDomId(id: string): string | null {
  if (!id.startsWith('media-slot-')) return null
  return id.slice('media-slot-'.length).replace(/__/g, '.')
}

export function mediaSlotViewUrl(slotKey: string, origin = typeof window !== 'undefined' ? window.location.origin : ''): string {
  const def = getSlotDef(slotKey)
  if (!def) return `${origin}/`
  const hash = def.viewHash || mediaSlotDomId(slotKey)
  const qs = new URLSearchParams({ mediaSlot: slotKey })
  return `${origin}${def.viewPath}?${qs.toString()}#${hash}`
}

/**
 * Scroll to a media placement after the SPA has painted.
 * Retries briefly because images/sections mount asynchronously.
 */
export function scrollToMediaSlot(slotKey: string, opts?: { highlight?: boolean }): void {
  const def = getSlotDef(slotKey)
  const hash = def?.viewHash || mediaSlotDomId(slotKey)
  const tryScroll = (attempt: number) => {
    const byData = document.querySelector(`[data-media-slot="${CSS.escape(slotKey)}"]`) as HTMLElement | null
    const byId = document.getElementById(hash) || document.getElementById(mediaSlotDomId(slotKey))
    const el = byData || byId
    if (!el) {
      if (attempt < 12) window.setTimeout(() => tryScroll(attempt + 1), 80 + attempt * 40)
      return
    }
    const top = el.getBoundingClientRect().top + window.scrollY - 96
    window.scrollTo({ top: Math.max(0, top), behavior: attempt === 0 ? 'auto' : 'smooth' })
    if (opts?.highlight !== false) {
      el.classList.add('media-slot-highlight')
      window.setTimeout(() => el.classList.remove('media-slot-highlight'), 2600)
    }
  }
  tryScroll(0)
}

export function readMediaSlotFromLocation(search: string, hash: string): string | null {
  try {
    const params = new URLSearchParams(search)
    const fromQuery = params.get('mediaSlot')
    if (fromQuery) return fromQuery
  } catch {
    /* ignore */
  }
  const raw = hash.replace(/^#/, '')
  if (!raw) return null
  const fromId = mediaSlotKeyFromDomId(raw)
  if (fromId) return fromId
  if (raw === 'parish-life') return 'home.parish-life.01'
  if (raw === 'mission') return 'home.mission-banner'
  return null
}
