/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * Tool: email.createDraft – Gemini draft generálás + Firestore mentés.
 * Nem küld emailt. Valódi küldéshez később gmail.send (jóváhagyással) vagy Gmail MCP.
 */

import {
  DRIVING_SCHOOL_EMAIL_REQUIRED_FIELDS,
  PROFILE_FIELD_LABELS,
} from '../../../../shared/types/profile.js'
import { getMissingProfileFields } from '../../../../shared/secretary/profileExtractor.js'
import type { ToolDefinition } from '../types.js'

export interface CreateEmailDraftToolInput {
  userId: string
  to: string
  emailType?: string
  userRequest: string
  extraContext?: string
}

export const createEmailDraftTool: ToolDefinition<CreateEmailDraftToolInput> = {
  name: 'email.createDraft',
  description: 'Create an email draft using the user profile and request context.',
  inputSchema: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      to: { type: 'string', description: 'Recipient email address' },
      emailType: { type: 'string', description: 'outreach or reply' },
      userRequest: { type: 'string', description: 'User message context for draft generation' },
      extraContext: { type: 'string' },
    },
    required: ['userId', 'to', 'userRequest'],
  },
  permissions: {
    reads: ['profile', 'email.draft'],
    writes: ['email.draft'],
    externalAccess: true,
  },
  requiresApproval: false,
  riskLevel: 'low',
  async handler(input, context) {
    const profile = await context.db.getProfile(input.userId)
    const missingKeys = getMissingProfileFields(profile, DRIVING_SCHOOL_EMAIL_REQUIRED_FIELDS)

    if (missingKeys.length > 0) {
      return {
        type: 'profile_missing_info',
        content: 'Ehhez az emailhez még hiányzik pár adat.',
        payload: {
          missingFields: missingKeys,
          missingFieldKeys: missingKeys,
          profile,
          pendingEmailTo: input.to,
          message: missingKeys.map((key) => PROFILE_FIELD_LABELS[key]).join(', '),
        },
        moduleUsed: 'profile',
      }
    }

    const userMessage = [input.userRequest, input.extraContext].filter(Boolean).join('\n')
    const generated = await context.aiClient.generateEmailDraft({
      to: input.to,
      profile,
      userMessage,
    })

    const draftId = await context.db.createEmailDraft(input.userId, {
      type: input.emailType === 'reply' ? 'reply' : 'outreach',
      to: generated.to,
      subject: generated.subject,
      body: generated.body,
      status: 'draft',
      source: 'chat',
    })

    return {
      type: 'email_draft',
      content: 'Előkészítettem az emailt.',
      payload: {
        draftId,
        to: generated.to,
        subject: generated.subject,
        body: generated.body,
        status: 'draft',
      },
      moduleUsed: 'email',
    }
  },
}
