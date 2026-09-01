import { useEffect, useState } from 'react'
import type { Notice } from '../lib/noticeTypes'
import { pickSpotlightNotice, readLastSeenNoticeId, writeLastSeenNoticeId } from '../lib/noticeSpotlight'

interface NoticeSpotlightProps {
  notices: Notice[]
  ready: boolean
}

export default function NoticeSpotlight({ notices, ready }: NoticeSpotlightProps) {
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    if (!ready) return
    const lastSeen = readLastSeenNoticeId()
    setNotice(pickSpotlightNotice(notices, lastSeen))
  }, [notices, ready])

  useEffect(() => {
    if (!notice) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [notice])

  if (!notice) return null

  const dismiss = () => {
    writeLastSeenNoticeId(notice.id)
    setNotice(null)
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 sm:p-8"
      style={{ backgroundColor: 'rgba(28,26,24,0.55)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-spotlight-title"
    >
      <div
        className="w-full max-w-lg p-6 sm:p-8 relative"
        style={{
          backgroundColor: '#FAF6F0',
          borderTop: '4px solid #C8922A',
          boxShadow: '0 24px 80px rgba(28,8,14,0.35)',
        }}
      >
        <div
          className="text-[10px] tracking-[0.22em] uppercase mb-3"
          style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}
        >
          {notice.severity === 'urgent' ? 'Urgent parish notice' : 'Karibu — parish notice'}
        </div>
        <h2
          id="notice-spotlight-title"
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}
        >
          {notice.title}
        </h2>
        {notice.body ? (
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#4A3A30' }}>
            {notice.body}
          </p>
        ) : null}
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={dismiss}
            className="px-5 py-3 text-sm font-semibold min-h-[44px]"
            style={{ backgroundColor: '#6B1A2A', color: '#FAF6F0', fontFamily: "'Lora', serif" }}
          >
            Continue to the parish site
          </button>
        </div>
      </div>
    </div>
  )
}
