import type { SearchResultItem, SearchSuggestionRawItem, SearchResultsPayload } from '../types/search.js'

export function buildGoogleImageSearchUrl(query: string): string {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query.trim())}`
}

export function buildGoogleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`
}

export function buildWikipediaUrl(title: string): string {
  const slug = title.trim().replace(/\s+/g, '_')
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(slug)}`
}

export function coerceSearchResultItem(item: Partial<SearchResultItem>): SearchResultItem {
  const title = String(item.title ?? '').trim()
  const description = String(item.description ?? '').trim()
  const tags = Array.isArray(item.tags)
    ? item.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 4)
    : []

  return {
    title,
    subtitle: item.subtitle?.trim() || null,
    description,
    details: item.details?.trim() || null,
    tags,
    location: item.location?.trim() || null,
    wikipediaUrl: item.wikipediaUrl ?? null,
    imageSearchUrl: item.imageSearchUrl ?? null,
    sourceUrl: item.sourceUrl ?? null,
  }
}

export function coerceSearchResultsPayload(
  payload: Partial<SearchResultsPayload>,
): SearchResultsPayload {
  const results = Array.isArray(payload.results) ? payload.results.map(coerceSearchResultItem) : []

  return {
    query: String(payload.query ?? '').trim(),
    results: results.filter((item) => item.title && item.description),
  }
}

export function normalizeSearchResultItem(raw: SearchSuggestionRawItem): SearchResultItem {
  const title = raw.title.trim()
  const subtitle = raw.subtitle?.trim() || null
  const description = raw.description.trim()
  const details = raw.details?.trim() || null
  const location = raw.location?.trim() || null
  const tags = Array.isArray(raw.tags)
    ? raw.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 4)
    : []
  const imageQuery = (raw.imageSearchQuery?.trim() || title).trim()
  const sourceQuery = raw.sourceSearchQuery?.trim() || ''

  return {
    title,
    subtitle,
    description,
    details,
    tags,
    location,
    wikipediaUrl: raw.wikipediaLikely ? buildWikipediaUrl(title) : null,
    imageSearchUrl: imageQuery ? buildGoogleImageSearchUrl(imageQuery) : null,
    sourceUrl: sourceQuery ? buildGoogleSearchUrl(sourceQuery) : null,
  }
}

export function formatSearchResultsAsText(
  intro: string,
  results: SearchResultItem[],
): string {
  const lines = [intro.trim(), '']

  results.forEach((item, index) => {
    const header = item.subtitle ? `${item.title} (${item.subtitle})` : item.title
    lines.push(`${index + 1}. ${header} – ${item.description}`)
    if (item.location) lines.push(`Hely: ${item.location}`)
    if (item.details) lines.push(item.details)
    if (item.tags.length) lines.push(`Címkék: ${item.tags.join(', ')}`)
    if (item.wikipediaUrl) lines.push(`Wikipedia: ${item.wikipediaUrl}`)
    if (item.imageSearchUrl) lines.push(`Képek: ${item.imageSearchUrl}`)
    if (item.sourceUrl) lines.push(`Keresés: ${item.sourceUrl}`)
    lines.push('')
  })

  return lines.join('\n').trim()
}
