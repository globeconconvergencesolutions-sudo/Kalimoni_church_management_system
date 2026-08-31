import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation, Link } from 'react-router'
import officialLogo from '../imports/St._Theresa_Catholic_Church__Kalimoni_-_Logo.png'
import NoticeRail from './NoticeRail'
import NoticeSpotlight from './NoticeSpotlight'
import { useLiveNotices } from '../hooks/useLiveNotices'
import { NOTICE_RAIL_HEIGHT } from '../lib/noticeTypes'

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Ministries', to: '/ministries' },
  { label: 'Events', to: '/events' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'News', to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

const FOOTER_LINKS = {
  'The Parish': [
    { label: 'About Us', to: '/about' },
    { label: 'Our History', to: '/history' },
    { label: 'Community', to: '/community' },
    { label: 'Gallery', to: '/gallery' },
  ],
  'Ministries': [
    { label: 'All Ministries', to: '/ministries' },
    { label: 'Vincentian Fathers', to: '/vincentians' },
    { label: 'HHCJ Sisters', to: '/sisters' },
    { label: 'Events Calendar', to: '/events' },
  ],
  'Connect': [
    { label: 'Parish News', to: '/blog' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'Donate', to: '/donate' },
  ],
}

const SWAHILI = {
  welcome: 'Karibu — Welcome',
  tagline: 'Kanisa la Mtakatifu Theresa, Kalimoni',
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackTop, setShowBackTop] = useState(false)
  const [lang, setLang] = useState<'en' | 'sw'>('en')
  const location = useLocation()
  const { notices, ready } = useLiveNotices()
  const railOn = notices.length > 0
  const railPx = railOn ? NOTICE_RAIL_HEIGHT : 0

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrolled(scrollTop > 40)
      setScrollProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0)
      setShowBackTop(scrollTop > 500)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF6F0' }}>
      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(16,4,8,0.97)' : 'rgba(74,16,25,0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: scrolled
            ? '0 1px 0 rgba(200,146,42,0.2), 0 8px 48px rgba(0,0,0,0.5)'
            : '0 1px 0 rgba(200,146,42,0.06)',
        }}
      >
        {/* Scroll progress bar */}
        <div
          className="absolute top-0 left-0 h-[2px] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%`, backgroundColor: '#C8922A', zIndex: 60 }}
        />

        {/* ── unified centred band ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 sm:h-16">

          {/* Logo — always visible */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="St. Theresa Parish Home">
            <img
              src={officialLogo}
              alt="St. Theresa Catholic Church Kalimoni"
              className="xl:hidden object-contain rounded-full"
              style={{ width: 42, height: 42, backgroundColor: '#fff', boxShadow: '0 0 0 1.5px rgba(200,146,42,0.4)' }}
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[9px] tracking-[0.18em] uppercase" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
                {lang === 'sw' ? 'Kanisa · Kalimoni' : 'Catholic Church · Kalimoni'}
              </span>
              <span className="text-white font-semibold text-sm leading-tight" style={{ fontFamily: "'Lora', serif" }}>
                St. Theresa
              </span>
            </div>
          </Link>

          {/* Desktop: nav + donate tightly grouped in centre */}
          <div
            className="hidden xl:flex items-center gap-0.5 rounded-full px-3 py-1.5"
            style={{ border: '1px solid rgba(200,146,42,0.15)', backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <img
              src={officialLogo}
              alt=""
              aria-hidden="true"
              className="object-contain rounded-full shrink-0 mr-1.5"
              style={{ width: 26, height: 26, backgroundColor: '#fff', boxShadow: '0 0 0 1.5px rgba(200,146,42,0.3)' }}
            />
            {NAV.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-[10.5px] tracking-[0.08em] uppercase transition-all duration-200 whitespace-nowrap rounded-full font-medium ${
                    isActive ? 'text-yellow-200 bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`
                }
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {label}
              </NavLink>
            ))}
            <span className="w-px h-3.5 mx-2 shrink-0" style={{ backgroundColor: 'rgba(200,146,42,0.2)' }} />
            <Link
              to="/donate"
              className="px-4 py-1.5 text-[10px] font-bold tracking-[0.14em] uppercase transition-all duration-200 hover:brightness-110 active:scale-95 whitespace-nowrap rounded-full"
              style={{ backgroundColor: '#C8922A', color: '#FAF6F0', fontFamily: "'DM Mono', monospace" }}
            >
              Donate
            </Link>
          </div>

          {/* Right: language + mobile burger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(l => l === 'en' ? 'sw' : 'en')}
              className="hidden xl:flex px-2 py-1 text-[10px] tracking-widest transition-all duration-200"
              style={{ border: '1px solid rgba(200,146,42,0.4)', color: '#C8922A', fontFamily: "'DM Mono', monospace" }}
              title={lang === 'en' ? 'Switch to Kiswahili' : 'Switch to English'}
            >
              {lang === 'en' ? 'SW' : 'EN'}
            </button>
            <button
              className="xl:hidden text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" d="M3 7h18M3 12h18M3 17h18" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={`xl:hidden overflow-y-auto transition-all duration-300 ${menuOpen ? 'max-h-[600px]' : 'max-h-0'}`}
          style={{ backgroundColor: '#3A0C14' }}
        >
          <div className="px-4 sm:px-6 py-3 grid grid-cols-2 gap-1">
            {NAV.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `py-3 px-3 text-sm tracking-wide border transition-colors duration-150 ${
                    isActive ? 'text-yellow-300 border-yellow-900 bg-yellow-900/10' : 'text-white/80 border-white/10 hover:text-white hover:bg-white/5'
                  }`
                }
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {label}
              </NavLink>
            ))}
            <Link
              to="/donate"
              className="col-span-2 mt-2 py-3.5 text-center text-sm font-bold tracking-widest uppercase min-h-[44px] flex items-center justify-center"
              style={{ backgroundColor: '#C8922A', color: '#FAF6F0', fontFamily: "'DM Mono', monospace" }}
            >
              Donate Now
            </Link>
          </div>
          <div className="h-safe-bottom" />
        </div>
        {railOn ? <NoticeRail notices={notices} /> : null}
      </nav>

      {/* ── KISWAHILI WELCOME BANNER ─────────────────────────── */}
      {lang === 'sw' && (
        <div
          className={`fixed left-0 right-0 z-40 text-center py-2 text-xs tracking-widest ${
            railOn
              ? 'top-[calc(3.5rem+40px)] sm:top-[calc(4rem+40px)]'
              : 'top-14 sm:top-16'
          }`}
          style={{ backgroundColor: '#C8922A', color: '#1C1A18', fontFamily: "'DM Mono', monospace" }}
        >
          🙏 Karibu sana — {SWAHILI.tagline} &nbsp;·&nbsp;
          <button onClick={() => setLang('en')} className="underline underline-offset-2 hover:opacity-70 ml-1">
            English
          </button>
        </div>
      )}

      {/* ── PAGE CONTENT ─────────────────────────────────────── */}
      <main style={{ paddingTop: `calc(${lang === 'sw' ? '2.25rem' : '0px'} + ${railPx}px)` }}><Outlet /></main>

      <NoticeSpotlight notices={notices} ready={ready} />

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ backgroundColor: '#0F0D0C' }}>
        {/* Top band — donate CTA */}
        <div
          className="px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-12"
          style={{ backgroundColor: '#6B1A2A' }}
        >
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div>
              <div className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: '#E8B84B', fontFamily: "'DM Mono', monospace" }}>
                Partner With Us
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight" style={{ fontFamily: "'Lora', serif" }}>
                Support the Mission<br className="hidden sm:block" /> of St. Theresa Parish
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                to="/donate"
                className="px-7 py-3.5 font-bold text-sm tracking-wide transition-all hover:brightness-110 active:scale-95 text-center min-h-[48px] flex items-center justify-center"
                style={{ backgroundColor: '#C8922A', color: '#FAF6F0', fontFamily: "'Lora', serif" }}
              >
                Donate Now
              </Link>
              <Link
                to="/contact"
                className="px-7 py-3.5 font-medium text-sm tracking-wide border transition-all hover:bg-white/10 text-center min-h-[48px] flex items-center justify-center"
                style={{ border: '1px solid rgba(240,232,216,0.35)', color: '#F0E8D8', fontFamily: "'Inter', sans-serif" }}
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>

        {/* Main footer body */}
        <div className="px-4 sm:px-6 md:px-10 lg:px-16 pt-14 sm:pt-16 pb-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">

              {/* Brand column — takes 2 cols on large screens */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={officialLogo}
                    alt="St. Theresa Catholic Church Kalimoni"
                    className="object-contain rounded-full shrink-0"
                    style={{ width: 52, height: 52, backgroundColor: '#fff', boxShadow: '0 0 0 1.5px rgba(200,146,42,0.35)' }}
                  />
                  <div>
                    <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>Catholic Church · Est. 1927</div>
                    <div className="text-white font-semibold text-sm" style={{ fontFamily: "'Lora', serif" }}>St. Theresa, Kalimoni</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: '#5A4E48' }}>
                  Established 1927. Serving God through service to humanity in Kalimoni, Juja,
                  Kiambu County, Kenya — Ruiru Deanery, Archdiocese of Nairobi.
                </p>
                <div className="flex flex-col gap-3 text-xs" style={{ color: '#5A4E48', fontFamily: "'DM Mono', monospace" }}>
                  <div className="flex items-start gap-2.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8922A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                      <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" />
                      <circle cx="12" cy="8" r="2.5" />
                    </svg>
                    <span>P.O. BOX 141, Kalimoni, Kenya 01001</span>
                  </div>
                  <a href="tel:+254704358594" className="flex items-start gap-2.5 hover:text-white transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8922A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.25 11a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" />
                    </svg>
                    <span>+254 704 358594</span>
                  </a>
                  <a href="mailto:sttheresakalimoniparish@gmail.com" className="flex items-start gap-2.5 hover:text-white transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8922A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span>sttheresakalimoniparish@gmail.com</span>
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61552240605615" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 hover:text-white transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#C8922A" className="mt-0.5 shrink-0">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" stroke="#C8922A" strokeWidth="2" fill="none" />
                    </svg>
                    <span>Facebook Page</span>
                  </a>
                </div>
              </div>

              {/* Link columns */}
              {Object.entries(FOOTER_LINKS).map(([group, links]) => (
                <div key={group}>
                  <div
                    className="text-xs tracking-[0.2em] uppercase mb-5 pb-2 border-b"
                    style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace", borderColor: '#2A2520' }}
                  >
                    {group}
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {links.map(({ label, to }) => (
                      <Link
                        key={label}
                        to={to}
                        className="text-sm transition-colors duration-150 hover:text-white flex items-center gap-1.5 group"
                        style={{ color: '#5A4E48' }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#C8922A', fontSize: '0.5rem' }}>●</span>
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t mb-8" style={{ borderColor: '#1E1B18' }} />

            {/* Bottom row */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between">
              <div className="text-xs leading-relaxed" style={{ color: '#3A3530', fontFamily: "'DM Mono', monospace" }}>
                © 2026 St. Theresa Parish, Kalimoni. All rights reserved. Est. 1927.
              </div>
              <div className="flex flex-wrap gap-4 sm:gap-6 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>
                {[
                  { label: 'Blog', to: '/blog' },
                  { label: 'Gallery', to: '/gallery' },
                  { label: 'Donate', to: '/donate' },
                  { label: 'Privacy', to: '/contact' },
                ].map(({ label, to }) => (
                  <Link
                    key={label}
                    to={to}
                    className="transition-colors hover:text-white"
                    style={{ color: '#3A3530' }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Tagline */}
            <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: '#1A1816' }}>
              <p
                className="text-xs italic"
                style={{ color: '#2E2926', fontFamily: "'Lora', serif" }}
              >
                "Service to God through service to humanity." — The Vincentian Spirit
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* ── FLOATING ACTIONS ─────────────────────────────────── */}

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/254704358594?text=Hello%20St.%20Theresa%20Parish%2C%20Kalimoni.%20I%20would%20like%20to%20get%20in%20touch."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed z-40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          bottom: showBackTop ? '5.5rem' : '1.5rem',
          right: '1.25rem',
          width: 52,
          height: 52,
          backgroundColor: '#25D366',
          borderRadius: '50%',
          boxShadow: '0 4px 20px rgba(37,211,102,0.5)',
          transition: 'bottom 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
        }}
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {/* Back to top */}
      <button
        onClick={scrollToTop}
        className="fixed z-40 flex items-center justify-center"
        style={{
          bottom: '1.5rem',
          right: '1.25rem',
          width: 44,
          height: 44,
          backgroundColor: '#4A1019',
          color: '#C8922A',
          border: '1px solid #C8922A55',
          opacity: showBackTop ? 1 : 0,
          pointerEvents: showBackTop ? 'auto' : 'none',
          transform: showBackTop ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
        aria-label="Back to top"
        title="Back to top"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </div>
  )
}
