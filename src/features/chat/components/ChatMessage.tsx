import { Bot, User } from 'lucide-react'
import type { ChatMessage } from '../../../types/chat'
import { MarkdownMessage } from '../../../components/chat/MarkdownMessage'
import { ActionRenderer } from './ActionRenderer'
import { isActionMessage } from '../utils/messageHelpers'

interface ChatMessageProps {
  message: ChatMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={[
        'flex w-full min-w-0 max-w-full gap-2 sm:max-w-3xl sm:gap-3',
        isUser ? 'ml-auto flex-row-reverse' : '',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.625rem] sm:h-8 sm:w-8',
          isUser
            ? 'bg-indigo-500/12 text-indigo-500 dark:bg-indigo-400/15 dark:text-indigo-400'
            : 'border border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400',
        ].join(' ')}
      >
        {isUser ? <User size={17} /> : <Bot size={17} />}
      </div>
      <div
        className={[
          'min-w-0 flex-1 rounded-2xl px-3 py-2.5 leading-relaxed sm:px-4 sm:py-3.5',
          isUser
            ? 'rounded-br-md bg-indigo-500 text-white dark:bg-indigo-400'
            : 'rounded-bl-md border border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100',
        ].join(' ')}
      >
        {isUser || !isActionMessage(message) ? (
          <MarkdownMessage content={message.content} variant={isUser ? 'user' : 'assistant'} />
        ) : (
          <ActionRenderer message={message} />
        )}
      </div>
    </div>
  )
}
