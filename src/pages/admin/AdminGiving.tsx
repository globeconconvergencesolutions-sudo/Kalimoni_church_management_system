import { useEffect, useState } from 'react'
import { fetchStaffDonations } from '../../lib/donations'
import OfficePage, { OfficeAlert } from '../../components/office/OfficePage'
import { office } from '../../components/office/officeTheme'

export default function AdminGiving() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchStaffDonations().then(result => {
      setRows(result.rows)
      setError(result.error)
    })
  }, [])

  return (
    <OfficePage
      kicker="Gifts"
      title="Giving"
      lede="Gifts received through M-Pesa and giving notes from the Donate page."
    >
      {error ? <OfficeAlert>{error}</OfficeAlert> : null}
      {rows.length === 0 && !error ? (
        <p className="text-sm" style={{ color: office.mute }}>No gifts recorded yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map(row => (
            <div key={String(row.id)} className="p-4" style={{ backgroundColor: '#fff', border: '1px solid #E8DFD0' }}>
              <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
                {String(row.status)}
              </div>
              <div className="font-semibold" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
                {String(row.name || 'Anonymous')} · KSh {String(row.kes_amount ?? row.amount)}
              </div>
              <p className="text-sm mt-1" style={{ color: '#6B6259' }}>
                {String(row.cause)} · {String(row.phone || '')} · {String(row.checkout_ref || '')}
              </p>
            </div>
          ))}
        </div>
      )}
    </OfficePage>
  )
}
