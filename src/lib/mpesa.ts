export type DemoStkResult = {
  ok: boolean
  demo: true
  error: string | null
  checkoutRef?: string
  kesAmount?: number
  phone?: string
}

export function toKenyaMsisdn(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  if (/^07\d{8}$/.test(digits) || /^01\d{8}$/.test(digits)) return `254${digits.slice(1)}`
  if (/^2547\d{8}$/.test(digits) || /^2541\d{8}$/.test(digits)) return digits
  if (/^7\d{8}$/.test(digits) || /^1\d{8}$/.test(digits)) return `254${digits}`
  return null
}

export const KES_ESTIMATE: Record<string, number> = {
  KES: 1,
  USD: 130,
  EUR: 145,
  GBP: 165,
  CAD: 95,
  AUD: 85,
}

export function estimateKes(amount: number, currency: string): number {
  const rate = KES_ESTIMATE[currency] || 130
  return Math.max(1, Math.round(amount * rate))
}

export async function sendDemoStk(payload: {
  name: string
  email: string
  phone: string
  amount: number
  currency: string
  cause: string
  frequency: string
}): Promise<DemoStkResult> {
  try {
    const res = await fetch('/api/mpesa/stk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = (await res.json().catch(() => ({}))) as DemoStkResult & { error?: string }
    if (!res.ok || !data.ok) {
      return { ok: false, demo: true, error: data.error || 'Could not start the M-Pesa request. Please try again.' }
    }
    return {
      ok: true,
      demo: true,
      error: null,
      checkoutRef: data.checkoutRef,
      kesAmount: data.kesAmount,
      phone: data.phone,
    }
  } catch {
    return { ok: false, demo: true, error: 'M-Pesa giving is unavailable right now. Please use Paybill or bank transfer.' }
  }
}

export async function confirmDemoStk(checkoutRef: string, paid: boolean): Promise<{ ok: boolean; error: string | null }> {
  try {
    const res = await fetch('/api/mpesa/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutRef, paid }),
    })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
    if (!res.ok || !data.ok) return { ok: false, error: data.error || 'Could not confirm the payment.' }
    return { ok: true, error: null }
  } catch {
    return { ok: false, error: 'M-Pesa giving is unavailable right now. Please use Paybill or bank transfer.' }
  }
}
