export type InboxKind = 'contact' | 'prayer' | 'newsletter' | 'giving'
export type InboxStatus = 'unread' | 'read' | 'archived'

export type InboxPayload = {
  kind: InboxKind
  name?: string
  email: string
  country?: string
  subject?: string
  body?: string
  website?: string
}

export type InboxMessage = InboxPayload & {
  id: string
  status: InboxStatus
  email_sent: boolean
  created_at: string
}

export const INBOX_KINDS: InboxKind[] = ['contact', 'prayer', 'newsletter', 'giving']

export function isInboxKind(value: string): value is InboxKind {
  return (INBOX_KINDS as string[]).includes(value)
}
