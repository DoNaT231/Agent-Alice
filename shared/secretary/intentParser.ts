import type { UserProfile } from '../types/profile.js'
import { extractEmailAddress, extractProfileUpdates } from './profileExtractor.js'

export type SecretaryIntent =
  | { type: 'show_profile' }
  | { type: 'profile_save'; updates: Partial<UserProfile> }
  | { type: 'email_draft'; to: string }
  | { type: 'chat' }

export function wantsManualProfileForm(text: string): boolean {
  const lower = text.toLowerCase().trim()

  return (
    /manuálisan|manualisan/i.test(lower) ||
    /saját kezemmel|sajat kezemmel|kezemmel/i.test(lower) ||
    /(kézzel|kezzel).*(adom|megad|kitölt|kitolt|tölt|tolt)/i.test(lower) ||
    /(adom|megad|kitölt|kitolt|tölt|tolt).*(kézzel|kezzel|manuálisan|manualisan)/i.test(lower) ||
    /formban|űrlapon|urlapon|a form|az űrlap|az urlap/i.test(lower) ||
    /(én|en) (adom meg|töltöm ki|toltom ki|adjam meg|szeretném megadni|szeretnem megadni)/i.test(
      lower,
    ) ||
    /nyisd meg.*(űrlap|urlap|form)/i.test(lower) ||
    /hozd elő.*(űrlap|urlap|form)/i.test(lower) ||
    (/szeretném|szeretnem|akarom|szeretnék|szeretnek/.test(lower) &&
      /(megadni|kitölteni|kitolteni|kézzel|kezzel|manuálisan|manualisan|form|űrlap|urlap)/.test(
        lower,
      ))
  )
}

export function detectSecretaryIntent(text: string): SecretaryIntent {
  const lower = text.toLowerCase().trim()

  if (
    /mutasd az adataimat|hozd elő az adataimat|adataim megtekint|személyes adataim|profilom/i.test(
      lower,
    ) ||
    wantsManualProfileForm(text)
  ) {
    return { type: 'show_profile' }
  }

  const recipient = extractEmailAddress(text)
  const wantsEmail =
    /írj.*(email|levelet)|jelentkező email|emailt írj|emailt erre/i.test(lower) ||
    (lower.includes('írj') && Boolean(recipient))

  if (wantsEmail && recipient) {
    return { type: 'email_draft', to: recipient }
  }

  const updates = extractProfileUpdates(text)
  const wantsSave = /mentsd el|mensed el|mentés|elmented|mentsük el/i.test(lower)

  if (wantsSave && Object.keys(updates).length > 0) {
    return { type: 'profile_save', updates }
  }

  if (!wantsEmail && Object.keys(updates).length >= 2) {
    return { type: 'profile_save', updates }
  }

  if (wantsSave && updates.phone) {
    return { type: 'profile_save', updates }
  }

  return { type: 'chat' }
}
