import { useState } from 'react'
import {
  formatCoordinates,
  parishAppleMapsUrl,
  parishDirectionsUrl,
  parishGoogleMapsEmbedUrl,
  parishOpenInMapsUrl,
  PARISH_LOCATION,
} from '../data/parishLocation'

export default function ParishLocationMap({
  heading = 'How to Get Here',
  kicker = 'Find Us',
}: {
  heading?: string
  kicker?: string
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <section className="px-4 sm:px-6 md:px-10 lg:px-16 pb-12 sm:pb-16" style={{ backgroundColor: '#FAF6F0' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
          {kicker}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
          {heading}
        </h2>
        <p className="text-sm mb-6 max-w-2xl leading-relaxed" style={{ color: '#6B6259' }}>
          {PARISH_LOCATION.shortName} — {PARISH_LOCATION.lines.join(', ')}.
        </p>

        <div
          className="overflow-hidden relative"
          style={{ border: '1px solid #E8DFD0', backgroundColor: '#E8DFD0' }}
        >
          <div className="relative" style={{ height: 'clamp(280px, 48vw, 440px)' }}>
            {!loaded ? (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <p className="text-xs tracking-widest uppercase" style={{ color: '#6B6259', fontFamily: "'DM Mono', monospace" }}>
                  Loading map…
                </p>
              </div>
            ) : null}
            <iframe
              title={`${PARISH_LOCATION.name} — map`}
              src={parishGoogleMapsEmbedUrl()}
              width="100%"
              height="100%"
              className="absolute inset-0 w-full h-full"
              style={{ border: 0, filter: 'grayscale(0.15) contrast(1.02)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setLoaded(true)}
            />
          </div>

          <div className="grid lg:grid-cols-12 gap-0" style={{ borderTop: '1px solid #E8DFD0', backgroundColor: '#fff' }}>
            <div className="lg:col-span-5 p-5 sm:p-6" style={{ borderBottom: '1px solid #E8DFD0' }}>
              <div className="text-[10px] tracking-[0.22em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
                Parish location
              </div>
              <p className="font-semibold text-base mb-1" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
                {PARISH_LOCATION.name}
              </p>
              {PARISH_LOCATION.lines.map(line => (
                <p key={line} className="text-sm" style={{ color: '#4A3A30' }}>{line}</p>
              ))}
              <p className="text-xs mt-2" style={{ color: '#6B6259' }}>{PARISH_LOCATION.deanery}</p>
              <p className="text-xs" style={{ color: '#6B6259' }}>{PARISH_LOCATION.diocese}</p>
              <p className="text-[10px] mt-4 tracking-wide" style={{ color: '#8A7A70', fontFamily: "'DM Mono', monospace" }}>
                {formatCoordinates()}
              </p>
            </div>

            <div className="lg:col-span-4 p-5 sm:p-6 lg:border-l" style={{ borderBottom: '1px solid #E8DFD0', borderColor: '#E8DFD0' }}>
              <div className="text-[10px] tracking-[0.22em] uppercase mb-3" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
                Getting there
              </div>
              <ul className="flex flex-col gap-2.5 text-sm" style={{ color: '#4A3A30' }}>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 mt-1 text-[8px]" style={{ color: '#C8922A' }}>●</span>
                  <span>From Thika Road: take the Juja exit toward Kalimoni market — the church is clearly visible from the main road.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 mt-1 text-[8px]" style={{ color: '#C8922A' }}>●</span>
                  <span>Matatu from Nairobi: route 145 (Thika Road), then connect to Juja / Kalimoni.</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-3 p-5 sm:p-6 flex flex-col gap-2.5 justify-center lg:border-l" style={{ borderColor: '#E8DFD0' }}>
              <a
                href={parishDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 text-sm font-semibold min-h-[44px] transition hover:brightness-110"
                style={{ backgroundColor: '#6B1A2A', color: '#FAF6F0', fontFamily: "'Lora', serif" }}
              >
                Get directions
              </a>
              <a
                href={parishOpenInMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 text-sm min-h-[44px] transition"
                style={{ border: '1px solid #C8922A', color: '#6B1A2A', fontFamily: "'Inter', sans-serif" }}
              >
                Open in Google Maps
              </a>
              <a
                href={parishAppleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center text-[10px] tracking-widest uppercase py-2"
                style={{ color: '#8A7A70', fontFamily: "'DM Mono', monospace" }}
              >
                Apple Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
