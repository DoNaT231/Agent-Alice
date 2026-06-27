import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import type { ChatMessage, Conversation } from '../../types/chat'
import { ChatApiError, sendChatMessage } from '../../services/chatApi'
import { generateConversationTitle } from '../../services/titleApi'
import { useAuth } from '../../hooks/useAuth'
import {
  addMessage,
  createConversation,
  getConversation,
  subscribeToMessages,
  updateConversationLastMessage,
  updateConversationTitle,
} from '../../lib/chatService'
import { ChatInput } from './ChatInput'
import { ErrorBanner } from './ErrorBanner'
import { MessageList } from './MessageList'
import { MobileMenuButton } from '../layout/MobileMenuButton'

interface ChatLocationState {
  projectId?: string | null
}

export function ChatPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { conversationId, projectId: routeProjectId } = useParams<{
    conversationId?: string
    projectId?: string
  }>()

  const pendingProjectId = (location.state as ChatLocationState | null)?.projectId ?? null
  const activeProjectId = routeProjectId ?? pendingProjectId ?? null

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [syncedConversationId, setSyncedConversationId] = useState<string | undefined>(undefined)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCreatingRef = useRef(false)

  const loadingMessages = Boolean(conversationId && syncedConversationId !== conversationId)
  const displayMessages = conversationId ? messages : []

  useEffect(() => {
    if (!user || !conversationId) return

    void getConversation(user.uid, conversationId).then(setConversation)

    const unsubscribe = subscribeToMessages(user.uid, conversationId, (items) => {
      setMessages(items)
      setSyncedConversationId(conversationId)
    })

    return unsubscribe
  }, [user, conversationId])

  const navigateToConversation = (id: string, projectId: string | null) => {
    if (projectId) {
      navigate(`/projects/${projectId}/chat/${id}`, { replace: true, state: null })
      return
    }

    navigate(`/chat/${id}`, { replace: true, state: null })
  }

  const handleSend = async (content: string) => {
    if (!user || isSending || isCreatingRef.current) return

    const isFirstExchange = displayMessages.length === 0

    setError(null)
    setIsSending(true)

    try {
      let currentConversationId = conversationId

      if (!currentConversationId) {
        isCreatingRef.current = true
        currentConversationId = await createConversation(user.uid, content, activeProjectId)
        navigateToConversation(currentConversationId, activeProjectId)
      }

      await addMessage(user.uid, currentConversationId, {
        role: 'user',
        content,
        moduleUsed: 'chat',
      })

      const historyForApi = [...displayMessages, { role: 'user' as const, content }].map(
        ({ role, content: text }) => ({
          role,
          content: text,
        }),
      )

      const reply = await sendChatMessage(historyForApi)

      await addMessage(user.uid, currentConversationId, {
        role: 'assistant',
        content: reply.content,
        moduleUsed: 'chat',
      })

      await updateConversationLastMessage(user.uid, currentConversationId, reply.content)

      if (isFirstExchange) {
        void generateConversationTitle([
          { role: 'user', content },
          { role: 'assistant', content: reply.content },
        ])
          .then(async (title) => {
            await updateConversationTitle(user.uid, currentConversationId!, title)
            setConversation((current) => (current ? { ...current, title } : current))
          })
          .catch(() => {
            // Keep the fallback title from the first message if AI title generation fails.
          })
      } else if (!conversation) {
        const latest = await getConversation(user.uid, currentConversationId)
        setConversation(latest)
      }
    } catch (err) {
      const message =
        err instanceof ChatApiError
          ? err.message
          : 'Something went wrong. Please try again.'

      setError(message)
    } finally {
      isCreatingRef.current = false
      setIsSending(false)
    }
  }

  const headerTitle = conversation?.title ?? (activeProjectId ? 'New project chat' : 'Chat')
  const headerSubtitle = activeProjectId
    ? 'Conversation inside a project'
    : 'Talk to Alice, your AI personal assistant'

  return (
    <div className="flex h-full min-h-0 flex-col bg-white dark:bg-gray-900">
      <header className="border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-5 dark:border-gray-700">
        <div className="flex items-start gap-2 sm:gap-3">
          <MobileMenuButton />
          <div className="min-w-0 flex-1">
            <h1 className="m-0 truncate text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
              {headerTitle}
            </h1>
            <p className="mt-0.5 truncate text-xs text-gray-500 sm:mt-1 sm:text-sm dark:text-gray-400">
              {headerSubtitle}
            </p>
          </div>
        </div>
      </header>

      {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}

      {loadingMessages ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          Loading messages...
        </div>
      ) : (
        <MessageList messages={displayMessages} isLoading={isSending} />
      )}

      <ChatInput onSend={handleSend} disabled={isSending || loadingMessages} />
    </div>
  )
}
