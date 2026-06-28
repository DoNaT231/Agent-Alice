import { Mail } from 'lucide-react'
import type { EmailSummaryPayload } from '../../../../shared/types/messages'

export function EmailSummaryCard({ summary, emailCount, highlights = [] }: EmailSummaryPayload) {
  return (
    <div className="w-full rounded-xl border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-500/30 dark:bg-sky-950/20">
      <div className="mb-3 flex items-center gap-2">
        <Mail size={16} className="text-sky-600 dark:text-sky-400" />
        <h3 className="m-0 text-sm font-semibold text-gray-900 dark:text-gray-100">Email summary</h3>
        {typeof emailCount === 'number' ? (
          <span className="text-xs text-gray-500">{emailCount} emails</span>
        ) : null}
      </div>

      <p className="m-0 text-sm leading-relaxed text-gray-800 dark:text-gray-100">{summary}</p>

      {highlights.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
          {highlights.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
