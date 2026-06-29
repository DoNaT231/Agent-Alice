/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * Tool: profile.update – profilmezők mentése Firestore-ba.
 * Mentés után profile_updated üzenet jelenik meg megerősítéssel (chat UX).
 */

import type { UserProfile } from '../../../../shared/types/profile.js'
import { formatProfileSaveConfirmation } from '../../../../shared/secretary/profileExtractor.js'
import type { ToolDefinition } from '../types.js'

export interface UpdateProfileToolInput {
  userId: string
  updates: Partial<UserProfile>
}

export const updateProfileTool: ToolDefinition<UpdateProfileToolInput> = {
  name: 'profile.update',
  description: 'Update one or more saved profile fields in Firestore.',
  inputSchema: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'Firebase user ID' },
      updates: { type: 'object', description: 'Partial profile fields to save' },
    },
    required: ['userId', 'updates'],
  },
  permissions: {
    reads: ['profile'],
    writes: ['profile'],
    externalAccess: false,
  },
  requiresApproval: false,
  riskLevel: 'medium',
  async handler(input, context) {
    const merged = await context.db.updateProfile(input.userId, input.updates)

    return {
      type: 'profile_updated',
      content: formatProfileSaveConfirmation(input.updates),
      payload: {
        updatedFields: input.updates,
        updatedFieldKeys: Object.keys(input.updates).filter((key) => key !== 'updatedAt'),
        showProfileButton: true,
        profile: merged,
      },
      moduleUsed: 'profile',
    }
  },
}
