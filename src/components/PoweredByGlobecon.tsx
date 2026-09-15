import { useEffect, useState } from 'react'

/**
 * Discrete "Powered by Globecon" credit — quiet fixed chip + footer mark.
 * Fixed chip stays pinned to the bottom and yields when the footer credit is visible.
 */
export default function PoweredByGlobecon({
  variant = 'footer',
}: {
  variant?: 'footer' | 'fixed'
}) {
  const href = 'https://globeconcs.com/'
  const logo = '/globeconLogo.ico'
  const [footerInView, setFooterInView] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (variant !== 'fixed') return
    const el = document.getElementById('globecon-footer-credit')
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => setFooterInView(entry.isIntersecting),
      { root: null, threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [variant])

  if (variant === 'fixed') {
    const dormant = footerInView && !hovered
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="fixed z-30 group flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 max-sm:pr-1.5"
        style={{
          bottom: '1.35rem',
          right: '5.1rem',
          backgroundColor: hovered ? 'rgba(15,13,12,0.94)' : 'rgba(15,13,12,0.55)',
          border: `1px solid ${hovered ? 'rgba(200,146,42,0.45)' : 'rgba(200,146,42,0.18)'}`,
          boxShadow: hovered ? '0 6px 20px rgba(0,0,0,0.28)' : '0 2px 10px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(10px)',
          opacity: dormant ? 0 : hovered ? 1 : 0.62,
          transform: dormant ? 'translateY(8px)' : hovered ? 'translateY(-1px)' : 'translateY(0)',
          pointerEvents: dormant ? 'none' : 'auto',
          transition: 'opacity 0.35s ease, transform 0.35s ease, background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        }}
        aria-label="Powered by Globecon — visit globeconcs.com"
        title="Powered by Globecon"
        aria-hidden={dormant}
        tabIndex={dormant ? -1 : 0}
      >
        <img
          src={logo}
          alt=""
          width={18}
          height={18}
          className="object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
          style={{ width: 18, height: 18, opacity: hovered ? 1 : 0.88 }}
        />
        <span
          className="flex flex-col leading-tight overflow-hidden max-sm:hidden"
          style={{
            maxWidth: hovered ? 88 : 72,
            transition: 'max-width 0.3s ease',
          }}
        >
          <span
            className="text-[7px] tracking-[0.16em] uppercase"
            style={{
              color: hovered ? 'rgba(232,184,75,0.9)' : 'rgba(200,146,42,0.55)',
              fontFamily: "'DM Mono', monospace",
              transition: 'color 0.25s ease',
            }}
          >
            Powered by
          </span>
          <span
            className="text-[10px] font-medium"
            style={{
              color: hovered ? '#E8B84B' : 'rgba(255,255,255,0.82)',
              fontFamily: "'Inter', sans-serif",
              transition: 'color 0.25s ease',
            }}
          >
            Globecon
          </span>
        </span>
      </a>
    )
  }

  return (
    <a
      id="globecon-footer-credit"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2.5 transition-opacity hover:opacity-100"
      style={{ opacity: 0.85 }}
      aria-label="Powered by Globecon — visit globeconcs.com"
    >
      <img
        src={logo}
        alt="Globecon"
        width={28}
        height={28}
        className="object-contain shrink-0 rounded-sm transition-transform duration-300 group-hover:scale-105"
        style={{ width: 28, height: 28, backgroundColor: '#fff' }}
      />
      <span className="flex flex-col leading-tight text-left">
        <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: '#5A4E48', fontFamily: "'DM Mono', monospace" }}>
          Powered by
        </span>
        <span
          className="text-sm font-semibold transition-colors group-hover:text-[#E8B84B]"
          style={{ color: '#C8B8A8', fontFamily: "'Inter', sans-serif" }}
        >
          Globecon
        </span>
      </span>
    </a>
  )
}
