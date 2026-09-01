import { office } from './officeTheme'

type TabId = 'site' | 'gallery'

const TABS: { id: TabId; label: string; short: string }[] = [
  { id: 'site', label: 'Site images', short: 'Site' },
  { id: 'gallery', label: 'Gallery library', short: 'Gallery' },
]

export default function MediaCenterTabs({
  active,
  onChange,
}: {
  active: TabId
  onChange: (tab: TabId) => void
}) {
  return (
    <div className="overflow-x-auto scrollbar-none -mx-1 px-1">
      <div
        className="inline-flex gap-1 p-1 rounded-xl min-w-max"
        style={{ backgroundColor: office.paper, border: `1px solid ${office.line}` }}
      >
        {TABS.map(tab => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-lg text-sm font-medium transition min-h-[44px] min-w-[108px] sm:min-w-0"
              style={{
                fontFamily: isActive ? "'Lora', serif" : "'Inter', sans-serif",
                backgroundColor: isActive ? '#fff' : 'transparent',
                color: isActive ? office.burgundy : office.mute,
                boxShadow: isActive ? '0 1px 3px rgba(74,16,25,0.08)' : 'none',
              }}
            >
              <TabIcon id={tab.id} active={isActive} />
              <span className="sm:hidden">{tab.short}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TabIcon({ id, active }: { id: TabId; active: boolean }) {
  const color = active ? office.wine : office.mute
  if (id === 'gallery') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="5" width="18" height="14" rx="1.5" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="M21 16l-5-5-8 8" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}
