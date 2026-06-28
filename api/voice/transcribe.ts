import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleVoiceTranscribeRequest } from '../../lib/voice-transcribe-handler.js'

export const config = {
  api: {
    bodyParser: false,
  },
}

function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []

    req.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })

    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const body = await readRawBody(req)
  const contentType = req.headers['content-type'] ?? ''

  const result = await handleVoiceTranscribeRequest(
    req.method ?? 'GET',
    body,
    contentType,
    process.env.GEMINI_API_KEY,
  )

  res.status(result.status).json(result.body)
}
