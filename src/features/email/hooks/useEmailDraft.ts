import { useCallback, useState } from 'react'
import type { EmailDraftPayload } from '../../../../shared/types/messages'
import { createEmailDraft, updateEmailDraft } from '../services/emailDraftService'

interface UseEmailDraftOptions {
  userId: string | undefined
  initialDraft: EmailDraftPayload
  onDraftIdChange?: (draftId: string) => void
}

export function useEmailDraft({ userId, initialDraft, onDraftIdChange }: UseEmailDraftOptions) {
  const [draftId, setDraftId] = useState(initialDraft.draftId)
  const [to, setTo] = useState(initialDraft.to)
  const [subject, setSubject] = useState(initialDraft.subject)
  const [body, setBody] = useState(initialDraft.body)
  const [isSaving, setIsSaving] = useState(false)

  const saveDraft = useCallback(async () => {
    if (!userId) return null

    setIsSaving(true)

    try {
      if (draftId) {
        await updateEmailDraft(userId, draftId, { to, subject, body })
        return draftId
      }

      const newDraftId = await createEmailDraft(userId, {
        type: 'outreach',
        to,
        subject,
        body,
        status: 'draft',
        source: 'chat',
      })

      setDraftId(newDraftId)
      onDraftIdChange?.(newDraftId)
      return newDraftId
    } finally {
      setIsSaving(false)
    }
  }, [body, draftId, onDraftIdChange, subject, to, userId])

  return {
    draftId,
    to,
    subject,
    body,
    isSaving,
    setTo,
    setSubject,
    setBody,
    saveDraft,
  }
}
