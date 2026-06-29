/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * Kliens oldali ToolContext összeállítása (Firestore SDK + email API).
 * OAuth tokenek és API kulcsok itt nem kerülnek a böngészőbe – csak user/db/ai hívások.
 */

import type { ToolAuthUser, ToolContext } from '../../../../shared/tools/context'
import { generateEmailDraftFromProfile } from '../../email/services/emailApi'
import {
  createEmailDraft,
  getEmailDraft,
  markEmailDraftSentMock,
} from '../../email/services/emailDraftService'
import {
  getUserProfile,
  updateUserProfile,
} from '../../profile/services/profileService'

export interface CreateClientToolContextOptions {
  userId: string
  authUser?: ToolAuthUser | null
}

export function createClientToolContext(options: CreateClientToolContextOptions): ToolContext {
  return {
    userId: options.userId,
    authUser: options.authUser ?? null,
    db: {
      getProfile: getUserProfile,
      updateProfile: updateUserProfile,
      createEmailDraft,
      getEmailDraft,
      markEmailDraftSentMock,
    },
    aiClient: {
      generateEmailDraft: generateEmailDraftFromProfile,
    },
  }
}
