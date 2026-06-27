import type { ChatApiMessage } from '../shared/types/chat.js'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

const DEFAULT_MODELS = [
  'gemini-3.5-flash',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
] as const

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
  error?: {
    message?: string
    status?: string
  }
}

function getModelCandidates(): string[] {
  const configured = process.env.GEMINI_MODEL?.trim()
  if (!configured) return [...DEFAULT_MODELS]

  return [configured, ...DEFAULT_MODELS.filter((model) => model !== configured)]
}

function configureDevTls(): void {
  if (
    process.env.GEMINI_INSECURE_TLS === 'true' &&
    process.env.NODE_ENV !== 'production'
  ) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  }
}

function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object' || !('cause' in error)) return undefined

  const cause = (error as { cause?: unknown }).cause
  if (!cause || typeof cause !== 'object') return undefined

  if ('code' in cause && typeof cause.code === 'string') {
    return cause.code
  }

  return undefined
}

function formatGeminiError(error: unknown): Error {
  if (!(error instanceof Error)) {
    return new Error('Something went wrong while talking to Gemini.')
  }

  const message = error.message
  const code = getErrorCode(error)

  if (
    code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
    code === 'CERT_HAS_EXPIRED' ||
    message.includes('certificate')
  ) {
    return new Error(
      'SSL certificate error while connecting to Gemini. This is often caused by antivirus HTTPS scanning or a VPN. Try disabling them, or add GEMINI_INSECURE_TLS=true to your .env file for local development only.',
    )
  }

  if (
    message.includes('fetch failed') ||
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT'
  ) {
    return new Error(
      'Could not reach the Gemini API. Check your internet connection, firewall/VPN settings, and that your API key is valid.',
    )
  }

  if (
    message.includes('API_KEY_INVALID') ||
    message.includes('API key not valid') ||
    message.includes('UNAUTHENTICATED') ||
    message.includes('401')
  ) {
    return new Error(
      'Invalid Gemini API key. Create a new key at https://aistudio.google.com/apikey and add it as GEMINI_API_KEY.',
    )
  }

  if (message.includes('404') && message.includes('model')) {
    return new Error(
      'The configured Gemini model is not available. Set GEMINI_MODEL in your .env file or try again later.',
    )
  }

  return error
}

async function generateWithModel(
  messages: ChatApiMessage[],
  apiKey: string,
  modelName: string,
): Promise<string> {
  configureDevTls()

  const contents = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }))

  const response = await fetch(
    `${GEMINI_API_BASE}/models/${modelName}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({ contents }),
    },
  )

  const data = (await response.json()) as GeminiResponse

  if (!response.ok) {
    const apiMessage = data.error?.message ?? `Gemini API error (${response.status})`
    throw new Error(apiMessage)
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text?.trim()) {
    throw new Error('Gemini returned an empty response.')
  }

  return text
}

export async function generateChatReply(
  messages: ChatApiMessage[],
  apiKey: string,
): Promise<string> {
  if (messages.length === 0) {
    throw new Error('At least one message is required.')
  }

  const lastMessage = messages[messages.length - 1]
  if (lastMessage.role !== 'user') {
    throw new Error('The last message must be from the user.')
  }

  const models = getModelCandidates()
  let lastError: Error | null = null

  for (const modelName of models) {
    try {
      return await generateWithModel(messages, apiKey, modelName)
    } catch (error) {
      lastError = formatGeminiError(error)

      const retryable =
        lastError.message.includes('not available') ||
        lastError.message.includes('404')

      if (!retryable) {
        throw lastError
      }
    }
  }

  throw lastError ?? new Error('All Gemini models failed.')
}

function sanitizeTitle(raw: string, fallback: string): string {
  const cleaned = raw
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[.:!?]+$/g, '')

  if (!cleaned) return fallback
  if (cleaned.length <= 60) return cleaned
  return `${cleaned.slice(0, 57)}...`
}

export async function generateConversationTitleWithAI(
  messages: ChatApiMessage[],
  apiKey: string,
): Promise<string> {
  if (messages.length === 0) {
    throw new Error('At least one message is required.')
  }

  const fallback =
    messages.find((message) => message.role === 'user')?.content.trim().slice(0, 40) ??
    'New chat'

  const transcript = messages
    .map((message) => {
      const speaker = message.role === 'user' ? 'User' : 'Assistant'
      return `${speaker}: ${message.content}`
    })
    .join('\n\n')

  const prompt = [
    'Generate a short conversation title (3-6 words) that summarizes this chat.',
    'Return only the title text.',
    'No quotes, no punctuation at the end, same language as the user.',
    '',
    transcript,
  ].join('\n')

  const models = getModelCandidates()
  let lastError: Error | null = null

  for (const modelName of models) {
    try {
      const title = await generateWithModel(
        [{ role: 'user', content: prompt }],
        apiKey,
        modelName,
      )

      return sanitizeTitle(title, fallback)
    } catch (error) {
      lastError = formatGeminiError(error)

      const retryable =
        lastError.message.includes('not available') ||
        lastError.message.includes('404')

      if (!retryable) {
        throw lastError
      }
    }
  }

  throw lastError ?? new Error('All Gemini models failed.')
}
