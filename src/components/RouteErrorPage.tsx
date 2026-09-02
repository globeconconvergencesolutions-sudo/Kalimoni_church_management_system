import { isRouteErrorResponse, useRouteError, Link } from 'react-router'
import { describeAppError, describeHttpStatus } from '../lib/appErrors'
import { useSEO } from '../hooks/useSEO'

type RouteErrorPageProps = {
  scope?: 'public' | 'office'
}

export default function RouteErrorPage({ scope = 'public' }: RouteErrorPageProps) {
  const error = useRouteError()
  const details = isRouteErrorResponse(error)
    ? describeHttpStatus(error.status, scope)
    : describeAppError(error, { scope })

  useSEO({
    title: details.title,
    description: details.message,
    path: '/error',
  })

  const isOffice = scope === 'office'
  const bg = isOffice ? '#FAF6F0' : '#FAF6F0'
  const wine = '#4A1019'
  const burgundy = '#6B1A2A'
  const gold = '#C8922A'
  const mute = '#6B6259'

  const homeTo = isOffice ? '/admin' : '/'
  const homeLabel = isOffice ? 'Back to dashboard' : 'Return to home'
  const secondaryTo = isOffice ? '/admin/login' : '/contact'
  const secondaryLabel = isOffice ? 'Sign in again' : 'Contact the parish'

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-16 text-center"
      style={{ backgroundColor: bg, paddingTop: isOffice ? 48 : 80 }}
    >
      <div className="max-w-md">
        <div
          className="text-[10px] tracking-[0.28em] uppercase mb-4"
          style={{ color: gold, fontFamily: "'DM Mono', monospace" }}
        >
          {details.kind === 'not_found' ? '404' : 'St. Theresa · Kalimoni'}
        </div>
        <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Lora', serif", color: wine }}>
          {details.title}
        </h1>
        <p className="text-sm leading-relaxed mb-2" style={{ color: mute }}>
          {details.message}
        </p>
        {details.hint ? (
          <p className="text-xs leading-relaxed mb-8" style={{ color: mute }}>
            {details.hint}
          </p>
        ) : (
          <div className="mb-8" />
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-7 py-3 font-semibold text-sm min-h-[48px]"
            style={{ backgroundColor: burgundy, color: '#F0E8D8', fontFamily: "'Lora', serif" }}
          >
            {details.kind === 'chunk' ? 'Refresh page' : 'Try again'}
          </button>
          <Link
            to={homeTo}
            className="px-7 py-3 font-semibold text-sm min-h-[48px] inline-flex items-center justify-center"
            style={{ border: `1px solid ${gold}`, color: burgundy, fontFamily: "'Lora', serif" }}
          >
            {homeLabel}
          </Link>
        </div>
        <p className="mt-6 text-xs" style={{ color: mute }}>
          <Link to={secondaryTo} style={{ color: burgundy, textDecoration: 'underline' }}>
            {secondaryLabel}
          </Link>
        </p>
      </div>
    </div>
  )
}
