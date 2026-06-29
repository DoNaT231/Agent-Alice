/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * Tool: email.mockSend – teszt küldés (sent_mock), nem valódi email.
 * Valódi küldés SOHA nem automatikus – később gmail.send jóváhagyással (Gmail API vagy MCP).
 */

import type { ToolDefinition } from '../types.js'

export interface MockSendEmailToolInput {
  userId: string
  draftId: string
}

export const mockSendEmailTool: ToolDefinition<MockSendEmailToolInput> = {
  name: 'email.mockSend',
  description: 'Mark an email draft as mock-sent for testing. Does not send a real email.',
  inputSchema: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      draftId: { type: 'string' },
    },
    required: ['userId', 'draftId'],
  },
  permissions: {
    reads: ['email.draft'],
    writes: ['email.draft'],
    externalAccess: false,
  },
  requiresApproval: true,
  riskLevel: 'medium',
  async handler(input, context) {
    const draft = await context.db.getEmailDraft(input.userId, input.draftId)

    if (!draft) {
      throw new Error('Email draft not found.')
    }

    await context.db.markEmailDraftSentMock(input.userId, input.draftId)

    return {
      type: 'email_sent_status',
      content: 'Teszt küldés sikeres. Az email még nem lett valóban elküldve.',
      payload: {
        draftId: input.draftId,
        to: draft.to,
        subject: draft.subject,
        status: 'sent_mock',
        mock: true,
      },
      moduleUsed: 'email',
    }
  },
}
