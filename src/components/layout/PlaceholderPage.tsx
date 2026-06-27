import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex h-full items-center justify-center bg-white p-8 dark:bg-gray-900">
      <div className="max-w-md rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-8 py-10 text-center dark:border-gray-700 dark:bg-gray-800">
        <Construction size={32} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
        <h1 className="m-0 mb-2 text-xl text-gray-900 dark:text-gray-100">{title}</h1>
        <p className="m-0 leading-relaxed text-gray-500 dark:text-gray-400">{description}</p>
        <span className="mt-5 inline-block rounded-full bg-indigo-500/12 px-3 py-1 text-xs font-medium text-indigo-500 dark:bg-indigo-400/15 dark:text-indigo-400">
          Coming soon
        </span>
      </div>
    </div>
  )
}
