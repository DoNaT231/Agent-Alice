import { CheckCircle2, Mail } from 'lucide-react'
import type { EmailConfirmationPayload } from '../../../../shared/types/messages'

export interface EmailConfirmationCardProps {
  payload: EmailConfirmationPayload
  onConfirm?: () => void
  onEdit?: () => void
}

export function EmailConfirmationCard({ payload, onConfirm, onEdit }: EmailConfirmationCardProps) {
  return (
    <div className="w-full rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/30 dark:bg-amber-950/20">
      <div className="mb-3 flex items-center gap-2">
        <Mail size={16} className="text-amber-600 dark:text-amber-400" />
        <h3 className="m-0 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Confirm before sending
        </h3>
      </div>

      <div className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
        <p className="m-0">
          <span className="font-medium">To:</span> {payload.to}
        </p>
        {payload.companyName ? (
          <p className="m-0">
            <span className="font-medium">Company:</span> {payload.companyName}
          </p>
        ) : null}
        <p className="m-0">
          <span className="font-medium">Subject:</span> {payload.subject}
        </p>
      </div>

      <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-white/80 p-3 text-xs whitespace-pre-wrap text-gray-800 dark:bg-gray-900/70 dark:text-gray-100">
        {payload.body}
      </pre>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!onConfirm}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          <CheckCircle2 size={14} />
          Approve & send
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={!onEdit}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-white/70 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
        >
          Edit draft
        </button>
      </div>
    </div>
  )
}
