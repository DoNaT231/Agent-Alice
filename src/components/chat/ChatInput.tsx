import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return

    onSend(trimmed)
    setValue('')

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value)

    const textarea = event.target
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
  }

  return (
    <div className="border-t border-gray-200 bg-white px-6 pb-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-end gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <textarea
          ref={textareaRef}
          className="max-h-40 min-h-[1.5rem] flex-1 resize-none border-none bg-transparent py-1 leading-normal text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-100 dark:placeholder:text-gray-500"
          placeholder="Message Alice..."
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.625rem] bg-indigo-500 text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-indigo-400"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
        Press Enter to send, Shift + Enter for a new line
      </p>
    </div>
  )
}
