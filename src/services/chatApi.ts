import type {
  ChatApiMessage,
  ChatRequestBody,
  ChatResponseBody,
} from '../types/chat'

export class ChatApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ChatApiError'
  }
}

export async function sendChatMessage(
  messages: ChatApiMessage[],
): Promise<ChatApiMessage> {
  const body: ChatRequestBody = { messages }

  let response: Response
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ChatApiError(
      'Unable to reach the assistant. Check your connection and try again.',
    )
  }

  const data: unknown = await response.json()

  if (!response.ok) {
    const errorMessage =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : 'Something went wrong. Please try again.'

    throw new ChatApiError(errorMessage)
  }

  const parsed = data as ChatResponseBody
  return parsed.message
}
