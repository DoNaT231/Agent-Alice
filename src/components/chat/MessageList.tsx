import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../../types/chat'
import { ChatMessage as ChatMessageView } from '../../features/chat/components/ChatMessage'
import { LoadingIndicator } from './LoadingIndicator'

interface MessageListProps {
  messages: ChatMessage[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">
      {messages.length === 0 && !isLoading ? (
        <div className="flex min-h-full flex-col items-center justify-center gap-2 px-2 text-center text-gray-500 dark:text-gray-400">
          <h2 className="m-0 text-xl text-gray-900 sm:text-2xl dark:text-gray-100">Hi, I&apos;m Alice</h2>
          <p className="m-0 max-w-sm">
            Your AI personal assistant. Ask me anything to get started.
          </p>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 sm:gap-5">
          {messages.map((message) => (
            <ChatMessageView key={message.id} message={message} />
          ))}
          {isLoading ? <LoadingIndicator /> : null}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
