import { generateSearchSuggestions } from '../services/searchSuggestion.generator.js'
import type {
  GenerateSearchSuggestionsRequestBody,
  GenerateSearchSuggestionsResponseBody,
} from '../../../shared/types/search.js'

type SearchRouteResult =
  | { status: 200; body: GenerateSearchSuggestionsResponseBody }
  | { status: 400 | 405 | 500; body: { error: string } }

function parseSuggestBody(body: unknown): GenerateSearchSuggestionsRequestBody | null {
  if (!body || typeof body !== 'object') return null

  const candidate = body as Record<string, unknown>
  if (typeof candidate.query !== 'string' || !candidate.query.trim()) return null

  return { query: candidate.query.trim() }
}

export async function handleSearchRoute(
  path: string,
  method: string,
  body: unknown,
  apiKey: string | undefined,
): Promise<SearchRouteResult> {
  if (method !== 'POST') {
    return { status: 405, body: { error: 'Method not allowed.' } }
  }

  if (path !== '/api/search/suggest') {
    return { status: 400, body: { error: 'Search route not found.' } }
  }

  const parsed = parseSuggestBody(body)
  if (!parsed) {
    return { status: 400, body: { error: 'Invalid request body.' } }
  }

  if (!apiKey) {
    return { status: 500, body: { error: 'Gemini API key is not configured.' } }
  }

  try {
    const generated = await generateSearchSuggestions(parsed.query, apiKey)

    return {
      status: 200,
      body: {
        intro: generated.intro,
        results: generated.results,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not generate search suggestions.'
    return { status: 500, body: { error: message } }
  }
}
