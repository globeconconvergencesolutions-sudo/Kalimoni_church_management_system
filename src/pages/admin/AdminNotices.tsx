import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { deleteNotice, fetchAllNotices, updateNotice } from '../../lib/notices'
import type { Notice } from '../../lib/noticeTypes'
import OfficePage, { OfficeAlert, OfficeButton } from '../../components/office/OfficePage'
import { useOfficeConfirm } from '../../components/office/useOfficeConfirm'
import { office } from '../../components/office/officeTheme'
import { AsyncActionButton, SkeletonRows } from '../../components/office/OfficeLoaders'

export default function AdminNotices() {
  const { confirm, dialog: confirmDialog } = useOfficeConfirm()
  const [notices, setNotices] = useState<Notice[]>([])
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const [loaded, setLoaded] = useState(false)

  const load = async () => {
    const result = await fetchAllNotices()
    setNotices(result.notices)
    setError(result.error)
  }

  useEffect(() => {
    void load().finally(() => setLoaded(true))
  }, [])

  const onTogglePublish = async (n: Notice) => {
    setBusyId(n.id)
    setError(null)
    setOk(null)
    const result = await updateNotice(n.id, {
      title: n.title,
      body: n.body,
      severity: n.severity,
      pin: n.pin,
      starts_at: n.starts_at,
      ends_at: n.ends_at,
      published: !n.published,
    })
    setBusyId(null)
    if (result.error) {
      setError(result.error)
      return
    }
    setOk(n.published ? 'Notice unpublished.' : 'Notice published.')
    await load()
  }

  const onDelete = async (n: Notice) => {
    const okConfirm = await confirm({
      title: 'Remove this notice?',
      description: `"${n.title}" will disappear from the notice bar. This cannot be undone.`,
      confirmLabel: 'Remove',
      tone: 'danger',
    })
    if (!okConfirm) return
    setBusyId(n.id)
    setError(null)
    setOk(null)
    const err = await deleteNotice(n.id)
    setBusyId(null)
    if (err) {
      setError(err)
      return
    }
    setOk('Notice removed.')
    await load()
  }

  const liveCount = notices.filter(n => n.published).length

  return (
    <OfficePage
      kicker="Proclaim"
      title="Parish notices"
      lede="Words parishioners see at the top of the website. Urgent notices also open in a welcome greeting."
      action={<OfficeButton to="/admin/notices/new">New notice</OfficeButton>}
    >
      {confirmDialog}
      {error ? <OfficeAlert tone="error">{error}</OfficeAlert> : null}
      {ok ? <OfficeAlert tone="ok">{ok}</OfficeAlert> : null}

      <p className="text-xs mb-4" style={{ color: office.mute }}>
        {notices.length} notice{notices.length === 1 ? '' : 's'} · {liveCount} live on the site
      </p>

      {!loaded ? (
        <SkeletonRows />
      ) : notices.length === 0 && !error ? (
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
              <div className="flex flex-wrap gap-2 shrink-0">
                <Link to={`/admin/notices/${n.id}`} className="px-3 py-2 text-[10px] uppercase tracking-widest min-h-[44px] flex items-center" style={{ border: `1px solid ${office.gold}`, color: office.wine, fontFamily: "'DM Mono', monospace" }}>Edit</Link>
                <AsyncActionButton
                  disabled={busyId === n.id}
                  onClick={() => onTogglePublish(n)}
                  className="px-3 py-2 text-[10px] uppercase tracking-widest min-h-[44px]"
                  style={{ border: `1px solid ${office.gold}`, color: office.wine, fontFamily: "'DM Mono', monospace", background: '#fff' }}
                >
                  {n.published ? 'Unpublish' : 'Publish'}
                </AsyncActionButton>
                <AsyncActionButton
                  disabled={busyId === n.id}
                  onClick={() => onDelete(n)}
                  className="px-3 py-2 text-[10px] uppercase tracking-widest min-h-[44px]"
                  style={{ color: office.wine, fontFamily: "'DM Mono', monospace", background: 'none', border: 'none' }}
                >
                  Remove
                </AsyncActionButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </OfficePage>
  )
}
