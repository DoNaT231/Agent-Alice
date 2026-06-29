export type MessageType =
  | 'text'
  | 'profile_updated'
  | 'business_results'
  | 'business_details'
  | 'email_draft'
  | 'email_confirmation'
  | 'email_sent_status'
  | 'email_summary'
  | 'profile_edit'
  | 'profile_data'
  | 'profile_missing_info'
  | 'job_results'
  | 'application_draft'
  | 'voice_transcript'
  | 'search_results'

export interface BusinessItem {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  website?: string
  rating?: number
}

export interface BusinessResultsPayload {
  query: string
  results: BusinessItem[]
}

export interface BusinessDetailsPayload {
  business: BusinessItem
}

export interface EmailDraftPayload {
  draftId?: string
  to: string
  subject: string
  body: string
}

export interface EmailConfirmationPayload {
  draftId: string
  to: string
  companyName?: string
  subject: string
  body: string
}

export interface EmailSentStatusPayload {
  draftId: string
  to: string
  subject: string
  status: 'sent' | 'sent_mock' | 'failed' | 'queued'
  mock?: boolean
  messageId?: string
}

export interface EmailSummaryPayload {
  summary: string
  emailCount?: number
  highlights?: string[]
}

import type { ProfileFieldKey, UserProfile } from './profile.js'

export interface ProfileDataPayload {
  profile: UserProfile
}

export interface ProfileEditPayload {
  profile: UserProfile
}

export interface ProfileMissingInfoPayload {
  missingFieldKeys: ProfileFieldKey[]
  profile: UserProfile
  pendingEmailTo?: string
  message?: string
}

export interface ProfileUpdatedPayload {
  updatedFieldKeys: ProfileFieldKey[]
  updatedFields?: Partial<UserProfile>
  showProfileButton?: boolean
  profile?: UserProfile
}

export interface JobResultsPayload {
  query: string
  jobs: Array<{
    id: string
    title: string
    company: string
    location?: string
    url?: string
  }>
}

export interface ApplicationDraftPayload {
  jobId: string
  jobTitle: string
  company: string
  coverLetter: string
}

export interface VoiceTranscriptPayload {
  transcript: string
}

import type { SearchResultsPayload } from './search.js'
export type { SearchResultsPayload, SearchResultItem } from './search.js'

export type MessagePayload =
  | BusinessResultsPayload
  | BusinessDetailsPayload
  | EmailDraftPayload
  | EmailConfirmationPayload
  | EmailSentStatusPayload
  | EmailSummaryPayload
  | ProfileEditPayload
  | ProfileDataPayload
  | ProfileMissingInfoPayload
  | ProfileUpdatedPayload
  | JobResultsPayload
  | ApplicationDraftPayload
  | VoiceTranscriptPayload
  | SearchResultsPayload
  | Record<string, unknown>

export const ACTION_MESSAGE_TYPES: MessageType[] = [
  'profile_updated',
  'business_results',
  'business_details',
  'email_draft',
  'email_confirmation',
  'email_sent_status',
  'email_summary',
  'profile_edit',
  'profile_data',
  'profile_missing_info',
  'job_results',
  'application_draft',
  'search_results',
]

export function isActionMessageType(type: MessageType | undefined): boolean {
  if (!type || type === 'text' || type === 'voice_transcript') return false
  return ACTION_MESSAGE_TYPES.includes(type)
}
