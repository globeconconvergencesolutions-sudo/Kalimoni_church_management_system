import { useEffect, useState } from 'react'
import { deleteInboxMessage, fetchInbox, inboxTableReady, updateInboxStatus } from '../../lib/inbox'
import type { InboxKind, InboxMessage, InboxStatus } from '../../lib/inboxTypes'
import OfficePage, { OfficeAlert } from '../../components/office/OfficePage'

const FILTERS: Array<{ id: InboxKind | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'contact', label: 'Contact' },
  { id: 'prayer', label: 'Prayer' },
  { id: 'newsletter', label: 'News' },
  { id: 'giving', label: 'Giving' },
]

function kindLabel(kind: string) {
  if (kind === 'prayer') return 'Prayer'
  if (kind === 'newsletter') return 'News'
  if (kind === 'giving') return 'Giving'
  return 'Contact'
}

export default function AdminInbox() {
  const [ready, setReady] = useState<boolean | null>(null)
  const [setup, setSetup] = useState<string | null>(null)
  const [filter, setFilter] = useState<InboxKind | 'all'>('all')
  const [messages, setMessages] = useState<InboxMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    const table = await inboxTableReady()
    setReady(table.ready)
    setSetup(table.message)
    if (!table.ready) return
    const result = await fetchInbox(filter)
    setMessages(result.messages)
    setError(result.error)
  }

  useEffect(() => {
    void load()
  }, [filter])

  const onStatus = async (id: string, status: InboxStatus) => {
    setBusyId(id)
    const err = await updateInboxStatus(id, status)
    setBusyId(null)
    if (err) setError(err)
    else await load()
  }

  const onDelete = async (id: string) => {
    if (!window.confirm('Remove this message from the inbox?')) return
    setBusyId(id)
    const err = await deleteInboxMessage(id)
    setBusyId(null)
    if (err) setError(err)
    else await load()
  }

  return (
    <OfficePage
      kicker="Today"
      title="Parish inbox"
      lede="Contact, prayer, newsletter, and giving notes — a copy is also sent to the parish email."
    >
      {ready === false && setup ? <OfficeAlert>{setup}</OfficeAlert> : null}
      {error ? <OfficeAlert>{error}</OfficeAlert> : null}

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className="px-3 py-2 text-xs uppercase tracking-widest min-h-[40px]"
            style={{
              fontFamily: "'DM Mono', monospace",
              backgroundColor: filter === f.id ? '#6B1A2A' : '#fff',
              color: filter === f.id ? '#E8B84B' : '#6B6259',
              border: filter === f.id ? 'none' : '1px solid #E8DFD0',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {ready && messages.length === 0 && !error ? (
        <p className="text-sm" style={{ color: '#6B6259' }}>No messages yet. Contact, prayer, and newsletter messages will appear here.</p>
      ) : null}

      <div className="flex flex-col gap-3">
        {messages.map(m => (
          <div key={m.id} className="p-4" style={{ backgroundColor: '#fff', border: '1px solid #E8DFD0', opacity: m.status === 'archived' ? 0.65 : 1 }}>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-widest" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
                {kindLabel(m.kind)}
              </span>
              <span className="text-[10px] uppercase tracking-widest" style={{ color: m.status === 'unread' ? '#6B1A2A' : '#8A7A70', fontFamily: "'DM Mono', monospace" }}>
                {m.status}
              </span>
              {m.email_sent ? (
                <span className="text-[10px] uppercase tracking-widest" style={{ color: '#2A6B3A', fontFamily: "'DM Mono', monospace" }}>Mailed</span>
              ) : null}
            </div>
            <div className="font-semibold" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
              {m.name || 'Anonymous'} · {m.email}
            </div>
            {m.subject ? <p className="text-sm mt-1" style={{ color: '#6B1A2A' }}>{m.subject}</p> : null}
            {m.body ? <p className="text-sm mt-2 whitespace-pre-wrap" style={{ color: '#4A3A30' }}>{m.body}</p> : null}
            <div className="text-xs mt-2" style={{ color: '#8A7A70', fontFamily: "'DM Mono', monospace" }}>
              {new Date(m.created_at).toLocaleString()} {m.country ? `· ${m.country}` : ''}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <a
                href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'St. Theresa Parish'}`)}`}
                className="px-3 py-2 text-xs uppercase tracking-widest min-h-[40px] flex items-center"
                style={{ border: '1px solid #C8922A', color: '#6B1A2A', fontFamily: "'DM Mono', monospace" }}
              >
                Reply
              </a>
              {m.status === 'unread' ? (
                <button type="button" disabled={busyId === m.id} onClick={() => { void onStatus(m.id, 'read') }} className="px-3 py-2 text-xs uppercase tracking-widest min-h-[40px]" style={{ fontFamily: "'DM Mono', monospace", color: '#6B1A2A' }}>
                  Mark read
                </button>
              ) : (
                <button type="button" disabled={busyId === m.id} onClick={() => { void onStatus(m.id, 'unread') }} className="px-3 py-2 text-xs uppercase tracking-widest min-h-[40px]" style={{ fontFamily: "'DM Mono', monospace", color: '#6B1A2A' }}>
                  Mark unread
                </button>
              )}
              <button type="button" disabled={busyId === m.id} onClick={() => { void onStatus(m.id, 'archived') }} className="px-3 py-2 text-xs uppercase tracking-widest min-h-[40px]" style={{ fontFamily: "'DM Mono', monospace", color: '#6B1A2A' }}>
                Archive
              </button>
              <button type="button" disabled={busyId === m.id} onClick={() => { void onDelete(m.id) }} className="px-3 py-2 text-xs uppercase tracking-widest min-h-[40px]" style={{ fontFamily: "'DM Mono', monospace", color: '#6B1A2A' }}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </OfficePage>
  )
}
