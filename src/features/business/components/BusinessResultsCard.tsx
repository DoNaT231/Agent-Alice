import type { BusinessResultsPayload } from '../../../../shared/types/messages'
import { BusinessCard } from './BusinessCard'

export function BusinessResultsCard({ query, results }: BusinessResultsPayload) {
  return (
    <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/30 dark:bg-emerald-950/20">
      <h3 className="m-0 mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Business results
      </h3>
      <p className="m-0 mb-3 text-xs text-gray-500 dark:text-gray-400">Query: {query}</p>
      <div className="space-y-2">
        {results.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>
    </div>
  )
}
