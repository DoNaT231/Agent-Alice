import { useEffect } from 'react'
import { Loader2, Mic } from 'lucide-react'
import { useVoiceRecorder, type VoiceRecorderStatus } from '../hooks/useVoiceRecorder'

interface VoiceRecorderButtonProps {
  disabled?: boolean
  onTranscript: (transcript: string) => void
  onError?: (message: string) => void
  onStatusChange?: (status: VoiceRecorderStatus) => void
}

export function VoiceRecorderButton({
  disabled = false,
  onTranscript,
  onError,
  onStatusChange,
}: VoiceRecorderButtonProps) {
  const { isRecording, isTranscribing, toggleRecording, status } = useVoiceRecorder({
    disabled,
    onTranscript,
    onError,
  })

  useEffect(() => {
    onStatusChange?.(status)
  }, [onStatusChange, status])

  return (
    <button
      type="button"
      className={[
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.625rem] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-45',
        isRecording
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700',
      ].join(' ')}
      onClick={() => {
        onError?.('')
        toggleRecording()
      }}
      disabled={disabled || isTranscribing}
      aria-label={isRecording ? 'Stop recording' : 'Record voice message'}
      aria-pressed={isRecording}
    >
      {isTranscribing ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Mic size={18} />
      )}
    </button>
  )
}
