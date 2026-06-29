import type {
  GenerateSearchSuggestionsRequestBody,
  GenerateSearchSuggestionsResponseBody,
} from '../../../../shared/types/search'

export class SearchApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SearchApiError'
  }
}

export async function fetchSearchSuggestions(
  input: GenerateSearchSuggestionsRequestBody,
): Promise<GenerateSearchSuggestionsResponseBody> {
  const response = await fetch('/api/search/suggest', {
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
        : 'Could not generate search suggestions.'

    throw new SearchApiError(message)
  }

  return data as GenerateSearchSuggestionsResponseBody
}
