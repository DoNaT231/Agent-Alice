import { generateChatReply } from '../../gemini.js'
import type { UserProfile } from '../../../shared/types/profile.js'

export interface GeneratedEmailDraftContent {
  subject: string
  body: string
}

export interface GenerateEmailDraftInput {
  to: string
  profile: UserProfile
  userMessage: string
}

function buildProfileContext(profile: UserProfile): string {
  return JSON.stringify(profile, null, 2)
}

function parseDraftJson(raw: string): GeneratedEmailDraftContent {
  const jsonMatch = raw.trim().match(/\{[\s\S]*\}/)
  const parsed = JSON.parse(jsonMatch?.[0] ?? raw) as Partial<GeneratedEmailDraftContent>

  return {
    subject: typeof parsed.subject === 'string' ? parsed.subject.trim() : '',
    body: typeof parsed.body === 'string' ? parsed.body.trim() : '',
  }
}

export async function generateEmailDraft(
  input: GenerateEmailDraftInput,
  apiKey: string,
): Promise<GeneratedEmailDraftContent> {
  const systemPrompt = [
    'You write professional Hungarian outreach/application emails.',
    'Use the user profile data provided.',
    'Return ONLY valid JSON: {"subject":"...","body":"..."}',
    'The body should be ready to send, with greeting and signature using the user name.',
  ].join(' ')

  const userPrompt = [
    `Write an application email to: ${input.to}`,
    'Context from user message:',
    input.userMessage,
    '',
    'User profile JSON:',
    buildProfileContext(input.profile),
  ].join('\n')

  const reply = await generateChatReply(
    [
      { role: 'user', content: systemPrompt },
      { role: 'assistant', content: 'Understood. I will return only JSON with subject and body.' },
      { role: 'user', content: userPrompt },
    ],
    apiKey,
  )

  const draft = parseDraftJson(reply)

  if (!draft.subject || !draft.body) {
    throw new Error('Gemini returned an incomplete email draft.')
  }

  return draft
}
