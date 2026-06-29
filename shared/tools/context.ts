/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * ToolContext: MCP-kompatibilis futtatási környezet.
 * userId + authUser a munkamenetből, db az adatréteg, aiClient a generáláshoz.
 * OAuth tokenek és API kulcsok csak backend oldalon injektálhatók.
 */

import type { GenerateEmailDraftRequestBody, GenerateEmailDraftResponseBody } from '../types/email.js'
import type { EmailDraft, EmailDraftCreateInput } from '../types/email.js'
import type { UserProfile } from '../types/profile.js'

export interface ToolAuthUser {
  uid: string
  email?: string | null
  displayName?: string | null
}

/** Injectable adatelérés – kliens Firestore SDK, szerver Admin SDK vagy MCP adapter. */
export interface ToolDb {
  getProfile(userId: string): Promise<UserProfile>
  updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile>
  createEmailDraft(userId: string, draft: EmailDraftCreateInput): Promise<string>
  getEmailDraft(userId: string, draftId: string): Promise<EmailDraft | null>
  markEmailDraftSentMock(userId: string, draftId: string): Promise<void>
}

export interface ToolAiClient {
  generateEmailDraft(
    input: GenerateEmailDraftRequestBody,
  ): Promise<GenerateEmailDraftResponseBody['draft']>
}

export interface ToolContext {
  userId: string
  authUser: ToolAuthUser | null
  db: ToolDb
  aiClient: ToolAiClient
}

/** @deprecated Használd a ToolContext-et. */
export type ToolRuntimeContext = ToolDb & ToolAiClient
