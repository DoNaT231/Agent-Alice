import { useCallback, useEffect, useRef, useState } from 'react'
import { VoiceApiError, transcribeAudio } from '../services/voiceApi'

export type VoiceRecorderStatus = 'idle' | 'recording' | 'transcribing'

function getSupportedMimeType(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']

  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }

  return ''
}

interface UseVoiceRecorderOptions {
  onTranscript: (transcript: string) => void
  onError?: (message: string) => void
  disabled?: boolean
}

export function useVoiceRecorder({
  onTranscript,
  onError,
  disabled = false,
}: UseVoiceRecorderOptions) {
  const [status, setStatus] = useState<VoiceRecorderStatus>('idle')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const stopMediaStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
    mediaStreamRef.current = null
  }, [])

  const reportError = useCallback(
    (message: string) => {
      onError?.(message)
    },
    [onError],
  )

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current

    if (!recorder || recorder.state === 'inactive') {
      return
    }

    const audioBlob = await new Promise<Blob>((resolve, reject) => {
      recorder.addEventListener(
        'stop',
        () => {
          const mimeType = recorder.mimeType || 'audio/webm'
          resolve(new Blob(chunksRef.current, { type: mimeType }))
        },
        { once: true },
      )

      recorder.addEventListener(
        'error',
        () => reject(new Error('Recording failed.')),
        { once: true },
      )

      recorder.stop()
    })

    mediaRecorderRef.current = null
    stopMediaStream()
    chunksRef.current = []

    if (!audioBlob.size) {
      setStatus('idle')
      reportError('No audio was captured. Please try again.')
      return
    }

    setStatus('transcribing')

    try {
      const transcript = await transcribeAudio(audioBlob)
      onTranscript(transcript)
    } catch (error) {
      const message =
        error instanceof VoiceApiError
          ? error.message
          : 'Could not transcribe audio. Please try again.'

      reportError(message)
    } finally {
      setStatus('idle')
    }
  }, [onTranscript, reportError, stopMediaStream])

  const startRecording = useCallback(async () => {
    if (disabled || status !== 'idle') return

    if (!navigator.mediaDevices?.getUserMedia) {
      reportError('Microphone recording is not supported in this browser.')
      return
    }

    const mimeType = getSupportedMimeType()
    if (!mimeType) {
      reportError('This browser does not support audio recording.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      })

      recorder.start()
      mediaRecorderRef.current = recorder
      setStatus('recording')
    } catch {
      stopMediaStream()
      reportError('Microphone access was denied or is unavailable.')
    }
  }, [disabled, reportError, status, stopMediaStream])

  const toggleRecording = useCallback(() => {
    if (status === 'recording') {
      void stopRecording()
      return
    }

    if (status === 'idle') {
      void startRecording()
    }
  }, [startRecording, status, stopRecording])

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }

      stopMediaStream()
    }
  }, [stopMediaStream])

  return {
    status,
    isRecording: status === 'recording',
    isTranscribing: status === 'transcribing',
    toggleRecording,
  }
}
