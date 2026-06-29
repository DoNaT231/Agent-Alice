/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * Vercel serverless endpoint: POST /api/tools/run
 * A lib/tools/routes/tools.routes handleToolsRoute-ját hívja.
 * Jelenleg ctx=null – szerver oldali Firestore nélkül hibát ad; a kliens futtatja a tool-okat.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleToolsRoute } from '../../lib/tools/routes/tools.routes.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const result = await handleToolsRoute(
    '/api/tools/run',
    req.method ?? 'GET',
    req.body,
    null,
  )

  res.status(result.status).json(result.body)
}
