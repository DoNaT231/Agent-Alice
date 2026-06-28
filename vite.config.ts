import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleChatRequest } from './lib/chat-handler.js'
import { handleTitleRequest } from './lib/title-handler.js'
import { handleVoiceTranscribeRequest } from './lib/voice-transcribe-handler.js'

type JsonApiHandler = (
  method: string,
  body: unknown,
  apiKey: string | undefined,
) => Promise<{ status: number; body: unknown }>

const JSON_API_ROUTES: Record<string, JsonApiHandler> = {
  '/api/chat': handleChatRequest,
  '/api/chat/title': handleTitleRequest,
}

const VOICE_TRANSCRIBE_ROUTE = '/api/voice/transcribe'

function readRequestBody(req: import('node:http').IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []

    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function devApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split('?')[0] ?? ''

        if (pathname === VOICE_TRANSCRIBE_ROUTE) {
          try {
            const body = await readRequestBody(req)
            const contentType = req.headers['content-type'] ?? ''
            const result = await handleVoiceTranscribeRequest(
              req.method ?? 'GET',
              body,
              contentType,
              env.GEMINI_API_KEY,
            )

            res.statusCode = result.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(result.body))
          } catch {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Request failed.' }))
          }

          return
        }

        const handler = JSON_API_ROUTES[pathname]

        if (!handler) {
          next()
          return
        }

        try {
          const bodyBuffer = await readRequestBody(req)
          let body: unknown = undefined

          if (bodyBuffer.length > 0) {
            try {
              body = JSON.parse(bodyBuffer.toString('utf-8'))
            } catch {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Invalid JSON body.' }))
              return
            }
          }

          const result = await handler(req.method ?? 'GET', body, env.GEMINI_API_KEY)

          res.statusCode = result.status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result.body))
        } catch {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Request failed.' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith('VITE_')) {
      process.env[key] ??= value
    }
  }

  return {
    plugins: [react(), tailwindcss(), devApiPlugin(env)],
  }
})
