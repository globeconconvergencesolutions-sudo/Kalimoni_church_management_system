import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { supabaseAnonKey, supabaseUrl } from './parishEnv.js'

const INBOX_KINDS = ['contact', 'prayer', 'newsletter', 'giving']

function isInboxKind(value) {
  return INBOX_KINDS.includes(value)
}

const KIND_LABEL = {
  contact: 'Contact message',
  prayer: 'Prayer intention',
  newsletter: 'Newsletter signup',
  giving: 'Giving note',
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const hits = new Map()

function limited(ip) {
  const now = Date.now()
  const row = hits.get(ip)
  if (!row || now > row.reset) {
    hits.set(ip, { count: 1, reset: now + 10 * 60 * 1000 })
    return false
  }
  row.count += 1
  return row.count > 8
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function officeEmail(payload, notifyTo) {
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

function visitorEmail(payload) {
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

export async function processInbox(body, env, ip) {
  if (limited(ip || 'unknown')) {
    return { status: 429, body: { ok: false, error: 'Please wait a few minutes before sending another message.' } }
  }

  if (body.website) {
    return { status: 200, body: { ok: true, emailSent: false } }
  }
  if (!body.kind || !isInboxKind(body.kind) || !body.email || !isEmail(String(body.email).trim())) {
    return { status: 400, body: { ok: false, error: 'A valid email is required.' } }
  }
  if (body.kind === 'contact' && !(body.body || '').trim()) {
    return { status: 400, body: { ok: false, error: 'Please write a message.' } }
  }
  if (body.kind === 'prayer' && !(body.body || '').trim()) {
    return { status: 400, body: { ok: false, error: 'Please share your prayer intention.' } }
  }

  const payload = {
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
  let emailError = null

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
        return { status: 500, body: { ok: false, error: insert.error.message } }
      }
    }
  }

  if (!stored && !emailSent) {
    return {
      status: 503,
      body: {
        ok: false,
        error: emailError
          ? `Could not send email (${emailError}). Run the Sprint 3 SQL so messages are still saved.`
          : 'Inbox is not ready. Run supabase/migrations/20260831_sprint3_inbox.sql and confirm Gmail is set in the environment.',
      },
    }
  }

  return { status: 200, body: { ok: true, emailSent, stored } }
}
