import type { ChatMessage } from '../../../types/chat'
import type {
  BusinessDetailsPayload,
  BusinessResultsPayload,
  EmailConfirmationPayload,
  EmailDraftPayload,
  EmailSentStatusPayload,
  EmailSummaryPayload,
  ProfileDataPayload,
  ProfileEditPayload,
  ProfileMissingInfoPayload,
  ProfileUpdatedPayload,
} from '../../../../shared/types/messages'
import type { SearchResultsPayload } from '../../../../shared/types/search'
import { BusinessDetailsCard } from '../../business/components/BusinessDetailsCard'
import { BusinessResultsCard } from '../../business/components/BusinessResultsCard'
import { EmailConfirmationCard } from '../../email/components/EmailConfirmationCard'
import { EmailDraftCard } from '../../email/components/EmailDraftCard'
import { EmailSummaryCard } from '../../email/components/EmailSummaryCard'
import { MissingProfileInfoCard } from '../../profile/components/MissingProfileInfoCard'
import { PersonalInfoCard } from '../../profile/components/PersonalInfoCard'
import { SearchResultsList } from '../../search/components/SearchResultsList'
import { useOptionalChatWorkflow } from '../context/useChatWorkflow'
import { MarkdownMessage } from '../../../components/chat/MarkdownMessage'
import { Card } from '../../../shared/components/Card'

interface ActionRendererProps {
  message: ChatMessage
}

function asPayload<T>(payload: ChatMessage['payload']): T | null {
  if (!payload || typeof payload !== 'object') return null
  return payload as T
}

function MessageIntro({ content }: { content: string }) {
  if (!content.trim()) return null
  return <MarkdownMessage content={content} variant="assistant" />
}

function ProfileUpdatedView({ content, payload }: { content: string; payload: ProfileUpdatedPayload }) {
  const workflow = useOptionalChatWorkflow()

  return (
    <div className="space-y-3">
      <MessageIntro content={content} />
      {payload.showProfileButton ? (
        <button
          type="button"
          onClick={() => void workflow?.showProfileCard()}
          className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-950/30 dark:text-indigo-300"
        >
          Adataim megtekintése
        </button>
      ) : null}
    </div>
  )
}

export function ActionRenderer({ message }: ActionRendererProps) {
  const { type, content, payload } = message

  switch (type) {
    case 'profile_updated': {
      const data = asPayload<ProfileUpdatedPayload>(payload)
      if (!data) break
      return <ProfileUpdatedView content={content} payload={data} />
    }

    case 'business_results': {
      const data = asPayload<BusinessResultsPayload>(payload)
      if (!data) break
      return (
        <div className="space-y-3">
          <MessageIntro content={content} />
          <BusinessResultsCard {...data} />
        </div>
      )
    }

    case 'business_details': {
      const data = asPayload<BusinessDetailsPayload>(payload)
      if (!data) break
      return (
        <div className="space-y-3">
          <MessageIntro content={content} />
          <BusinessDetailsCard {...data} />
        </div>
      )
    }

    case 'email_draft': {
      const data = asPayload<EmailDraftPayload>(payload)
      if (!data) break
      return (
        <div className="space-y-3">
          <MessageIntro content={content} />
          <EmailDraftCard {...data} />
        </div>
      )
    }

    case 'email_confirmation': {
      const data = asPayload<EmailConfirmationPayload>(payload)
      if (!data) break
      return (
        <div className="space-y-3">
          <MessageIntro content={content} />
          <EmailConfirmationCard payload={data} />
        </div>
      )
    }

    case 'email_sent_status': {
      const data = asPayload<EmailSentStatusPayload>(payload)
      if (!data) break
      return (
        <div className="space-y-3">
          <MessageIntro content={content} />
          <Card>
            <p className="m-0 text-sm text-gray-800 dark:text-gray-100">
              Email ide: <strong>{data.to}</strong> — {data.status}
              {data.mock ? ' (mock)' : ''}
            </p>
          </Card>
        </div>
      )
    }

    case 'email_summary': {
      const data = asPayload<EmailSummaryPayload>(payload)
      if (!data) break
      return (
        <div className="space-y-3">
          <MessageIntro content={content} />
          <EmailSummaryCard {...data} />
        </div>
      )
    }

    case 'profile_edit':
    case 'profile_data': {
      const data = asPayload<ProfileEditPayload | ProfileDataPayload>(payload)
      if (!data) break
      return (
        <div className="space-y-3">
          <MessageIntro content={content} />
          <PersonalInfoCard profile={data.profile} />
        </div>
      )
    }

    case 'profile_missing_info': {
      const data = asPayload<ProfileMissingInfoPayload>(payload)
      if (!data) break
      return (
        <div className="space-y-3">
          <MessageIntro content={content} />
          <MissingProfileInfoCard {...data} />
        </div>
      )
    }

    case 'search_results': {
      const data = asPayload<SearchResultsPayload>(payload)
      if (!data?.results?.length) {
        return <MarkdownMessage content={content} variant="assistant" />
      }

      return (
        <div className="space-y-3">
          <MessageIntro content={content} />
          <SearchResultsList query={data.query} results={data.results} />
        </div>
      )
    }

    case 'job_results':
    case 'application_draft':
      return (
        <div className="space-y-3">
          <MessageIntro content={content} />
          <Card>
            <p className="m-0 text-sm text-gray-600 dark:text-gray-300">
              {type === 'job_results'
                ? 'Job results card will appear here.'
                : 'Application draft card will appear here.'}
            </p>
          </Card>
        </div>
      )

    default:
      break
  }

  return <MarkdownMessage content={content} variant="assistant" />
}
