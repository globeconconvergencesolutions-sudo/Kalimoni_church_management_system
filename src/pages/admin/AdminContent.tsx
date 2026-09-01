import { useEffect, useState } from 'react'
import { cmsTablesReady, importPrototypeContent } from '../../lib/cms'
import OfficePage, { OfficeAlert, OfficeButton, OfficeCard } from '../../components/office/OfficePage'
import { office } from '../../components/office/officeTheme'

export default function AdminContent() {
  const [ready, setReady] = useState<boolean | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void cmsTablesReady().then(result => {
      setReady(result.ready)
      setMessage(result.message)
    })
  }, [])

  const onImport = async () => {
    setBusy(true)
    setStatus(null)
    const err = await importPrototypeContent()
    setBusy(false)
    if (err) {
      setStatus(err)
      return
    }
    setStatus('Brochure stories, feast days, and Mass times are now live on the parish website.')
    const result = await cmsTablesReady()
    setReady(result.ready)
    setMessage(result.message)
  }

  return (
    <OfficePage
      kicker="House"
      title="Parish archive"
      lede="Load the founding news, feast days, and Mass times from the printed brochure. After that, keep everything current from News, Events, and Mass times."
    >
      {ready === false && message ? <OfficeAlert>{message}</OfficeAlert> : null}
      {status ? (
        <OfficeAlert tone={status.includes('now live') ? 'ok' : 'warn'}>{status}</OfficeAlert>
      ) : null}

      <OfficeCard>
        <p className="text-sm leading-relaxed mb-6" style={{ color: office.mute }}>
          Use this once when setting up the parish website. It brings the brochure content into the live site
          without removing anything you have already written.
        </p>
        {ready ? (
          <div className="flex flex-wrap gap-3">
            <OfficeButton disabled={busy} onClick={() => { void onImport() }}>
              {busy ? 'Loading…' : 'Load brochure archive'}
            </OfficeButton>
            <OfficeButton to="/admin/posts" variant="ghost">News</OfficeButton>
            <OfficeButton to="/admin/events" variant="ghost">Calendar</OfficeButton>
            <OfficeButton to="/admin/mass" variant="ghost">Mass times</OfficeButton>
          </div>
        ) : ready === null ? (
          <p className="text-sm" style={{ color: office.mute }}>One moment…</p>
        ) : null}
      </OfficeCard>
    </OfficePage>
  )
}
