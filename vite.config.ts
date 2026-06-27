import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleChatRequest } from './lib/chat-handler.js'
import { handleTitleRequest } from './lib/title-handler.js'

type ApiHandler = (
  method: string,
  body: unknown,
  apiKey: string | undefined,
) => Promise<{ status: number; body: unknown }>

const API_ROUTES: Record<string, ApiHandler> = {
  '/api/chat': handleChatRequest,
  '/api/chat/title': handleTitleRequest,
}

function devApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split('?')[0] ?? ''
        const handler = API_ROUTES[pathname]

        if (!handler) {
          next()
          return
        }

        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer) => chunks.push(chunk))

        req.on('end', async () => {
          let body: unknown = undefined

          if (chunks.length > 0) {
            try {
              body = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
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
        })

        req.on('error', () => {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Request failed.' }))
        })
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
