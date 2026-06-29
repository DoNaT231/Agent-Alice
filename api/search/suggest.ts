import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleSearchRoute } from '../../lib/search/routes/search.routes.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const result = await handleSearchRoute(
    '/api/search/suggest',
    req.method ?? 'GET',
    req.body,
    process.env.GEMINI_API_KEY,
  )

  res.status(result.status).json(result.body)
}
