import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { Loader2, Mic, Send } from 'lucide-react'
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = 'auto'
  textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('')
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleVoiceTranscript = (transcript: string) => {
    const trimmed = transcript.trim()
    if (!trimmed || disabled) return

    setVoiceError(null)
    setValue('')

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    onSend(trimmed)
  }

  const { isRecording, isTranscribing, toggleRecording } = useVoiceRecorder({
    disabled,
    onTranscript: handleVoiceTranscript,
    onError: setVoiceError,
  })

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled || isRecording || isTranscribing) return

    onSend(trimmed)
    setValue('')
    setVoiceError(null)

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
    resizeTextarea(event.target)
  }

  const inputDisabled = disabled || isRecording || isTranscribing
  const voiceDisabled = disabled || isTranscribing

  return (
    <div className="border-t border-gray-200 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-5 sm:pt-0 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-2.5 shadow-sm sm:gap-3 sm:p-3 dark:border-gray-700 dark:bg-gray-800">
        <button
          type="button"
          className={[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.625rem] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-45',
            isRecording
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700',
          ].join(' ')}
          onClick={() => {
            setVoiceError(null)
            toggleRecording()
          }}
          disabled={voiceDisabled}
          aria-label={isRecording ? 'Stop recording' : 'Record voice message'}
          aria-pressed={isRecording}
        >
          {isTranscribing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Mic size={18} />
          )}
        </button>

        <textarea
          ref={textareaRef}
          className="max-h-40 min-h-[1.5rem] flex-1 resize-none border-none bg-transparent py-1 leading-normal text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-100 dark:placeholder:text-gray-500"
          placeholder={isRecording ? 'Listening...' : 'Message Alice...'}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={inputDisabled}
          rows={1}
        />

        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.625rem] bg-indigo-500 text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-indigo-400"
          onClick={handleSend}
          disabled={inputDisabled || !value.trim()}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>

      {voiceError ? (
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-red-600 dark:text-red-400" role="alert">
          {voiceError}
        </p>
      ) : (
        <p className="mx-auto mt-2 hidden max-w-3xl text-center text-xs text-gray-400 sm:block dark:text-gray-500">
          Press Enter to send, Shift + Enter for a new line. Tap the mic to speak and send.
        </p>
      )}
    </div>
  )
}
