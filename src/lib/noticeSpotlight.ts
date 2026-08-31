import { SEEN_NOTICE_KEY, type Notice } from './noticeTypes'

export function pickSpotlightNotice(notices: Notice[], lastSeenId: string | null): Notice | null {
  if (!notices.length) return null

  const pinned = notices.find(n => n.pin)
  const urgentUnseen = notices.find(n => n.severity === 'urgent' && n.id !== lastSeenId)

  if (!lastSeenId) {
    return pinned || urgentUnseen || notices[0]
  }

  if (urgentUnseen) return urgentUnseen
  if (pinned && pinned.id !== lastSeenId && pinned.severity === 'urgent') return pinned
  return null
}

export function readLastSeenNoticeId(): string | null {
  try {
    return window.localStorage.getItem(SEEN_NOTICE_KEY)
  } catch {
    return null
  }
}

export function writeLastSeenNoticeId(id: string) {
  try {
    window.localStorage.setItem(SEEN_NOTICE_KEY, id)
  } catch {
    /* private mode */
  }
}
