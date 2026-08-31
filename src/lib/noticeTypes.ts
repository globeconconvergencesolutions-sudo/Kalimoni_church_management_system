export type NoticeSeverity = 'info' | 'urgent'

export interface Notice {
  id: string
  title: string
  body: string
  severity: NoticeSeverity
  pin: boolean
  starts_at: string | null
  ends_at: string | null
  published: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type NoticeDraft = {
  title: string
  body: string
  severity: NoticeSeverity
  pin: boolean
  starts_at: string | null
  ends_at: string | null
  published: boolean
}

export const NOTICE_RAIL_HEIGHT = 40
export const SEEN_NOTICE_KEY = 'kalimoni.lastSeenNoticeId'
