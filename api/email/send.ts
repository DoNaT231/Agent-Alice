import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleEmailRoute } from '../../lib/email/routes/email.routes.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const result = await handleEmailRoute(
    '/api/email/send',
    req.method ?? 'GET',
    req.body,
    process.env.GEMINI_API_KEY,
  )

  res.status(result.status).json(result.body)
}
