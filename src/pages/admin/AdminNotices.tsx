import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { deleteNotice, fetchAllNotices } from '../../lib/notices'
import type { Notice } from '../../lib/noticeTypes'
import OfficePage, { OfficeAlert, OfficeButton } from '../../components/office/OfficePage'
import { office } from '../../components/office/officeTheme'

export default function AdminNotices() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    const result = await fetchAllNotices()
    setNotices(result.notices)
    setError(result.error)
  }

  useEffect(() => {
    void load()
  }, [])

  const onDelete = async (id: string) => {
    if (!window.confirm('Remove this notice from the website?')) return
    setBusyId(id)
    const err = await deleteNotice(id)
    setBusyId(null)
    if (err) {
      setError(err)
      return
    }
    await load()
  }

  return (
    <OfficePage
      kicker="Proclaim"
      title="Parish notices"
      lede="Words parishioners see at the top of the website. Urgent notices also open in a welcome greeting."
      action={<OfficeButton to="/admin/notices/new">New notice</OfficeButton>}
    >
      {error ? <OfficeAlert>{error}</OfficeAlert> : null}
      {notices.length === 0 && !error ? (
        <p className="text-sm" style={{ color: office.mute }}>No notices yet. Write the first one for Sunday.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {notices.map(n => (
            <div key={n.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
              <div>
                <div className="flex flex-wrap gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: n.published ? '#2A6B3A' : '#8A7A70', fontFamily: "'DM Mono', monospace" }}>
                    {n.published ? 'Published' : 'Draft'}
                  </span>
                  {n.pin ? <span className="text-[10px] uppercase tracking-widest" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>Pinned</span> : null}
                  {n.severity === 'urgent' ? <span className="text-[10px] uppercase tracking-widest" style={{ color: office.wine, fontFamily: "'DM Mono', monospace" }}>Urgent</span> : null}
                </div>
                <div className="font-semibold text-lg" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>{n.title}</div>
                {n.body ? <p className="text-sm mt-1 line-clamp-2" style={{ color: office.mute }}>{n.body}</p> : null}
              </div>
              <div className="flex gap-2 shrink-0">
                <Link to={`/admin/notices/${n.id}`} className="px-3 py-2 text-[10px] uppercase tracking-widest min-h-[44px] flex items-center" style={{ border: `1px solid ${office.gold}`, color: office.wine, fontFamily: "'DM Mono', monospace" }}>Edit</Link>
                <button type="button" disabled={busyId === n.id} onClick={() => { void onDelete(n.id) }} className="px-3 py-2 text-[10px] uppercase tracking-widest min-h-[44px]" style={{ color: office.wine, fontFamily: "'DM Mono', monospace" }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </OfficePage>
  )
}
