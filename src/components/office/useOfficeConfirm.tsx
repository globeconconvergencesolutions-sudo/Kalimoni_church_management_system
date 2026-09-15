import { useCallback, useState, type ReactNode } from 'react'
import OfficeConfirm, { type OfficeConfirmTone } from './OfficeConfirm'

type ConfirmRequest = {
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: OfficeConfirmTone
}

type Pending = ConfirmRequest & {
  resolve: (ok: boolean) => void
}

/**
 * Imperative confirm() that renders a branded dialog instead of window.confirm.
 */
export function useOfficeConfirm() {
  const [pending, setPending] = useState<Pending | null>(null)
  const [busy, setBusy] = useState(false)

  const confirm = useCallback((opts: ConfirmRequest): Promise<boolean> => {
    return new Promise(resolve => {
      setPending({ ...opts, resolve })
    })
  }, [])

  const finish = useCallback((ok: boolean) => {
    setPending(current => {
      current?.resolve(ok)
      return null
    })
    setBusy(false)
  }, [])

  const dialog = (
    <OfficeConfirm
      open={Boolean(pending)}
      title={pending?.title ?? ''}
      description={pending?.description}
      confirmLabel={pending?.confirmLabel}
      cancelLabel={pending?.cancelLabel}
      tone={pending?.tone}
      busy={busy}
      onCancel={() => finish(false)}
      onConfirm={() => finish(true)}
    />
  )

  return { confirm, dialog, setConfirmBusy: setBusy }
}
