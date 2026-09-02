import type { IncomingMessage, ServerResponse } from 'node:http'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import type { Plugin } from 'vite'
import { isInboxKind, type InboxKind, type InboxPayload } from '../src/lib/inboxTypes'
import { supabaseAnonKey, supabaseUrl } from './parishEnv'

const KIND_LABEL: Record<InboxKind, string> = {
  contact: 'Contact message',
  prayer: 'Prayer intention',
  newsletter: 'Newsletter signup',
  giving: 'Giving note',
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

function json(res: ServerResponse, status: number, body: Record<string, unknown>) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const hits = new Map<string, { count: number; reset: number }>()

function limited(ip: string): boolean {
  const now = Date.now()
  const row = hits.get(ip)
  if (!row || now > row.reset) {
    hits.set(ip, { count: 1, reset: now + 10 * 60 * 1000 })
    return false
  }
  row.count += 1
  return row.count > 8
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function officeEmail(payload: InboxPayload, notifyTo: string): { subject: string; text: string; html: string } {
  const subject = `[Kalimoni] ${KIND_LABEL[payload.kind]}${payload.subject ? ` — ${payload.subject}` : ''}`
  const lines = [
    `${KIND_LABEL[payload.kind]} from the parish website`,
    '',
    `Name: ${payload.name || '—'}`,
    `Email: ${payload.email}`,
    payload.country ? `Country: ${payload.country}` : '',
    payload.subject ? `Subject: ${payload.subject}` : '',
    '',
    payload.body || '(no message body)',
  ].filter(Boolean)
  const text = lines.join('\n')
  const html = `<div style="font-family:Georgia,serif;color:#1C1A18">
  <p style="color:#6B1A2A;letter-spacing:0.12em;text-transform:uppercase;font-size:12px">${escapeHtml(KIND_LABEL[payload.kind])}</p>
  <p><strong>Name:</strong> ${escapeHtml(payload.name || '—')}<br/>
  <strong>Email:</strong> ${escapeHtml(payload.email)}<br/>
  ${payload.country ? `<strong>Country:</strong> ${escapeHtml(payload.country)}<br/>` : ''}
  ${payload.subject ? `<strong>Subject:</strong> ${escapeHtml(payload.subject)}<br/>` : ''}</p>
  <p style="white-space:pre-wrap">${escapeHtml(payload.body || '(no message body)')}</p>
  <p style="font-size:12px;color:#6B6259">Reply directly to this email to reach the sender. Also filed in the parish office inbox.</p>
  <p style="font-size:12px;color:#6B6259">Notify copy: ${escapeHtml(notifyTo)}</p>
</div>`
  return { subject, text, html }
}

function visitorEmail(payload: InboxPayload): { subject: string; text: string; html: string } {
  const thanks =
    payload.kind === 'prayer'
      ? 'We have received your prayer intention. The parish will remember it at Mass.'
      : payload.kind === 'newsletter'
        ? 'You are on the parish news list. We will write when there is something worth sharing.'
        : payload.kind === 'giving'
          ? 'Thank you for your generosity. This note is not a payment receipt — please complete giving via the M-Pesa or bank details on the donate page. The office will follow up if needed.'
          : 'Thank you for writing to St. Theresa Parish, Kalimoni. We will reply as soon as we can.'
  return {
    subject: 'St. Theresa Parish, Kalimoni — we received your message',
    text: `Dear ${payload.name || 'friend'},\n\n${thanks}\n\nPeace,\nSt. Theresa Parish, Kalimoni`,
    html: `<div style="font-family:Georgia,serif;color:#1C1A18">
  <p>Dear ${escapeHtml(payload.name || 'friend')},</p>
  <p>${escapeHtml(thanks)}</p>
  <p>Peace,<br/>St. Theresa Parish, Kalimoni</p>
</div>`,
  }
}

export function parishInboxPlugin(env: Record<string, string>): Plugin {
  const handle = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url?.split('?')[0]
    if (url !== '/api/inbox') return next()
    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }
    if (req.method !== 'POST') {
      json(res, 405, { ok: false, error: 'Method not allowed' })
      return
    }

    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'
    if (limited(ip)) {
      json(res, 429, { ok: false, error: 'Please wait a few minutes before sending another message.' })
      return
    }

    let parsed: unknown
    try {
      parsed = await readJson(req)
    } catch {
      json(res, 400, { ok: false, error: 'Invalid request.' })
      return
    }

    const body = parsed as InboxPayload
    if (body.website) {
      json(res, 200, { ok: true, emailSent: false })
      return
    }
    if (!body.kind || !isInboxKind(body.kind) || !body.email || !isEmail(body.email.trim())) {
      json(res, 400, { ok: false, error: 'A valid email is required.' })
      return
    }
    if ((body.kind === 'contact' || body.kind === 'prayer') && !(body.body || '').trim() && body.kind === 'prayer') {
      json(res, 400, { ok: false, error: 'Please share your prayer intention.' })
      return
    }
    if (body.kind === 'contact' && !(body.body || '').trim()) {
      json(res, 400, { ok: false, error: 'Please write a message.' })
      return
    }

    const payload: InboxPayload = {
      kind: body.kind,
      name: (body.name || '').trim().slice(0, 120),
      email: body.email.trim().slice(0, 180),
      country: (body.country || '').trim().slice(0, 80),
      subject: (body.subject || '').trim().slice(0, 160),
      body: (body.body || '').trim().slice(0, 4000),
    }

    const gmailUser = env.GMAIL_USER || ''
    const gmailPass = (env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '')
    const notifyTo = env.PARISH_NOTIFY_EMAIL || gmailUser
    let emailSent = false
    let emailError: string | null = null

    if (gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user: gmailUser, pass: gmailPass },
        })
        const office = officeEmail(payload, notifyTo)
        await transporter.sendMail({
          from: `"St. Theresa Parish Kalimoni" <${gmailUser}>`,
          to: notifyTo,
          replyTo: payload.email,
          subject: office.subject,
          text: office.text,
          html: office.html,
        })
        const visitor = visitorEmail(payload)
        await transporter.sendMail({
          from: `"St. Theresa Parish Kalimoni" <${gmailUser}>`,
          to: payload.email,
          replyTo: notifyTo,
          subject: visitor.subject,
          text: visitor.text,
          html: visitor.html,
        })
        emailSent = true
      } catch (err) {
        emailError = err instanceof Error ? err.message : 'Email failed'
      }
    }

    let stored = false
    const sbUrl = supabaseUrl(env)
    const supabaseKey = supabaseAnonKey(env)
    if (sbUrl && supabaseKey) {
      const sb = createClient(sbUrl, supabaseKey)
      const insert = await sb.from('inbox_messages').insert({
        kind: payload.kind,
        name: payload.name || null,
        email: payload.email,
        country: payload.country || null,
        subject: payload.subject || null,
        body: payload.body || null,
        email_sent: emailSent,
      })
      stored = !insert.error
      if (insert.error && !/schema cache|does not exist|PGRST205/i.test(`${insert.error.code} ${insert.error.message}`)) {
        if (!emailSent) {
          json(res, 500, { ok: false, error: insert.error.message })
          return
        }
      }
    }

    if (!stored && !emailSent) {
      json(res, 503, {
        ok: false,
        error: emailError
          ? `Could not send email (${emailError}). Run the Sprint 3 SQL so messages are still saved.`
          : 'Inbox is not ready. Run supabase/migrations/20260831_sprint3_inbox.sql and confirm Gmail is set in .env.local.',
      })
      return
    }

    json(res, 200, { ok: true, emailSent, stored })
  }

  return {
    name: 'parish-inbox',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handle(req, res, next)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        void handle(req, res, next)
      })
    },
  }
}
