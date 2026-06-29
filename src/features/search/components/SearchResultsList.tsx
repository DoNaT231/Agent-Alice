import type { SearchResultsPayload } from '../../../../shared/types/search'
import { coerceSearchResultsPayload } from '../../../../shared/search/searchFormatters'

function ResultLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-xs font-medium text-indigo-600 underline underline-offset-2 hover:opacity-80 dark:text-indigo-400"
    >
      {label}
    </a>
  )
}

export function SearchResultsList(payload: SearchResultsPayload) {
  const { query, results } = coerceSearchResultsPayload(payload)

  if (!results.length) {
    return (
      <p className="m-0 text-sm text-gray-600 dark:text-gray-300">
        Nem találtam javaslatot erre: {query}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <p className="m-0 text-xs text-gray-500 dark:text-gray-400">
        Javaslatok – nem ellenőrzött találatok
      </p>

      <ol className="m-0 list-none space-y-3 p-0">
        {results.map((item, index) => (
          <li
            key={`${item.title}-${index}`}
            className="rounded-lg border border-gray-200 bg-white/70 px-3 py-3 dark:border-gray-700 dark:bg-gray-900/40"
          >
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p className="m-0 text-sm font-medium text-gray-900 dark:text-gray-100">
                {index + 1}. {item.title}
              </p>
              {item.subtitle ? (
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {item.subtitle}
                </span>
              ) : null}
            </div>

            {item.location ? (
              <p className="m-0 mt-1 text-xs text-gray-500 dark:text-gray-400">
                Hely: {item.location}
              </p>
            ) : null}

            <p className="m-0 mt-1.5 text-sm text-gray-700 dark:text-gray-200">{item.description}</p>

            {item.details ? (
              <p className="m-0 mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {item.details}
              </p>
            ) : null}

            {item.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
              {item.wikipediaUrl ? (
                <ResultLink href={item.wikipediaUrl} label="Wikipedia" />
              ) : null}
              {item.imageSearchUrl ? <ResultLink href={item.imageSearchUrl} label="Képek" /> : null}
              {item.sourceUrl ? <ResultLink href={item.sourceUrl} label="Keresés" /> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
