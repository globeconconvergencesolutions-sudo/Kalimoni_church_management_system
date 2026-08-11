interface ParishLogoProps {
  size?: number
  variant?: 'full' | 'mark'
  className?: string
}

export default function ParishLogo({ size = 40, variant = 'mark', className = '' }: ParishLogoProps) {
  const s = size

  if (variant === 'mark') {
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="St. Theresa Parish Kalimoni logo"
      >
        {/* Shield background */}
        <path
          d="M40 4 L72 16 L72 46 C72 61 56 73 40 77 C24 73 8 61 8 46 L8 16 Z"
          fill="#6B1A2A"
        />
        {/* Shield inner border */}
        <path
          d="M40 9 L67 19.5 L67 45.5 C67 58 53 69 40 73 C27 69 13 58 13 45.5 L13 19.5 Z"
          fill="none"
          stroke="#C8922A"
          strokeWidth="1.5"
          opacity="0.6"
        />
        {/* Cross vertical */}
        <rect x="37" y="18" width="6" height="38" rx="1" fill="#C8922A" />
        {/* Cross horizontal */}
        <rect x="24" y="29" width="32" height="6" rx="1" fill="#C8922A" />
        {/* Rose petals — small decorative motif at base */}
        <circle cx="40" cy="62" r="3" fill="#E8B84B" opacity="0.8" />
        <circle cx="34" cy="60" r="2" fill="#E8B84B" opacity="0.5" />
        <circle cx="46" cy="60" r="2" fill="#E8B84B" opacity="0.5" />
        {/* Gold accent dots at shield top corners */}
        <circle cx="22" cy="22" r="2" fill="#E8B84B" opacity="0.4" />
        <circle cx="58" cy="22" r="2" fill="#E8B84B" opacity="0.4" />
      </svg>
    )
  }

  return (
    <svg
      width={s * 3.2}
      height={s}
      viewBox="0 0 256 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="St. Theresa Parish Kalimoni"
    >
      {/* Shield mark */}
      <path d="M40 4 L72 16 L72 46 C72 61 56 73 40 77 C24 73 8 61 8 46 L8 16 Z" fill="#6B1A2A" />
      <path d="M40 9 L67 19.5 L67 45.5 C67 58 53 69 40 73 C27 69 13 58 13 45.5 L13 19.5 Z" fill="none" stroke="#C8922A" strokeWidth="1.5" opacity="0.6" />
      <rect x="37" y="18" width="6" height="38" rx="1" fill="#C8922A" />
      <rect x="24" y="29" width="32" height="6" rx="1" fill="#C8922A" />
      <circle cx="40" cy="62" r="3" fill="#E8B84B" opacity="0.8" />
      <circle cx="34" cy="60" r="2" fill="#E8B84B" opacity="0.5" />
      <circle cx="46" cy="60" r="2" fill="#E8B84B" opacity="0.5" />
      {/* Text: Parish name */}
      <text x="84" y="28" fontFamily="'Lora', Georgia, serif" fontSize="11" fontWeight="700" fill="#C8922A" letterSpacing="2">ST. THERESA</text>
      <text x="84" y="46" fontFamily="'Lora', Georgia, serif" fontSize="16" fontWeight="700" fill="#FFFFFF" letterSpacing="0.5">Kalimoni</text>
      <text x="84" y="62" fontFamily="'DM Mono', 'Courier New', monospace" fontSize="8.5" fill="#C8922A88" letterSpacing="2">CATHOLIC PARISH · EST. 1927</text>
    </svg>
  )
}
