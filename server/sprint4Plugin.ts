import type { IncomingMessage, ServerResponse } from 'node:http'
import { createClient } from '@supabase/supabase-js'
import type { Plugin } from 'vite'
import { processMediaDelete, processMediaUpload } from './mediaApi'
import { supabaseAnonKey, supabaseUrl } from './parishEnv'

function json(res: ServerResponse, status: number, body: Record<string, unknown>) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw.trim()) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('invalid_json'))
      }
    })
    req.on('error', reject)
  })
}

function toKenyaMsisdn(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  if (/^07\d{8}$/.test(digits) || /^01\d{8}$/.test(digits)) return `254${digits.slice(1)}`
  if (/^2547\d{8}$/.test(digits) || /^2541\d{8}$/.test(digits)) return digits
  if (/^7\d{8}$/.test(digits) || /^1\d{8}$/.test(digits)) return `254${digits}`
  return null
}

const KES_ESTIMATE: Record<string, number> = {
  KES: 1, USD: 130, EUR: 145, GBP: 165, CAD: 95, AUD: 85,
}

export function parishSprint4Plugin(env: Record<string, string>): Plugin {
  const handle = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url?.split('?')[0]
    const isMediaRoute = url === '/api/media/upload' || url === '/api/media/delete'
    if (url !== '/api/mpesa/stk' && url !== '/api/mpesa/confirm' && !isMediaRoute) {
      return next()
    }
    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }
    if (req.method !== 'POST') {
      json(res, 405, { ok: false, error: 'Method not allowed' })
      return
    }

    let parsed: unknown
    try {
      parsed = await readJson(req)
    } catch {
      json(res, 400, { ok: false, error: 'Invalid request.' })
      return
    }

    const sbUrl = supabaseUrl(env)
    const supabaseKey = supabaseAnonKey(env)

    if (url === '/api/mpesa/stk') {
      const body = parsed as {
        name?: string
        email?: string
        phone?: string
        amount?: number
        currency?: string
        cause?: string
        frequency?: string
      }
      const phone = toKenyaMsisdn(body.phone || '')
      const amount = Number(body.amount)
      if (!phone) {
        json(res, 400, { ok: false, error: 'Enter a Kenyan mobile number (07… or 2547…).' })
        return
      }
      if (!amount || amount <= 0) {
        json(res, 400, { ok: false, error: 'Enter a gift amount.' })
        return
      }
      const currency = (body.currency || 'KES').toUpperCase()
      const kesAmount = Math.max(1, Math.round(amount * (KES_ESTIMATE[currency] || 130)))
      const checkoutRef = `ws_CO_DEMO_${Date.now()}`
      await new Promise(resolve => setTimeout(resolve, 1200))

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

      json(res, 200, { ok: true, demo: true, checkoutRef, kesAmount, phone })
      return
    }

    if (url === '/api/mpesa/confirm') {
      const body = parsed as { checkoutRef?: string; paid?: boolean }
      if (!body.checkoutRef) {
        json(res, 400, { ok: false, error: 'Missing checkout reference.' })
        return
      }
      if (sbUrl && supabaseKey) {
        const sb = createClient(sbUrl, supabaseKey)
        await sb.from('donations').update({
          status: body.paid ? 'demo_paid' : 'demo_cancelled',
        }).eq('checkout_ref', body.checkoutRef)
      }
      json(res, 200, { ok: true, demo: true, paid: Boolean(body.paid) })
      return
    }

    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')

    if (url === '/api/media/delete') {
      const result = await processMediaDelete(parsed as { id?: string; slotKey?: string }, token, env)
      json(res, result.status, result.body)
      return
    }

    if (url === '/api/media/upload') {
      const result = await processMediaUpload(
        parsed as Parameters<typeof processMediaUpload>[0],
        token,
        env,
      )
      json(res, result.status, result.body)
      return
    }
  }

  return {
    name: 'parish-sprint4',
    configureServer(server) {
      server.middlewares.use((req, res, next) => { void handle(req, res, next) })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => { void handle(req, res, next) })
    },
  }
}
