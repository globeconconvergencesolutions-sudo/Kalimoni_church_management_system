export const office = {
  burgundy: '#4A1019',
  wine: '#6B1A2A',
  night: '#1C080E',
  ivory: '#FAF6F0',
  paper: '#F0E8D8',
  gold: '#C8922A',
  goldLite: '#E8B84B',
  ink: '#1C1A18',
  mute: '#6B6259',
  line: '#E8DFD0',
  field: {
    border: '1px solid #D0C4B0',
    backgroundColor: '#fff',
    outline: 'none' as const,
    fontFamily: "'Inter', sans-serif",
  },
}

export function IconBell({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}

export function IconEnvelope({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M3 7l9 7 9-7" />
    </svg>
  )
}

export function IconCross({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="10.5" y="3" width="3" height="18" rx="0.5" />
      <rect x="5" y="8" width="14" height="3" rx="0.5" />
    </svg>
  )
}

export function IconChalice({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M7 4h10v4a5 5 0 01-5 5 5 5 0 01-5-5V4z" />
      <path d="M12 13v4" />
      <path d="M8 21h8" />
      <path d="M10 21v-2h4v2" />
    </svg>
  )
}

export function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <rect x="3" y="5" width="18" height="16" rx="1.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

export function IconImage({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M21 16l-5-5-8 8" />
    </svg>
  )
}

export function IconHeart({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M20 8.5c0 5.5-8 11-8 11S4 14 4 8.5A4.5 4.5 0 0112 6a4.5 4.5 0 018 2.5z" />
    </svg>
  )
}

export function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M4 11l8-7 8 7v9H4V11z" />
      <path d="M10 20v-6h4v6" />
    </svg>
  )
}

export function IconNews({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M4 5h12v14H6a2 2 0 01-2-2V5z" />
      <path d="M16 8h4v9a2 2 0 01-2 2h-2" />
      <path d="M7 9h6M7 13h6M7 17h4" />
    </svg>
  )
}

export function IconImport({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}

export function IconQuote({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.2 18c-1.8 0-3.2-1.4-3.2-3.2 0-2.4 1.8-5.2 5.2-8.2L11 8.4C8.8 10.4 7.6 12.2 7.6 13.8c.4-.2.8-.2 1.2-.2 1.6 0 2.8 1.2 2.8 2.8S10.4 18 8.8 18H7.2zm9.6 0c-1.8 0-3.2-1.4-3.2-3.2 0-2.4 1.8-5.2 5.2-8.2L20.6 8.4c-2.2 2-3.4 3.8-3.4 5.4.4-.2.8-.2 1.2-.2 1.6 0 2.8 1.2 2.8 2.8s-1.2 2.6-2.8 2.6h-1.6z" />
    </svg>
  )
}
