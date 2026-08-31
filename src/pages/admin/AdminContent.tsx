import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { cmsTablesReady, importPrototypeContent } from '../../lib/cms'

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
    setStatus('Prototype news, events, and Mass times are now in the database. The public site will use this content.')
    const result = await cmsTablesReady()
    setReady(result.ready)
    setMessage(result.message)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <div className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}>
        Sprint 2
      </div>
      <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
        Website content
      </h1>
      <p className="text-sm mb-6 leading-relaxed" style={{ color: '#6B6259' }}>
        News, the parish calendar, and Mass times now live in Supabase after you run the Sprint 2 SQL
        and import once. Until then the public site keeps using the prototype copy so nothing goes blank.
      </p>

      {ready === false && message ? (
        <div className="p-4 mb-6 text-sm leading-relaxed" style={{ backgroundColor: '#F0E8D8', color: '#6B1A2A' }}>
          {message}
        </div>
      ) : null}

      {ready ? (
        <>
          <button
            type="button"
            disabled={busy}
            onClick={() => { void onImport() }}
            className="px-5 py-3 text-sm font-semibold min-h-[44px]"
            style={{ backgroundColor: '#6B1A2A', color: '#FAF6F0', fontFamily: "'Lora', serif" }}
          >
            {busy ? 'Importing…' : 'Import prototype news, events, and Mass times'}
          </button>
          <div className="flex flex-wrap gap-3 mt-6 text-sm">
            <Link to="/admin/posts" className="underline underline-offset-2" style={{ color: '#6B1A2A' }}>Edit news</Link>
            <Link to="/admin/events" className="underline underline-offset-2" style={{ color: '#6B1A2A' }}>Edit calendar</Link>
            <Link to="/admin/mass" className="underline underline-offset-2" style={{ color: '#6B1A2A' }}>Edit Mass times</Link>
          </div>
        </>
      ) : null}

      {status ? (
        <p className="text-sm mt-4" style={{ color: status.includes('now in the database') ? '#2A6B3A' : '#6B1A2A' }}>
          {status}
        </p>
      ) : null}
    </div>
  )
}
