import { createClient } from '@supabase/supabase-js'
import { supabaseAnonKey, supabaseUrl } from './parishEnv.js'

function toKenyaMsisdn(input) {
  const digits = input.replace(/\D/g, '')
  if (/^07\d{8}$/.test(digits) || /^01\d{8}$/.test(digits)) return `254${digits.slice(1)}`
  if (/^2547\d{8}$/.test(digits) || /^2541\d{8}$/.test(digits)) return digits
  if (/^7\d{8}$/.test(digits) || /^1\d{8}$/.test(digits)) return `254${digits}`
  return null
}

const KES_ESTIMATE = {
  KES: 1, USD: 130, EUR: 145, GBP: 165, CAD: 95, AUD: 85,
}

export async function processMpesaStk(body, env) {
  const phone = toKenyaMsisdn(body.phone || '')
  const amount = Number(body.amount)
  if (!phone) {
    return { status: 400, body: { ok: false, error: 'Enter a Kenyan mobile number (07… or 2547…).' } }
  }
  if (!amount || amount <= 0) {
    return { status: 400, body: { ok: false, error: 'Enter a gift amount.' } }
  }
  const currency = (body.currency || 'KES').toUpperCase()
  const kesAmount = Math.max(1, Math.round(amount * (KES_ESTIMATE[currency] || 130)))
  const checkoutRef = `ws_CO_DEMO_${Date.now()}`
  await new Promise(resolve => setTimeout(resolve, 1200))

  const sbUrl = supabaseUrl(env)
  const supabaseKey = supabaseAnonKey(env)
  if (sbUrl && supabaseKey) {
    const sb = createClient(sbUrl, supabaseKey)
    await sb.from('donations').insert({
      name: (body.name || '').trim() || null,
      email: (body.email || '').trim() || null,
      phone,
      amount,
      currency,
      kes_amount: kesAmount,
      cause: body.cause || 'Parish',
      frequency: body.frequency || 'once',
      status: 'demo_prompt_sent',
      checkout_ref: checkoutRef,
      demo: true,
      notes: 'Simulated STK Push — no Safaricom API, no money moved.',
    })
  }

  return { status: 200, body: { ok: true, demo: true, checkoutRef, kesAmount, phone } }
}

export async function processMpesaConfirm(body, env) {
  if (!body.checkoutRef) {
    return { status: 400, body: { ok: false, error: 'Missing checkout reference.' } }
  }
  const sbUrl = supabaseUrl(env)
  const supabaseKey = supabaseAnonKey(env)
  if (sbUrl && supabaseKey) {
    const sb = createClient(sbUrl, supabaseKey)
    await sb.from('donations').update({
      status: body.paid ? 'demo_paid' : 'demo_cancelled',
    }).eq('checkout_ref', body.checkoutRef)
  }
  return { status: 200, body: { ok: true, demo: true, paid: Boolean(body.paid) } }
}
