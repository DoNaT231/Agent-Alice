/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * Szabályalapú intent → tool hívás leképezés.
 * A chat nem közvetlenül hív service-eket, hanem tool nevet és inputot kap.
 * Később AI-alapú tool választás is ide köthető.
 */

import type { SecretaryIntent } from '../../shared/secretary/intentParser.js'
import { wantsManualProfileForm } from '../../shared/secretary/intentParser.js'
import { extractProfileUpdates } from '../../shared/secretary/profileExtractor.js'
import type { ToolMessageResult } from '../../shared/tools/types.js'

export interface MappedToolCall {
  toolName: string
  input: Record<string, unknown>
  /** Opcionális: tool eredmény finomhangolása (pl. profile.get → profile_edit kártya). */
  postProcess?: (result: ToolMessageResult) => ToolMessageResult
}

/** Felhasználói üzenet intentjéből tool hívás készítése. */
export function mapIntentToToolCall(
  intent: SecretaryIntent,
  userMessage: string,
  userId: string,
): MappedToolCall | null {
  if (intent.type === 'show_profile') {
    const manualForm = wantsManualProfileForm(userMessage)

    return {
      toolName: 'profile.get',
      input: { userId },
      postProcess: (result) =>
        manualForm
          ? {
              ...result,
              type: 'profile_edit',
              content:
                'Rendben, itt tudod kézzel kitölteni az adataidat. Ha kész vagy, kattints a Mentés gombra.',
            }
          : {
              ...result,
              type: 'profile_edit',
              content: 'Itt vannak a mentett adataid. Szerkesztheted és elmentheted őket.',
            },
    }
  }

  if (intent.type === 'profile_save') {
    return {
      toolName: 'profile.update',
      input: { userId, updates: intent.updates },
    }
  }

  if (intent.type === 'email_draft') {
    return {
      toolName: 'email.createDraft',
      input: {
        userId,
        to: intent.to,
        emailType: 'outreach',
        userRequest: userMessage,
      },
    }
  }

  return null
}

/** Chatből kinyert profil mezők mentése (pl. függő email folyamat közben). */
export function mapInlineProfileUpdateToToolCall(
  userId: string,
  updates: ReturnType<typeof extractProfileUpdates>,
): MappedToolCall | null {
  if (Object.keys(updates).length === 0) return null

  return {
    toolName: 'profile.update',
    input: { userId, updates },
  }
}

/** Hiányzó adatok kitöltése után email draft folytatása. */
export function mapContinueEmailDraftToolCall(
  userId: string,
  to: string,
  userMessage: string,
): MappedToolCall {
  return {
    toolName: 'email.createDraft',
    input: {
      userId,
      to,
      emailType: 'outreach',
      userRequest: userMessage,
    },
  }
}
