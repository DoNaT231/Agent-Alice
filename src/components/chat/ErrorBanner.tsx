import { AlertCircle, X } from 'lucide-react'

interface ErrorBannerProps {
  message: string
  onDismiss: () => void
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      className="mx-3 mb-3 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-red-700 sm:mx-6 sm:px-4 sm:py-3 dark:border-red-400/35 dark:bg-red-950/25 dark:text-red-300"
      role="alert"
    >
      <AlertCircle size={18} className="shrink-0" />
      <p className="m-0 flex-1 text-sm">{message}</p>
      <button
        type="button"
        className="flex items-center justify-center rounded-md p-1 hover:bg-black/6 dark:hover:bg-white/10"
        onClick={onDismiss}
        aria-label="Dismiss error"
      >
        <X size={16} />
      </button>
    </div>
  )
}
