import type { BusinessDetailsPayload } from '../../../../shared/types/messages'
import { BusinessCard } from './BusinessCard'

export function BusinessDetailsCard({ business }: BusinessDetailsPayload) {
  return (
    <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/30 dark:bg-emerald-950/20">
      <h3 className="m-0 mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Business details
      </h3>
      <BusinessCard business={business} />
    </div>
  )
}
