import { Bot, User } from 'lucide-react'
import type { ChatMessage } from '../../types/chat'
import { MarkdownMessage } from './MarkdownMessage'

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={[
        'flex w-full max-w-3xl gap-3',
        isUser ? 'ml-auto flex-row-reverse' : '',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.625rem]',
          isUser
            ? 'bg-indigo-500/12 text-indigo-500 dark:bg-indigo-400/15 dark:text-indigo-400'
            : 'border border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400',
        ].join(' ')}
      >
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      <div
        className={[
          'rounded-2xl px-4 py-3.5 leading-relaxed',
          isUser
            ? 'rounded-br-md bg-indigo-500 text-white dark:bg-indigo-400'
            : 'rounded-bl-md border border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100',
        ].join(' ')}
      >
        <MarkdownMessage content={message.content} variant={isUser ? 'user' : 'assistant'} />
      </div>
    </div>
  )
}
