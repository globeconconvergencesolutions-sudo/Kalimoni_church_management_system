import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import OfficePage from '../../components/office/OfficePage'
import { office, IconBell, IconChalice, IconEnvelope, IconHeart } from '../../components/office/officeTheme'
import { fetchAllNotices } from '../../lib/notices'
import { fetchInbox } from '../../lib/inbox'
import { fetchStaffDonations } from '../../lib/donations'
import { fetchEucharistSlots } from '../../lib/cms'
import { computeNextMass } from '../../data/massSchedule'

export default function AdminDashboard() {
  const [notices, setNotices] = useState(0)
  const [unread, setUnread] = useState(0)
  const [gifts, setGifts] = useState(0)
  const [mass, setMass] = useState(computeNextMass())

  useEffect(() => {
    void fetchAllNotices().then(r => setNotices(r.notices.filter(n => n.published).length))
    void fetchInbox().then(r => setUnread(r.messages.filter(m => m.status === 'unread').length))
    void fetchStaffDonations().then(r => setGifts(r.rows.length))
    void fetchEucharistSlots().then(slots => setMass(computeNextMass(slots)))
  }, [])

  const cards = [
    { to: '/admin/inbox', kicker: 'Today', title: unread ? `${unread} unread` : 'Inbox clear', lede: 'Messages, prayer, and newsletter signups.', gold: unread > 0, icon: <IconEnvelope /> },
    { to: '/admin/notices', kicker: 'Proclaim', title: notices ? `${notices} live notices` : 'No live notices', lede: 'The notice bar parishioners see at the top of the website.', gold: false, icon: <IconBell /> },
    { to: '/admin/mass', kicker: 'Eucharist', title: `${mass.displayDay} · ${mass.time}`, lede: mass.isImminent ? 'Starting soon in Kalimoni.' : 'The next Mass countdown on the homepage.', gold: false, icon: <IconChalice /> },
    { to: '/admin/giving', kicker: 'Gifts', title: gifts ? `${gifts} gifts recorded` : 'No gifts yet', lede: 'Gifts received through the Donate page.', gold: false, icon: <IconHeart /> },
  ]

  const shortcuts = [
    { to: '/admin/notices/new', label: 'New notice' },
    { to: '/admin/posts/new', label: 'New article' },
    { to: '/admin/events/new', label: 'New event' },
    { to: '/admin/media', label: 'Manage media' },
  ]

  return (
    <OfficePage
      kicker="Parish house"
      title="Peace be with you"
      lede="Welcome to the working table for St. Theresa Parish, Kalimoni."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {cards.map(card => (
          <Link
            key={card.to}
            to={card.to}
            className="block p-6 transition-transform hover:-translate-y-0.5"
            style={{
              backgroundColor: '#fff',
              border: `1px solid ${office.line}`,
              borderTop: `3px solid ${card.gold ? office.wine : office.gold}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] tracking-[0.22em] uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
                {card.kicker}
              </div>
              <span style={{ color: office.gold }}>{card.icon}</span>
            </div>
            <div className="text-2xl font-bold mb-2" style={{ fontFamily: "'Lora', serif", color: office.burgundy }}>
              {card.title}
            </div>
            <p className="text-sm" style={{ color: office.mute }}>{card.lede}</p>
          </Link>
        ))}
      </div>

      <div className="text-[10px] tracking-[0.22em] uppercase mb-3" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
        Quick work
      </div>
      <div className="flex flex-wrap gap-2">
        {shortcuts.map(s => (
          <Link
            key={s.to}
            to={s.to}
            className="px-4 py-3 text-sm min-h-[44px] flex items-center"
            style={{ backgroundColor: office.paper, color: office.wine, fontFamily: "'Lora', serif" }}
          >
            {s.label} →
          </Link>
        ))}
      </div>
    </OfficePage>
  )
}
