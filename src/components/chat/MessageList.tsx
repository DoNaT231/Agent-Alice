import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../../types/chat'
import { MessageBubble } from './MessageBubble'
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
    <div className="flex-1 overflow-y-auto p-6">
      {messages.length === 0 && !isLoading ? (
        <div className="flex min-h-full flex-col items-center justify-center gap-2 text-center text-gray-500 dark:text-gray-400">
          <h2 className="m-0 text-2xl text-gray-900 dark:text-gray-100">Hi, I&apos;m Alice</h2>
          <p className="m-0 max-w-sm">
            Your AI personal assistant. Ask me anything to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading ? <LoadingIndicator /> : null}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
