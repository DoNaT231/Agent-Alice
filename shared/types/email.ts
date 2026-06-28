export type EmailDraftType = 'outreach' | 'reply'

export type EmailDraftStatus = 'draft' | 'approved' | 'sent' | 'sent_mock'

export type EmailDraftSource = 'chat' | 'gmail' | 'manual'

export interface EmailErrorBody {
  error: string
}

export interface SendEmailRequestBody {
  draftId: string
  to: string
  subject: string
  body: string
}

export interface SendEmailResponseBody {
  status: 'sent'
  messageId: string
  mock: boolean
}

export interface EmailDraft {
  id: string
  type: EmailDraftType
  to: string
  subject: string
  body: string
  status: EmailDraftStatus
  source: EmailDraftSource
  createdAt: number
  updatedAt: number
  approvedAt: number | null
  sentAt: number | null
}

export type EmailDraftCreateInput = Omit<
  EmailDraft,
  'id' | 'createdAt' | 'updatedAt' | 'approvedAt' | 'sentAt'
>

export interface GenerateEmailDraftRequestBody {
  to: string
  profile: import('./profile.js').UserProfile
  userMessage: string
}

export interface GenerateEmailDraftResponseBody {
  draft: {
    to: string
    subject: string
    body: string
  }
}
