import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Loader2, MessageSquarePlus } from 'lucide-react'
import type { Conversation, Project, ProjectTone } from '../../types/chat'
import { getConversationPath } from '../../lib/conversationUtils'
import { subscribeToConversationsByProject } from '../../lib/chatService'
import { getProject, updateProject } from '../../lib/projectService'
import { useAuth } from '../../hooks/useAuth'

const TONE_OPTIONS: Array<{ value: ProjectTone; label: string }> = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'short', label: 'Short' },
  { value: 'formal', label: 'Formal' },
]

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [conversations, setConversations] = useState<Conversation[] | null>(null)
  const [projectLoaded, setProjectLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const loadingProject = !projectLoaded
  const loadingConversations = conversations === null

  useEffect(() => {
    if (!user || !projectId) return

    let active = true

    void getProject(user.uid, projectId).then((result) => {
      if (!active) return
      setProject(result)
      setProjectLoaded(true)
    })

    return () => {
      active = false
    }
  }, [user, projectId])

  useEffect(() => {
    if (!user || !projectId) return

    const unsubscribe = subscribeToConversationsByProject(user.uid, projectId, (items) => {
      setConversations(items.filter((item) => !item.archived))
    })

    return unsubscribe
  }, [user, projectId])

  const handleFieldSave = async (
    field: 'name' | 'description' | 'instructions' | 'defaultTone',
    value: string | ProjectTone | null,
  ) => {
    if (!user || !projectId || !project) return

    setIsSaving(true)

    try {
      await updateProject(user.uid, projectId, { [field]: value })
      setProject((current) => (current ? { ...current, [field]: value } : current))
    } finally {
      setIsSaving(false)
    }
  }

  if (!projectId) {
    return null
  }

  if (loadingProject) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        <Loader2 size={18} className="mr-2 animate-spin" />
        Loading project...
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400">
        Project not found.
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-white dark:bg-gray-900">
      <header className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <input
              value={project.name}
              onChange={(event) => setProject({ ...project, name: event.target.value })}
              onBlur={() => void handleFieldSave('name', project.name.trim() || 'Untitled project')}
              className="w-full border-none bg-transparent text-lg font-semibold text-gray-900 outline-none dark:text-gray-100"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Project workspace {isSaving ? '· Saving...' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/chat', { state: { projectId } })}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-indigo-400"
          >
            <MessageSquarePlus size={16} />
            New chat in this project
          </button>
        </div>
      </header>

      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </span>
            <textarea
              value={project.description}
              onChange={(event) => setProject({ ...project, description: event.target.value })}
              onBlur={() => void handleFieldSave('description', project.description)}
              className="min-h-24 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Describe this project"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Instructions
            </span>
            <textarea
              value={project.instructions}
              onChange={(event) => setProject({ ...project, instructions: event.target.value })}
              onBlur={() => void handleFieldSave('instructions', project.instructions)}
              className="min-h-32 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Stored for later use (not sent to AI yet)"
            />
          </label>

          <label className="block max-w-xs">
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Default tone
            </span>
            <select
              value={project.defaultTone ?? ''}
              onChange={(event) => {
                const value = (event.target.value || null) as ProjectTone | null
                setProject({ ...project, defaultTone: value })
                void handleFieldSave('defaultTone', value)
              }}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">None</option>
              {TONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="m-0 mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Project conversations
          </h2>

          {loadingConversations ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              Loading conversations...
            </div>
          ) : (conversations ?? []).length === 0 ? (
            <p className="m-0 text-sm text-gray-500 dark:text-gray-400">
              No conversations in this project yet.
            </p>
          ) : (
            <ul className="m-0 list-none space-y-1 p-0">
              {(conversations ?? []).map((conversation) => (
                <li key={conversation.id}>
                  <Link
                    to={getConversationPath(conversation)}
                    className="block rounded-lg px-3 py-2 text-sm transition hover:bg-white dark:hover:bg-gray-900"
                  >
                    <p className="m-0 truncate font-medium text-gray-900 dark:text-gray-100">
                      {conversation.title}
                    </p>
                    {conversation.lastMessage ? (
                      <p className="m-0 mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                        {conversation.lastMessage}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
