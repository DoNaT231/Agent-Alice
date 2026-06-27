import { Bot } from 'lucide-react'

export function LoadingIndicator() {
  return (
    <div className="flex max-w-3xl gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.625rem] border border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        <Bot size={18} />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-gray-200 bg-gray-50 px-4 py-3.5 dark:border-gray-700 dark:bg-gray-800">
        <span className="h-[0.45rem] w-[0.45rem] animate-loading-dot rounded-full bg-gray-500 dark:bg-gray-400" />
        <span className="h-[0.45rem] w-[0.45rem] animate-loading-dot rounded-full bg-gray-500 [animation-delay:0.15s] dark:bg-gray-400" />
        <span className="h-[0.45rem] w-[0.45rem] animate-loading-dot rounded-full bg-gray-500 [animation-delay:0.3s] dark:bg-gray-400" />
      </div>
    </div>
  )
}
