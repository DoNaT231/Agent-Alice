import { generateEmailDraft } from '../services/emailDraft.generator.js'
import { sendEmail } from '../services/gmail.service.js'
import type {
  EmailErrorBody,
  GenerateEmailDraftRequestBody,
  GenerateEmailDraftResponseBody,
  SendEmailRequestBody,
  SendEmailResponseBody,
} from '../../../shared/types/email.js'
import type { UserProfile } from '../../../shared/types/profile.js'
import { EMPTY_USER_PROFILE } from '../../../shared/types/profile.js'

type EmailRouteResult =
  | { status: 200; body: GenerateEmailDraftResponseBody | SendEmailResponseBody }
  | { status: 400 | 405 | 500; body: EmailErrorBody }

function isUserProfile(value: unknown): value is UserProfile {
  return typeof value === 'object' && value !== null
}

function parseGenerateBody(body: unknown): GenerateEmailDraftRequestBody | null {
  if (!body || typeof body !== 'object') return null

  const candidate = body as Record<string, unknown>
  if (typeof candidate.to !== 'string' || !candidate.to.trim()) return null
  if (typeof candidate.userMessage !== 'string') return null
  if (!isUserProfile(candidate.profile)) return null

  return {
    to: candidate.to.trim(),
    profile: { ...EMPTY_USER_PROFILE, ...candidate.profile },
    userMessage: candidate.userMessage,
  }
}

function parseSendBody(body: unknown): SendEmailRequestBody | null {
  if (!body || typeof body !== 'object') return null

  const candidate = body as Record<string, unknown>
  if (
    typeof candidate.draftId !== 'string' ||
    typeof candidate.to !== 'string' ||
    typeof candidate.subject !== 'string' ||
    typeof candidate.body !== 'string'
  ) {
    return null
  }

  return {
    draftId: candidate.draftId,
    to: candidate.to,
    subject: candidate.subject,
    body: candidate.body,
  }
}

export async function handleEmailRoute(
  path: string,
  method: string,
  body: unknown,
  apiKey: string | undefined,
): Promise<EmailRouteResult> {
  if (method !== 'POST') {
    return { status: 405, body: { error: 'Method not allowed.' } }
  }

  if (path === '/api/email/draft') {
    const parsed = parseGenerateBody(body)
    if (!parsed) {
      return { status: 400, body: { error: 'Invalid request body.' } }
    }

    if (!apiKey) {
      return { status: 500, body: { error: 'Gemini API key is not configured.' } }
    }

    try {
      const generated = await generateEmailDraft(
        {
          to: parsed.to,
          profile: parsed.profile,
          userMessage: parsed.userMessage,
        },
        apiKey,
      )

      return {
        status: 200,
        body: {
          draft: {
            to: parsed.to,
            subject: generated.subject,
            body: generated.body,
          },
        },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not generate email draft.'
      return { status: 500, body: { error: message } }
    }
  }

  if (path === '/api/email/send') {
    const parsed = parseSendBody(body)
    if (!parsed) {
      return { status: 400, body: { error: 'Invalid request body.' } }
    }

    try {
      const result = await sendEmail(parsed)
      return { status: 200, body: result }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not send email.'
      return { status: 500, body: { error: message } }
    }
  }

  return { status: 400, body: { error: 'Email route not found.' } }
}
