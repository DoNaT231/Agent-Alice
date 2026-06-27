import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Briefcase,
  Calendar,
  CheckSquare,
  FolderKanban,
  Inbox,
  Loader2,
  LogOut,
  MessageSquarePlus,
  Send,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { CreateProjectModal } from '../projects/CreateProjectModal'
import { useAuth } from '../../hooks/useAuth'
import type { Conversation, Project } from '../../types/chat'
import { getConversationPath } from '../../lib/conversationUtils'
import { deleteConversation, subscribeToConversations } from '../../lib/chatService'
import { subscribeToProjects } from '../../lib/projectService'

export function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { conversationId, projectId: routeProjectId } = useParams<{
    conversationId?: string
    projectId?: string
  }>()

  const [projects, setProjects] = useState<Project[] | null>(null)
  const [conversations, setConversations] = useState<Conversation[] | null>(null)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadingProjects = projects === null
  const loadingConversations = conversations === null

  const activeConversationId = conversationId ?? null
  const activeProjectId = routeProjectId ?? null

  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToProjects(user.uid, (items) => {
      setProjects(items.filter((item) => !item.archived))
    })

    return unsubscribe
  }, [user])

  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToConversations(user.uid, (items) => {
      setConversations(items.filter((item) => !item.archived))
    })

    return unsubscribe
  }, [user])

  const recentConversations = useMemo(
    () => (conversations ?? []).filter((conversation) => !conversation.projectId).slice(0, 20),
    [conversations],
  )

  const handleDeleteConversation = async (event: MouseEvent, conversation: Conversation) => {
    event.preventDefault()
    event.stopPropagation()

    if (!user) return

    const confirmed = window.confirm(`Delete "${conversation.title}"?`)
    if (!confirmed) return

    setDeletingId(conversation.id)

    try {
      await deleteConversation(user.uid, conversation.id)

      if (activeConversationId === conversation.id) {
        navigate(conversation.projectId ? `/projects/${conversation.projectId}` : '/chat')
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (!user) return null

  return (
    <>
      <aside className="flex h-full w-72 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-white/8 dark:bg-slate-900">
        <div className="border-b border-gray-200 px-3.5 py-4 dark:border-white/8">
          <div className="mb-4 flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <Sparkles size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-[0.95rem] font-semibold text-gray-900 dark:text-slate-50">
                Agent Alice
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-slate-400">
                {user.displayName ?? user.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => navigate('/chat')}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white hover:opacity-90 dark:bg-indigo-400"
            >
              <MessageSquarePlus size={14} />
              New Chat
            </button>
            <button
              type="button"
              onClick={() => setShowCreateProject(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/6"
            >
              <FolderKanban size={14} />
              New Project
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3.5 py-4">
          <section className="mb-5">
            <h2 className="mb-2 px-1 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-slate-500">
              Projects
            </h2>
            {loadingProjects ? (
              <div className="flex items-center gap-2 px-1 text-xs text-gray-500 dark:text-slate-400">
                <Loader2 size={14} className="animate-spin" />
                Loading projects...
              </div>
            ) : (projects ?? []).length === 0 ? (
              <p className="m-0 px-1 text-xs text-gray-500 dark:text-slate-400">No projects yet.</p>
            ) : (
              <ul className="m-0 list-none space-y-1 p-0">
                {(projects ?? []).map((project) => {
                  const isActive = activeProjectId === project.id && !activeConversationId

                  return (
                    <li key={project.id}>
                      <Link
                        to={`/projects/${project.id}`}
                        className={[
                          'block rounded-lg px-3 py-2 text-sm transition',
                          isActive
                            ? 'bg-indigo-500/10 font-medium text-indigo-600 dark:bg-indigo-500/20 dark:text-slate-50'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/6',
                        ].join(' ')}
                      >
                        <span className="block truncate">{project.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-2 px-1 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-slate-500">
              Recent chats
            </h2>
            {loadingConversations ? (
              <div className="flex items-center gap-2 px-1 text-xs text-gray-500 dark:text-slate-400">
                <Loader2 size={14} className="animate-spin" />
                Loading conversations...
              </div>
            ) : recentConversations.length === 0 ? (
              <p className="m-0 px-1 text-xs text-gray-500 dark:text-slate-400">No conversations yet.</p>
            ) : (
              <ul className="m-0 list-none space-y-1 p-0">
                {recentConversations.map((conversation) => {
                  const isActive = activeConversationId === conversation.id

                  return (
                    <li key={conversation.id}>
                      <Link
                        to={getConversationPath(conversation)}
                        className={[
                          'group flex items-start gap-2 rounded-lg px-3 py-2 text-sm transition',
                          isActive
                            ? 'bg-indigo-500/10 font-medium text-indigo-600 dark:bg-indigo-500/20 dark:text-slate-50'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/6',
                        ].join(' ')}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="m-0 truncate">{conversation.title}</p>
                          {conversation.lastMessage ? (
                            <p className="m-0 mt-0.5 truncate text-xs font-normal text-gray-500 dark:text-slate-400">
                              {conversation.lastMessage}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={(event) => void handleDeleteConversation(event, conversation)}
                          disabled={deletingId === conversation.id}
                          className="mt-0.5 rounded p-1 text-gray-400 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                          aria-label={`Delete ${conversation.title}`}
                        >
                          {deletingId === conversation.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="mt-6 border-t border-gray-200 pt-4 dark:border-white/8">
            <h2 className="mb-2 px-1 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-slate-500">
              Modules
            </h2>
            <ul className="m-0 list-none space-y-1 p-0">
              {[
                { label: 'Inbox', icon: Inbox },
                { label: 'Calendar', icon: Calendar },
                { label: 'Outreach', icon: Send },
                { label: 'Jobs', icon: Briefcase },
                { label: 'Tasks', icon: CheckSquare },
                { label: 'Settings', icon: Settings },
              ].map(({ label, icon: Icon }) => (
                <li key={label}>
                  <button
                    type="button"
                    disabled
                    className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-400 opacity-55 dark:text-slate-500"
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                    <span className="ml-auto text-[0.65rem] uppercase">Soon</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="border-t border-gray-200 px-3.5 py-4 dark:border-white/8">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/6"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {showCreateProject ? (
        <CreateProjectModal
          userId={user.uid}
          onClose={() => setShowCreateProject(false)}
          onCreated={(id) => navigate(`/projects/${id}`)}
        />
      ) : null}
    </>
  )
}
