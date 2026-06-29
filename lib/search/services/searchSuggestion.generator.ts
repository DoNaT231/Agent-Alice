import { generateChatReply } from '../../gemini.js'
import { normalizeSearchResultItem } from '../../../shared/search/searchFormatters.js'
import type {
  SearchResultItem,
  SearchSuggestionRawResponse,
} from '../../../shared/types/search.js'

function parseSearchJson(raw: string): SearchSuggestionRawResponse {
  const jsonMatch = raw.trim().match(/\{[\s\S]*\}/)
  const parsed = JSON.parse(jsonMatch?.[0] ?? raw) as Partial<SearchSuggestionRawResponse>

  const intro =
    typeof parsed.intro === 'string' && parsed.intro.trim()
      ? parsed.intro.trim()
      : 'Találtam pár jó opciót.'

  const results = Array.isArray(parsed.results)
    ? parsed.results
        .filter(
          (item): item is NonNullable<typeof item> =>
            Boolean(item) &&
            typeof item === 'object' &&
            typeof (item as { title?: unknown }).title === 'string' &&
            typeof (item as { description?: unknown }).description === 'string',
        )
        .slice(0, 8)
    : []

  return { intro, results }
}

export async function generateSearchSuggestions(
  query: string,
  apiKey: string,
): Promise<{ intro: string; results: SearchResultItem[] }> {
  const systemPrompt = [
    'You help with lightweight exploratory search suggestions in Hungarian.',
    'Return ONLY valid JSON with this shape:',
    '{"intro":"short Hungarian intro","results":[{"title":"...","subtitle":"short category or type","description":"one Hungarian sentence","details":"1-2 extra practical sentences","tags":["tag1","tag2"],"location":null,"wikipediaLikely":true,"imageSearchQuery":null,"sourceSearchQuery":null}]}',
    'Provide 5-8 results.',
    'subtitle: short type label (e.g. Szobanövény, Autósiskola, Irodai növény).',
    'details: practical extra info (care level, why recommended, what to know). Max 2 short sentences.',
    'tags: 2-4 very short Hungarian keywords.',
    'location: only for local businesses/places when relevant, otherwise null.',
    'Set wikipediaLikely true only for well-known entities that almost certainly have a Wikipedia page.',
    'For local businesses, set wikipediaLikely false and use sourceSearchQuery with a useful Google search phrase.',
    'Do not claim results are verified. These are suggestions.',
  ].join(' ')

  const reply = await generateChatReply(
    [
      { role: 'user', content: systemPrompt },
      { role: 'assistant', content: 'Understood. I will return only compact JSON suggestions.' },
      { role: 'user', content: `Search query: ${query}` },
    ],
    apiKey,
  )

  const parsed = parseSearchJson(reply)
  const results = parsed.results
    .map((item) => normalizeSearchResultItem(item))
    .filter((item) => item.title && item.description)

  if (results.length === 0) {
    throw new Error('Gemini returned no search suggestions.')
  }

  return {
    intro: parsed.intro,
    results,
  }
}
