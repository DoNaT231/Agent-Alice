import { createContext } from 'react'
import type { EmailSentStatusPayload } from '../../../../shared/types/messages'

export interface ChatWorkflowContextValue {
  showProfileCard: () => Promise<void>
  continueEmailDraft: (to: string, userMessage?: string) => Promise<void>
  continueEmailDraftIfPending: () => Promise<boolean>
  appendEmailSentStatus: (content: string, payload: EmailSentStatusPayload) => Promise<void>
  notifyProfileSaved: (content: string) => Promise<void>
}

export const ChatWorkflowContext = createContext<ChatWorkflowContextValue | null>(null)
