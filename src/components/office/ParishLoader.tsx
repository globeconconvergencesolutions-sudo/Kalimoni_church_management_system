import officialLogo from '../../imports/St._Theresa_Catholic_Church__Kalimoni_-_Logo.png'
import { office } from './officeTheme'

export default function ParishLoader({
  caption = 'Peace be with you',
  tone = 'dark',
  fullscreen = true,
}: {
  caption?: string
  tone?: 'dark' | 'light'
  fullscreen?: boolean
}) {
  const bg = tone === 'dark' ? office.night : office.ivory
  const text = tone === 'dark' ? office.gold : office.wine

  return (
    <div
      className={`flex flex-col items-center justify-center px-6 ${fullscreen ? 'min-h-screen' : 'py-16'}`}
      style={{ backgroundColor: bg }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative flex items-center justify-center" style={{ width: 92, height: 92 }}>
        <div
          className="absolute inset-0 rounded-full parish-loader-ring"
          style={{ border: `2px solid rgba(200,146,42,0.18)`, borderTopColor: office.gold }}
          aria-hidden
        />
        <img
          src={officialLogo}
          alt=""
          className="rounded-full object-contain relative z-10"
          style={{
            width: 72,
            height: 72,
            backgroundColor: '#fff',
            boxShadow: `0 0 0 2px ${office.gold}`,
          }}
        />
      </div>
      {caption ? (
        <p
          className="mt-7 text-xs tracking-[0.28em] uppercase text-center max-w-xs"
          style={{ color: text, fontFamily: "'DM Mono', monospace" }}
        >
          {caption}
        </p>
      ) : null}
    </div>
  )
}
