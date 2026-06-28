import { useCallback, useState } from 'react'
import { markEmailDraftSentMock } from '../services/emailDraftService'

interface UseSendEmailOptions {
  userId: string | undefined
}

export function useSendEmail({ userId }: UseSendEmailOptions) {
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMockEmail = useCallback(
    async (input: { draftId: string; to: string; subject: string; body: string }) => {
      if (!userId) return null

      setIsSending(true)
      setError(null)

      try {
        await markEmailDraftSentMock(userId, input.draftId)
        return {
          status: 'sent_mock' as const,
          messageId: `mock_${input.draftId}`,
          mock: true,
        }
      } catch {
        setError('Could not record mock send. Please try again.')
        return null
      } finally {
        setIsSending(false)
      }
    },
    [userId],
  )

  return { isSending, error, sendMockEmail, setError }
}
