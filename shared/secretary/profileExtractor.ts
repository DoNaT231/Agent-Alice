import type { ProfileFieldKey, UserProfile } from '../types/profile.js'

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/

export function extractEmailAddress(text: string): string | null {
  return text.match(EMAIL_REGEX)?.[0] ?? null
}

export function extractProfileUpdates(text: string): Partial<UserProfile> {
  const updates: Partial<UserProfile> = {}

  const phoneMatch =
    text.match(/telefonszámom\s*[:\s]*([0-9+\s-]{8,})/i) ||
    text.match(/\b(06[0-9\s-]{8,})\b/) ||
    text.match(/\b(\+36[0-9\s-]{8,})\b/)

  if (phoneMatch) {
    updates.phone = phoneMatch[1].replace(/[\s-]/g, '')
  }

  const nameMatch = text.match(/(?:a\s+)?nevem\s+([^,.]+)/i)
  if (nameMatch) {
    updates.fullName = nameMatch[1].trim()
  }

  const licenseMatch = text.match(/\b([ABCDE])\s*kategór[aá]ra?\b/i)
  if (licenseMatch) {
    updates.licenseCategory = `${licenseMatch[1].toUpperCase()} kategória`
  }

  const availabilityMatch = text.match(
    /elérhetőségem\s+([^,.]+)|elérhető vagyok\s+([^,.]+)|(?:hétfő|kedd|szerda|csütörtök|péntek)[^,.]*/i,
  )
  if (availabilityMatch) {
    const value = (availabilityMatch[1] ?? availabilityMatch[2] ?? availabilityMatch[0])?.trim()
    if (value) updates.availability = value
  }

  const emailInText = extractEmailAddress(text)
  if (emailInText && /email(?:em|címem)?\s*[:\s]/i.test(text)) {
    updates.email = emailInText
  }

  const introMatch = text.match(/bemutatkoz(?:ás|om)\s*[:\s]*([^]+)$/i)
  if (introMatch) {
    updates.shortIntro = introMatch[1].trim().slice(0, 500)
  }

  return updates
}

export function getMissingProfileFields(
  profile: UserProfile,
  requiredKeys: ProfileFieldKey[],
): ProfileFieldKey[] {
  return requiredKeys.filter((key) => {
    const value = profile[key]
    if (Array.isArray(value)) return value.length === 0
    return !String(value ?? '').trim()
  })
}

export function formatProfileSaveConfirmation(updates: Partial<UserProfile>): string {
  const parts = Object.entries(updates)
    .filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0
      return String(value ?? '').trim()
    })
    .map(([key, value]) => {
      const label = key === 'phone' ? 'telefonszámodat' : key === 'fullName' ? 'nevedet' : key
      return `${label}: ${Array.isArray(value) ? value.join(', ') : value}`
    })

  if (parts.length === 0) {
    return 'Elmentettem az adataidat.'
  }

  if (parts.length === 1 && updates.phone) {
    return `Elmentettem a telefonszámodat: ${updates.phone}.`
  }

  return `Elmentettem az adataidat: ${parts.join('; ')}.`
}
