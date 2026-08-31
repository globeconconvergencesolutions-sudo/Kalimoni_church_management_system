import { useEffect, useState } from 'react'
import type { Notice } from '../lib/noticeTypes'
import { NOTICE_RAIL_HEIGHT } from '../lib/noticeTypes'

interface NoticeRailProps {
  notices: Notice[]
}

export default function NoticeRail({ notices }: NoticeRailProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const onChange = () => setReduceMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    setIndex(0)
  }, [notices.length])

  useEffect(() => {
    if (notices.length < 2 || paused || reduceMotion) return
    const id = window.setInterval(() => {
      setIndex(i => (i + 1) % notices.length)
    }, 7000)
    return () => window.clearInterval(id)
  }, [notices.length, paused, reduceMotion])

  if (!notices.length) return null

  const notice = notices[index] ?? notices[0]
  const urgent = notice.severity === 'urgent'

  return (
    <div
      className="flex items-center gap-3 px-4 sm:px-6 lg:px-8"
      style={{
        height: NOTICE_RAIL_HEIGHT,
        backgroundColor: urgent ? '#6B1A2A' : '#C8922A',
        color: urgent ? '#FAF6F0' : '#1C1A18',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="Parish notices"
      aria-live="polite"
    >
      <span
        className="shrink-0 text-[10px] tracking-[0.18em] uppercase font-medium"
        style={{ fontFamily: "'DM Mono', monospace", opacity: 0.85 }}
      >
        {urgent ? 'Urgent' : notice.pin ? 'Pinned' : 'Notice'}
      </span>
      <p
        className="flex-1 min-w-0 text-xs sm:text-sm truncate"
        style={{ fontFamily: "'Lora', serif" }}
        title={notice.body ? `${notice.title} — ${notice.body}` : notice.title}
      >
        {notice.title}
        {notice.body ? (
          <span className="hidden sm:inline" style={{ opacity: 0.8 }}>
            {' '}
            — {notice.body}
          </span>
        ) : null}
      </p>
      {notices.length > 1 && (
        <div className="flex items-center gap-1 shrink-0">
          {notices.map((n, i) => (
            <button
              key={n.id}
              type="button"
              aria-label={`Show notice ${i + 1}`}
              onClick={() => setIndex(i)}
              className="rounded-full"
              style={{
                width: 6,
                height: 6,
                backgroundColor: i === index ? (urgent ? '#E8B84B' : '#4A1019') : 'rgba(0,0,0,0.25)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
