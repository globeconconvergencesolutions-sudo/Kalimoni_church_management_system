import express from 'express'
import cors from 'cors'
import { processMediaUpload, processMediaDelete, envFrom } from './mediaApi.js'
import { processInbox } from './inboxApi.js'
import { processMpesaStk, processMpesaConfirm } from './mpesaApi.js'

const app = express()
const PORT = process.env.PORT || 3000

// Apache sits in front of this app (ProxyPass) — trust its X-Forwarded-For
// so req.ip reflects the real visitor for inbox rate limiting.
app.set('trust proxy', true)

app.use(cors({
  origin: [
    'https://sttheresakalimoniparish.org',
    'https://www.sttheresakalimoniparish.org'
  ],
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Parish API running' })
})

app.post('/api/media/upload', async (req, res) => {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
    const result = await processMediaUpload(req.body, token, envFrom(process.env))
    res.status(result.status).json(result.body)
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: 'Internal server error' })
  }
})

app.post('/api/media/delete', async (req, res) => {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
    const result = await processMediaDelete(req.body, token, envFrom(process.env))
    res.status(result.status).json(result.body)
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: 'Internal server error' })
  }
})

app.post('/api/inbox', async (req, res) => {
  try {
    const result = await processInbox(req.body, envFrom(process.env), req.ip)
    res.status(result.status).json(result.body)
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: 'Internal server error' })
  }
})

app.post('/api/mpesa/stk', async (req, res) => {
  try {
    const result = await processMpesaStk(req.body, envFrom(process.env))
    res.status(result.status).json(result.body)
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: 'Internal server error' })
  }
})

app.post('/api/mpesa/confirm', async (req, res) => {
  try {
    const result = await processMpesaConfirm(req.body, envFrom(process.env))
    res.status(result.status).json(result.body)
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Parish API listening on port ${PORT}`)
})
