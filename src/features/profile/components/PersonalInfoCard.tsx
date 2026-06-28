import { useMemo, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { useAuth } from '../../../shared/hooks/useAuth'
import { useOptionalChatWorkflow } from '../../chat/context/useChatWorkflow'
import type { UserProfile } from '../../../../shared/types/profile'
import {
  PROFILE_FIELD_LABELS,
  type ProfileFieldKey,
} from '../../../../shared/types/profile'
import { saveUserProfile } from '../services/profileService'

const PROFILE_FIELDS: ProfileFieldKey[] = [
  'fullName',
  'email',
  'phone',
  'linkedin',
  'github',
  'portfolio',
  'location',
  'education',
  'experienceSummary',
  'skills',
  'shortIntro',
  'preferredTone',
  'licenseCategory',
  'availability',
]

interface PersonalInfoCardProps {
  profile: UserProfile
}

export function PersonalInfoCard({ profile: initialProfile }: PersonalInfoCardProps) {
  const { user } = useAuth()
  const workflow = useOptionalChatWorkflow()
  const [profile, setProfile] = useState<UserProfile>(initialProfile)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const skillsText = useMemo(() => profile.skills.join(', '), [profile.skills])

  const updateField = (key: ProfileFieldKey, value: string) => {
    setProfile((current) => ({
      ...current,
      [key]:
        key === 'skills'
          ? value
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : value,
    }))
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    setError(null)
    setFeedback(null)

    try {
      await saveUserProfile(user.uid, profile)
      setFeedback('Adataid elmentve.')

      const continuedEmail = (await workflow?.continueEmailDraftIfPending()) ?? false
      if (!continuedEmail) {
        await workflow?.notifyProfileSaved('Adataid sikeresen elmentve a profilodba.')
      }
    } catch {
      setError('Nem sikerült elmenteni az adatokat.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full rounded-xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-500/30 dark:bg-violet-950/20">
      <h3 className="m-0 mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Személyes adatok
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        {PROFILE_FIELDS.map((key) => {
          const isLong = key === 'experienceSummary' || key === 'shortIntro'
          const value = key === 'skills' ? skillsText : String(profile[key] ?? '')

          return (
            <label key={key} className={isLong ? 'sm:col-span-2' : ''}>
              <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                {PROFILE_FIELD_LABELS[key]}
              </span>
              {isLong ? (
                <textarea
                  value={value}
                  onChange={(event) => updateField(key, event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              ) : (
                <input
                  type={key === 'email' ? 'email' : 'text'}
                  value={value}
                  onChange={(event) => updateField(key, event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              )}
            </label>
          )
        })}
      </div>

      {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}
      {feedback ? <p className="mt-3 text-xs text-emerald-600">{feedback}</p> : null}

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={isSaving}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Mentés
      </button>
    </div>
  )
}
