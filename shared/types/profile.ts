export interface UserProfile {
  fullName: string
  email: string
  phone: string
  linkedin: string
  github: string
  portfolio: string
  location: string
  education: string
  experienceSummary: string
  skills: string[]
  shortIntro: string
  preferredTone: string
  licenseCategory: string
  availability: string
  updatedAt?: number
}

export type ProfileFieldKey = keyof Omit<UserProfile, 'updatedAt'>

export const EMPTY_USER_PROFILE: UserProfile = {
  fullName: '',
  email: '',
  phone: '',
  linkedin: '',
  github: '',
  portfolio: '',
  location: '',
  education: '',
  experienceSummary: '',
  skills: [],
  shortIntro: '',
  preferredTone: 'természetes, udvarias, magabiztos',
  licenseCategory: '',
  availability: '',
}

export const PROFILE_FIELD_LABELS: Record<ProfileFieldKey, string> = {
  fullName: 'Teljes név',
  email: 'Email',
  phone: 'Telefonszám',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  portfolio: 'Portfólió',
  location: 'Lokáció',
  education: 'Végzettség',
  experienceSummary: 'Tapasztalat összefoglaló',
  skills: 'Készségek',
  shortIntro: 'Rövid bemutatkozás',
  preferredTone: 'Preferált hangnem',
  licenseCategory: 'Jogosítvány kategória',
  availability: 'Elérhetőség',
}

export const DRIVING_SCHOOL_EMAIL_REQUIRED_FIELDS: ProfileFieldKey[] = [
  'fullName',
  'phone',
  'licenseCategory',
  'availability',
]
