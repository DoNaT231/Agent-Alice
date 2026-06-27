import { useEffect, useState, type FormEvent } from 'react'
import { FolderPlus, Loader2, X } from 'lucide-react'
import type { ProjectTone } from '../../types/chat'
import { createProject } from '../../lib/projectService'

const TONE_OPTIONS: Array<{ value: ProjectTone; label: string }> = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'short', label: 'Short' },
  { value: 'formal', label: 'Formal' },
]

interface CreateProjectModalProps {
  userId: string
  onClose: () => void
  onCreated: (projectId: string) => void
}

export function CreateProjectModal({ userId, onClose, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [instructions, setInstructions] = useState('')
  const [defaultTone, setDefaultTone] = useState<ProjectTone | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const projectId = await createProject(userId, {
        name: trimmedName,
        description: description.trim(),
        instructions: instructions.trim(),
        defaultTone: defaultTone || null,
      })
      onCreated(projectId)
      onClose()
    } catch {
      setError('Could not create project. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="create-project-title" className="m-0 text-lg font-semibold text-gray-900 dark:text-gray-100">
            New project
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Project name"
              required
              autoFocus
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-20 w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              placeholder="What is this project about?"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Instructions</span>
            <textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              className="min-h-20 w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Stored for later use (not sent to AI yet)"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Default tone</span>
            <select
              value={defaultTone}
              onChange={(event) => setDefaultTone(event.target.value as ProjectTone | '')}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">None</option>
              {TONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {error ? <p className="m-0 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 dark:bg-indigo-400"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <FolderPlus size={16} />}
              Create project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
