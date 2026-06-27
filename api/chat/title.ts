import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleTitleRequest } from '../../lib/title-handler.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const result = await handleTitleRequest(
    req.method ?? 'GET',
    req.body,
    process.env.GEMINI_API_KEY,
  )

  res.status(result.status).json(result.body)
}
