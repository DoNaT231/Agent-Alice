import { generateChatReply } from './gemini.js'
import type {
  ChatApiMessage,
  ChatErrorBody,
  ChatRequestBody,
  ChatResponseBody,
} from '../shared/types/chat.js'

export type ChatHandlerResult =
  | { status: 200; body: ChatResponseBody }
  | { status: 400 | 405 | 500; body: ChatErrorBody }

function isValidMessage(message: unknown): message is ChatApiMessage {
  if (!message || typeof message !== 'object') return false

  const candidate = message as Record<string, unknown>
  return (
    (candidate.role === 'user' || candidate.role === 'assistant') &&
    typeof candidate.content === 'string' &&
    candidate.content.trim().length > 0
  )
}

function parseRequestBody(body: unknown): ChatRequestBody | null {
  if (!body || typeof body !== 'object') return null

  const candidate = body as Record<string, unknown>
  if (!Array.isArray(candidate.messages)) return null

  const messages = candidate.messages.filter(isValidMessage)
  if (messages.length === 0) return null

  return { messages }
}

export async function handleChatRequest(
  method: string,
  body: unknown,
  apiKey: string | undefined,
): Promise<ChatHandlerResult> {
  if (method !== 'POST') {
    return { status: 405, body: { error: 'Method not allowed.' } }
  }

  const parsed = parseRequestBody(body)
  if (!parsed) {
    return { status: 400, body: { error: 'Invalid request body.' } }
  }

  if (!apiKey) {
    return {
      status: 500,
      body: {
        error:
          'Gemini API key is not configured. Add GEMINI_API_KEY to your environment.',
      },
    }
  }

  try {
    const reply = await generateChatReply(parsed.messages, apiKey)

    return {
      status: 200,
      body: {
        message: {
          role: 'assistant',
          content: reply,
        },
      },
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Something went wrong while talking to Gemini.'

    return { status: 500, body: { error: message } }
  }
}
