/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * Tool: profile.get – mentett profil betöltése Firestore-ból.
 */

import type { ToolDefinition } from '../types.js'

export interface GetProfileToolInput {
  userId: string
}

export const getProfileTool: ToolDefinition<GetProfileToolInput> = {
  name: 'profile.get',
  description: 'Load the saved user profile from Firestore.',
  inputSchema: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'Firebase user ID' },
    },
    required: ['userId'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['profile_data'] },
      content: { type: 'string' },
      payload: { type: 'object' },
    },
  },
  permissions: {
    reads: ['profile'],
    writes: [],
    externalAccess: false,
  },
  requiresApproval: false,
  riskLevel: 'low',
  async handler(input, context) {
    const profile = await context.db.getProfile(input.userId)

    return {
      type: 'profile_data',
      content: 'Betöltöttem az elmentett adataidat.',
      payload: { profile },
      moduleUsed: 'profile',
    }
  },
}
