import type { BusinessItem } from '../../../../shared/types/messages'

export function BusinessCard({ business }: { business: BusinessItem }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
      <p className="m-0 font-medium text-gray-900 dark:text-gray-100">{business.name}</p>
      {business.address ? (
        <p className="m-0 mt-1 text-xs text-gray-500 dark:text-gray-400">{business.address}</p>
      ) : null}
      {business.email ? (
        <p className="m-0 mt-1 text-xs text-indigo-600 dark:text-indigo-400">{business.email}</p>
      ) : null}
    </div>
  )
}
