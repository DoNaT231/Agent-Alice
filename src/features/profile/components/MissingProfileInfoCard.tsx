import { useMemo, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { useAuth } from '../../../shared/hooks/useAuth'
import { useOptionalChatWorkflow } from '../../chat/context/useChatWorkflow'
import type { ProfileMissingInfoPayload } from '../../../../shared/types/messages'
import { PROFILE_FIELD_LABELS, type ProfileFieldKey } from '../../../../shared/types/profile'
import { updateUserProfile } from '../services/profileService'

export function MissingProfileInfoCard({
  missingFieldKeys,
  profile: initialProfile,
  pendingEmailTo,
  message,
}: ProfileMissingInfoPayload) {
  const { user } = useAuth()
  const workflow = useOptionalChatWorkflow()
  const [profile, setProfile] = useState(initialProfile)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const missingLabels = useMemo(
    () => missingFieldKeys.map((key) => PROFILE_FIELD_LABELS[key]),
    [missingFieldKeys],
  )

  const updateField = (key: ProfileFieldKey, value: string) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    setError(null)

    try {
      const updates = Object.fromEntries(
        missingFieldKeys.map((key) => [key, profile[key]]),
      ) as Partial<typeof profile>

      await updateUserProfile(user.uid, updates)

      if (pendingEmailTo && workflow) {
        await workflow.continueEmailDraft(pendingEmailTo, 'Folytasd az email draft készítését.')
      } else {
        await workflow?.notifyProfileSaved('Köszönöm, elmentettem a hiányzó adatokat.')
      }
    } catch {
      setError('Nem sikerült elmenteni az adatokat.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full rounded-xl border border-orange-200 bg-orange-50/60 p-4 dark:border-orange-500/30 dark:bg-orange-950/20">
      <h3 className="m-0 mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Hiányzó adatok
      </h3>

      {message ? <p className="m-0 mb-3 text-sm text-gray-700 dark:text-gray-200">{message}</p> : null}

      <ul className="m-0 mb-4 list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-200">
        {missingLabels.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>

      <div className="space-y-3">
        {missingFieldKeys.map((key) => (
          <label key={key} className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
              {PROFILE_FIELD_LABELS[key]}
            </span>
            <input
              type={key === 'email' ? 'email' : 'text'}
              value={String(profile[key] ?? '')}
              onChange={(event) => updateField(key, event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </label>
        ))}
      </div>

      {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Mentés és folytatás
        </button>

        <button
          type="button"
          onClick={() => void workflow?.showProfileCard()}
          disabled={isSaving}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-white disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
        >
          Kézzel kitöltöm az összes adatot
        </button>
      </div>
    </div>
  )
}
