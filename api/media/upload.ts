import { envFrom, processMediaUpload } from '../server/mediaApi'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}

type VercelRequest = {
  method?: string
  headers: { authorization?: string }
  body?: unknown
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  json: (body: unknown) => void
  end: () => void
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  const result = await processMediaUpload(
    (req.body ?? {}) as Parameters<typeof processMediaUpload>[0],
    token,
    envFrom(process.env),
  )
  res.status(result.status).json(result.body)
}
