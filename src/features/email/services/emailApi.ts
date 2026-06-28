import type { GenerateEmailDraftRequestBody, GenerateEmailDraftResponseBody } from '../../../../shared/types/email'

export class EmailApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EmailApiError'
  }
}

export async function generateEmailDraftFromProfile(
  input: GenerateEmailDraftRequestBody,
): Promise<GenerateEmailDraftResponseBody['draft']> {
  const response = await fetch('/api/email/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  const data: unknown = await response.json()

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : 'Could not generate email draft.'

    throw new EmailApiError(message)
  }

  return (data as GenerateEmailDraftResponseBody).draft
}
