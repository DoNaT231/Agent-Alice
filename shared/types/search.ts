export interface SearchResultItem {
  title: string
  subtitle: string | null
  description: string
  details: string | null
  tags: string[]
  location: string | null
  wikipediaUrl: string | null
  imageSearchUrl: string | null
  sourceUrl: string | null
}

export interface SearchResultsPayload {
  query: string
  results: SearchResultItem[]
}

export interface GenerateSearchSuggestionsRequestBody {
  query: string
}

export interface GenerateSearchSuggestionsResponseBody {
  intro: string
  results: SearchResultItem[]
}

export interface SearchSuggestionRawItem {
  title: string
  subtitle?: string | null
  description: string
  details?: string | null
  tags?: string[] | null
  location?: string | null
  wikipediaLikely?: boolean
  imageSearchQuery?: string | null
  sourceSearchQuery?: string | null
}

export interface SearchSuggestionRawResponse {
  intro: string
  results: SearchSuggestionRawItem[]
}
