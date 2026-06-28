import { useState } from 'react'
import { Loader2, Save, Send } from 'lucide-react'
import { useAuth } from '../../../shared/hooks/useAuth'
import { useOptionalChatWorkflow } from '../../chat/context/useChatWorkflow'
import { canSendEmail } from '../utils/emailValidators'
import {
  createEmailDraft,
  markEmailDraftSentMock,
  updateEmailDraft,
} from '../services/emailDraftService'

export interface EmailDraftCardProps {
  draftId?: string
  to: string
  subject: string
  body: string
}

export function EmailDraftCard({
  draftId: initialDraftId,
  to: initialTo,
  subject: initialSubject,
  body: initialBody,
}: EmailDraftCardProps) {
  const { user } = useAuth()
  const workflow = useOptionalChatWorkflow()
  const [draftId, setDraftId] = useState(initialDraftId)
  const [to, setTo] = useState(initialTo)
  const [subject, setSubject] = useState(initialSubject)
  const [body, setBody] = useState(initialBody)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const persistDraft = async (): Promise<string | null> => {
    if (!user) return null

    if (draftId) {
      await updateEmailDraft(user.uid, draftId, { to, subject, body })
      return draftId
    }

    const newDraftId = await createEmailDraft(user.uid, {
      type: 'outreach',
      to,
      subject,
      body,
      status: 'draft',
      source: 'chat',
    })

    setDraftId(newDraftId)
    return newDraftId
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setFeedback(null)

    try {
      const savedId = await persistDraft()
      if (savedId) setFeedback('Draft elmentve.')
    } catch {
      setError('Nem sikerült elmenteni a draftot.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleMockSend = async () => {
    if (!canSendEmail({ to, subject, body })) {
      setError('Adj meg címzettet, tárgyat és szöveget a küldés előtt.')
      return
    }

    setIsSending(true)
    setError(null)
    setFeedback(null)

    try {
      const savedId = await persistDraft()
      if (!savedId || !user) return

      await markEmailDraftSentMock(user.uid, savedId)

      await workflow?.appendEmailSentStatus(
        `Az email mock módon elküldve ide: ${to.trim()}`,
        {
          draftId: savedId,
          to: to.trim(),
          subject: subject.trim(),
          status: 'sent_mock',
          mock: true,
          messageId: `mock_${savedId}`,
        },
      )

      setFeedback('Mock küldés rögzítve.')
    } catch {
      setError('A mock küldés nem sikerült.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="w-full rounded-xl border border-indigo-200 bg-white p-4 shadow-sm dark:border-indigo-500/30 dark:bg-gray-900">
      <h3 className="m-0 mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Email draft
      </h3>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Címzett</span>
          <input
            type="email"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Tárgy</span>
          <input
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Szöveg</span>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={8}
            className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm leading-relaxed outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>
      </div>

      {error ? <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p> : null}
      {feedback ? <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">{feedback}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleMockSend()}
          disabled={isSaving || isSending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Mock Send
        </button>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || isSending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save draft
        </button>
      </div>
    </div>
  )
}
