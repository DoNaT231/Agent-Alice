/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * Titkárnő (secretary) chat workflow – szabályalapú intent felismerés után tool hívások.
 * Nem közvetlenül service-eket hív: intent → intentMapper → tool → chat üzenet.
 * A keresés még külön flow (searchService), nem tool.
 * Kezeli a függő email címzettet is (hiányzó profil kitöltése közben).
 */

import type { ChatMessage } from '../../../types/chat'
import type { ProfileFieldKey } from '../../../../shared/types/profile'
import { PROFILE_FIELD_LABELS } from '../../../../shared/types/profile'
import { detectSecretaryIntent } from '../../../../shared/secretary/intentParser'
import { extractProfileUpdates } from '../../../../shared/secretary/profileExtractor'
import { fetchSearchSuggestions } from '../../search/services/searchService'
import {
  mapContinueEmailDraftToolCall,
  mapInlineProfileUpdateToToolCall,
  mapIntentToToolCall,
} from '../../../../lib/tools/intentMapper'
import { executeToolAndBuildMessage } from '../../tools/services/toolChatBridge'

type AssistantMessageInput = Omit<ChatMessage, 'id' | 'createdAt'>

export interface SecretaryWorkflowOptions {
  userId: string
  userMessage: string
  addAssistantMessage: (message: AssistantMessageInput) => Promise<void>
  getPendingEmailTo?: () => string | null
  setPendingEmailTo?: (to: string | null) => void
}

/** Fő belépési pont: ha kezeli az üzenetet, 'handled', különben átadja a sima chatnek. */
export async function runSecretaryWorkflow(
  options: SecretaryWorkflowOptions,
): Promise<'handled' | 'fallback'> {
  const intent = detectSecretaryIntent(options.userMessage)
  const pendingTo = options.getPendingEmailTo?.()
  const inlineUpdates = extractProfileUpdates(options.userMessage)

  // Függő email mellett inline profil frissítés (pl. „a telefonszámom 06…”)
  if (intent.type === 'chat' && pendingTo && Object.keys(inlineUpdates).length > 0) {
    const updateCall = mapInlineProfileUpdateToToolCall(options.userId, inlineUpdates)
    if (updateCall) {
      await options.addAssistantMessage(
        await executeToolAndBuildMessage(updateCall.toolName, updateCall.input),
      )
    }

    await runEmailCreateDraftTool({
      userId: options.userId,
      to: pendingTo,
      userMessage: options.userMessage,
      addAssistantMessage: options.addAssistantMessage,
      setPendingEmailTo: options.setPendingEmailTo,
    })

    return 'handled'
  }

  if (intent.type === 'chat') {
    return 'fallback'
  }

  const toolCall = mapIntentToToolCall(intent, options.userMessage, options.userId)

  if (toolCall) {
    if (intent.type === 'email_draft') {
      options.setPendingEmailTo?.(intent.to)
    }

    const message = await executeToolAndBuildMessage(
      toolCall.toolName,
      toolCall.input,
      toolCall.postProcess,
    )

    await options.addAssistantMessage(message)

    if (intent.type === 'profile_save') {
      const pendingEmail = options.getPendingEmailTo?.()
      if (pendingEmail) {
        await runEmailCreateDraftTool({
          userId: options.userId,
          to: pendingEmail,
          userMessage: options.userMessage,
          addAssistantMessage: options.addAssistantMessage,
          setPendingEmailTo: options.setPendingEmailTo,
        })
      }
    }

    if (intent.type === 'email_draft' && message.type === 'email_draft') {
      options.setPendingEmailTo?.(null)
    }

    if (intent.type === 'email_draft' && message.type === 'profile_missing_info') {
      options.setPendingEmailTo?.(intent.to)
    }

    return 'handled'
  }

  if (intent.type === 'search') {
    try {
      await startSearchFlow({
        query: intent.query,
        addAssistantMessage: options.addAssistantMessage,
      })
      return 'handled'
    } catch {
      return 'fallback'
    }
  }

  return 'fallback'
}

/** Email draft tool újrahívása (profil kitöltés után). */
export async function runEmailCreateDraftTool(options: {
  userId: string
  to: string
  userMessage: string
  addAssistantMessage: (message: AssistantMessageInput) => Promise<void>
  setPendingEmailTo?: (to: string | null) => void
}): Promise<void> {
  const toolCall = mapContinueEmailDraftToolCall(options.userId, options.to, options.userMessage)
  const message = await executeToolAndBuildMessage(toolCall.toolName, toolCall.input)

  await options.addAssistantMessage(message)

  if (message.type === 'email_draft') {
    options.setPendingEmailTo?.(null)
  } else if (message.type === 'profile_missing_info') {
    options.setPendingEmailTo?.(options.to)
  }
}

export async function startEmailDraftFlow(options: {
  userId: string
  to: string
  userMessage: string
  addAssistantMessage: (message: AssistantMessageInput) => Promise<void>
  setPendingEmailTo?: (to: string | null) => void
}): Promise<void> {
  await runEmailCreateDraftTool(options)
}

/** Profil kártya megjelenítése tool-lal (profile.get → profile_edit). */
export async function showProfileCardMessage(
  userId: string,
  addAssistantMessage: (message: AssistantMessageInput) => Promise<void>,
): Promise<void> {
  await addAssistantMessage(
    await executeToolAndBuildMessage('profile.get', { userId }, (result) => ({
      ...result,
      type: 'profile_edit',
      content: 'Itt vannak a mentett adataid.',
    })),
  )
}

export function buildMissingFieldLabels(keys: ProfileFieldKey[]): string[] {
  return keys.map((key) => PROFILE_FIELD_LABELS[key])
}

/** Keresési javaslatok (még nem tool – külön search modul). */
export async function startSearchFlow(options: {
  query: string
  addAssistantMessage: (message: AssistantMessageInput) => Promise<void>
}): Promise<void> {
  const generated = await fetchSearchSuggestions({ query: options.query })

  await options.addAssistantMessage({
    role: 'assistant',
    type: 'search_results',
    content: generated.intro,
    payload: {
      query: options.query,
      results: generated.results,
    },
    moduleUsed: 'search',
  })
}
