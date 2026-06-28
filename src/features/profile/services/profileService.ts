import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../../../firebase/firestore'
import {
  EMPTY_USER_PROFILE,
  type ProfileFieldKey,
  type UserProfile,
} from '../../../../shared/types/profile'

const PROFILE_DOC_PATH = 'main'

function normalizeSkills(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function mapProfileData(data: Record<string, unknown>): UserProfile {
  return {
    ...EMPTY_USER_PROFILE,
    fullName: String(data.fullName ?? ''),
    email: String(data.email ?? ''),
    phone: String(data.phone ?? ''),
    linkedin: String(data.linkedin ?? ''),
    github: String(data.github ?? ''),
    portfolio: String(data.portfolio ?? ''),
    location: String(data.location ?? ''),
    education: String(data.education ?? ''),
    experienceSummary: String(data.experienceSummary ?? ''),
    skills: normalizeSkills(data.skills),
    shortIntro: String(data.shortIntro ?? ''),
    preferredTone: String(data.preferredTone ?? EMPTY_USER_PROFILE.preferredTone),
    licenseCategory: String(data.licenseCategory ?? ''),
    availability: String(data.availability ?? ''),
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const snapshot = await getDoc(doc(db, 'users', userId, 'profile', PROFILE_DOC_PATH))

  if (!snapshot.exists()) {
    return { ...EMPTY_USER_PROFILE }
  }

  return mapProfileData(snapshot.data())
}

export async function saveUserProfile(
  userId: string,
  profile: UserProfile,
): Promise<void> {
  await setDoc(doc(db, 'users', userId, 'profile', PROFILE_DOC_PATH), {
    ...profile,
    skills: normalizeSkills(profile.skills),
    updatedAt: serverTimestamp(),
  })
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile> {
  const current = await getUserProfile(userId)
  const merged: UserProfile = {
    ...current,
    ...updates,
    skills: updates.skills ? normalizeSkills(updates.skills) : current.skills,
  }

  await setDoc(
    doc(db, 'users', userId, 'profile', PROFILE_DOC_PATH),
    {
      ...merged,
      skills: merged.skills,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  return merged
}

export function getUpdatedFieldKeys(updates: Partial<UserProfile>): ProfileFieldKey[] {
  return Object.keys(updates).filter((key) => key !== 'updatedAt') as ProfileFieldKey[]
}
