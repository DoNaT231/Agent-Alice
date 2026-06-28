import type { ChatMessage } from '../../../types/chat'
import type { ProfileFieldKey } from '../../../../shared/types/profile'
import {
  DRIVING_SCHOOL_EMAIL_REQUIRED_FIELDS,
  PROFILE_FIELD_LABELS,
} from '../../../../shared/types/profile'
import { detectSecretaryIntent, wantsManualProfileForm } from '../../../../shared/secretary/intentParser'
import {
  formatProfileSaveConfirmation,
  getMissingProfileFields,
  extractProfileUpdates,
} from '../../../../shared/secretary/profileExtractor'
import { generateEmailDraftFromProfile } from '../../email/services/emailApi'
import { createEmailDraft } from '../../email/services/emailDraftService'
import {
  getUpdatedFieldKeys,
  getUserProfile,
  updateUserProfile,
} from '../../profile/services/profileService'

type AssistantMessageInput = Omit<ChatMessage, 'id' | 'createdAt'>

export interface SecretaryWorkflowOptions {
  userId: string
  userMessage: string
  addAssistantMessage: (message: AssistantMessageInput) => Promise<void>
  getPendingEmailTo?: () => string | null
  setPendingEmailTo?: (to: string | null) => void
}

export async function runSecretaryWorkflow(
  options: SecretaryWorkflowOptions,
): Promise<'handled' | 'fallback'> {
  const intent = detectSecretaryIntent(options.userMessage)
  const pendingTo = options.getPendingEmailTo?.()
  const inlineUpdates = extractProfileUpdates(options.userMessage)

  if (intent.type === 'chat' && pendingTo && Object.keys(inlineUpdates).length > 0) {
    await updateUserProfile(options.userId, inlineUpdates)
    const fieldKeys = getUpdatedFieldKeys(inlineUpdates)

    await options.addAssistantMessage({
      role: 'assistant',
      type: 'profile_updated',
      content: formatProfileSaveConfirmation(inlineUpdates),
      payload: {
        updatedFieldKeys: fieldKeys,
        showProfileButton: true,
      },
      moduleUsed: 'profile',
    })

    await startEmailDraftFlow({
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

  if (intent.type === 'profile_save') {
    await updateUserProfile(options.userId, intent.updates)
    const fieldKeys = getUpdatedFieldKeys(intent.updates)

    await options.addAssistantMessage({
      role: 'assistant',
      type: 'profile_updated',
      content: formatProfileSaveConfirmation(intent.updates),
      payload: {
        updatedFieldKeys: fieldKeys,
        showProfileButton: true,
      },
      moduleUsed: 'profile',
    })

    const pendingTo = options.getPendingEmailTo?.()
    if (pendingTo) {
      await startEmailDraftFlow({
        userId: options.userId,
        to: pendingTo,
        userMessage: options.userMessage,
        addAssistantMessage: options.addAssistantMessage,
        setPendingEmailTo: options.setPendingEmailTo,
      })
    }

    return 'handled'
  }

  if (intent.type === 'show_profile') {
    const profile = await getUserProfile(options.userId)
    const manualForm = wantsManualProfileForm(options.userMessage)

    await options.addAssistantMessage({
      role: 'assistant',
      type: 'profile_edit',
      content: manualForm
        ? 'Rendben, itt tudod kézzel kitölteni az adataidat. Ha kész vagy, kattints a Mentés gombra.'
        : 'Itt vannak a mentett adataid. Szerkesztheted és elmentheted őket.',
      payload: { profile },
      moduleUsed: 'profile',
    })

    return 'handled'
  }

  if (intent.type === 'email_draft') {
    options.setPendingEmailTo?.(intent.to)
    await startEmailDraftFlow({
      userId: options.userId,
      to: intent.to,
      userMessage: options.userMessage,
      addAssistantMessage: options.addAssistantMessage,
      setPendingEmailTo: options.setPendingEmailTo,
    })
    return 'handled'
  }

  return 'fallback'
}

export async function startEmailDraftFlow(options: {
  userId: string
  to: string
  userMessage: string
  addAssistantMessage: (message: AssistantMessageInput) => Promise<void>
  setPendingEmailTo?: (to: string | null) => void
}): Promise<void> {
  const profile = await getUserProfile(options.userId)
  const missingKeys = getMissingProfileFields(profile, DRIVING_SCHOOL_EMAIL_REQUIRED_FIELDS)

  if (missingKeys.length > 0) {
    options.setPendingEmailTo?.(options.to)
    await options.addAssistantMessage({
      role: 'assistant',
      type: 'profile_missing_info',
      content:
        'Az email elkészítéséhez még szükségem van néhány adatra. Kérlek, töltsd ki az alábbi mezőket.',
      payload: {
        missingFieldKeys: missingKeys,
        profile,
        pendingEmailTo: options.to,
        message: missingKeys.map((key) => PROFILE_FIELD_LABELS[key]).join(', '),
      },
      moduleUsed: 'profile',
    })
    return
  }

  await createEmailDraftMessage(options)
}

async function createEmailDraftMessage(options: {
  userId: string
  to: string
  userMessage: string
  addAssistantMessage: (message: AssistantMessageInput) => Promise<void>
  setPendingEmailTo?: (to: string | null) => void
}): Promise<void> {
  const profile = await getUserProfile(options.userId)
  const generated = await generateEmailDraftFromProfile({
    to: options.to,
    profile,
    userMessage: options.userMessage,
  })

  const draftId = await createEmailDraft(options.userId, {
    type: 'outreach',
    to: generated.to,
    subject: generated.subject,
    body: generated.body,
    status: 'draft',
    source: 'chat',
  })

  await options.addAssistantMessage({
    role: 'assistant',
    type: 'email_draft',
    content: 'Előkészítettem az emailt.',
    payload: {
      draftId,
      to: generated.to,
      subject: generated.subject,
      body: generated.body,
    },
    moduleUsed: 'email',
  })

  options.setPendingEmailTo?.(null)
}

export async function showProfileCardMessage(
  userId: string,
  addAssistantMessage: (message: AssistantMessageInput) => Promise<void>,
): Promise<void> {
  const profile = await getUserProfile(userId)

  await addAssistantMessage({
    role: 'assistant',
    type: 'profile_edit',
    content: 'Itt vannak a mentett adataid.',
    payload: { profile },
    moduleUsed: 'profile',
  })
}

export function buildMissingFieldLabels(keys: ProfileFieldKey[]): string[] {
  return keys.map((key) => PROFILE_FIELD_LABELS[key])
}
