import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { office } from './officeTheme'

export default function OfficePage({
  kicker,
  title,
  lede,
  action,
  back,
  wide,
  children,
}: {
  kicker?: string
  title: string
  lede?: string
  action?: ReactNode
  back?: { to: string; label: string }
  wide?: boolean
  children: ReactNode
}) {
  return (
    <div className={wide ? 'max-w-7xl mx-auto' : 'max-w-5xl mx-auto'}>
      {back ? (
        <Link
          to={back.to}
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase mb-6"
          style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}
        >
          ← {back.label}
        </Link>
      ) : null}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          {kicker ? (
            <div className="text-[10px] tracking-[0.28em] uppercase mb-2" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
              {kicker}
            </div>
          ) : null}
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
            {title}
          </h1>
          {lede ? (
            <p className="text-sm mt-2 max-w-xl leading-relaxed" style={{ color: office.mute }}>
              {lede}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </div>
  )
}

export function OfficeButton({
  to,
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
}: {
  to?: string
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'gold' | 'ghost'
  disabled?: boolean
}) {
  const style =
    variant === 'gold'
      ? { backgroundColor: office.gold, color: '#1C1A18' }
      : variant === 'ghost'
        ? { backgroundColor: 'transparent', color: office.wine, border: `1px solid ${office.gold}` }
        : { backgroundColor: office.wine, color: office.ivory }

  const className = 'inline-flex items-center justify-center px-5 py-3 text-sm font-semibold min-h-[44px] transition-all hover:brightness-110'
  if (to) {
    return (
      <Link to={to} className={className} style={{ ...style, fontFamily: "'Lora', serif" }}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={className} style={{ ...style, fontFamily: "'Lora', serif" }}>
      {children}
    </button>
  )
}

export function OfficeCard({ children }: { children: ReactNode }) {
  return (
    <div className="p-5 sm:p-6" style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}>
      {children}
    </div>
  )
}

export function OfficeAlert({ children, tone = 'warn' }: { children: ReactNode; tone?: 'warn' | 'ok' | 'error' }) {
  const styles =
    tone === 'ok'
      ? { backgroundColor: '#E8F0E8', color: '#2A6B3A', border: '#2A6B3A' }
      : tone === 'error'
        ? { backgroundColor: 'rgba(74,16,25,0.08)', color: '#4A1019', border: office.wine }
        : { backgroundColor: office.paper, color: office.wine, border: office.gold }

  return (
    <div
      className="p-4 mb-6 text-sm leading-relaxed"
      role="alert"
      style={{
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderLeft: `3px solid ${styles.border}`,
      }}
    >
      {children}
    </div>
  )
}
