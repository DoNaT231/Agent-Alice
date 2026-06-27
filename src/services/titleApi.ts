import type { ChatApiMessage, TitleRequestBody, TitleResponseBody } from '../types/chat'

export class TitleApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TitleApiError'
  }
}

export async function generateConversationTitle(messages: ChatApiMessage[]): Promise<string> {
  const body: TitleRequestBody = { messages }

  let response: Response
  try {
    response = await fetch('/api/chat/title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new TitleApiError('Unable to generate a conversation title.')
  }

  const data: unknown = await response.json()

  if (!response.ok) {
    const errorMessage =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : 'Could not generate title.'

    throw new TitleApiError(errorMessage)
  }

  const parsed = data as TitleResponseBody
  return parsed.title
}
