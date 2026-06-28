import type { VoiceTranscribeErrorBody, VoiceTranscribeResponseBody } from '../types/voice'

export class VoiceApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VoiceApiError'
  }
}

function parseError(data: unknown, fallback: string): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as VoiceTranscribeErrorBody).error === 'string'
  ) {
    return (data as VoiceTranscribeErrorBody).error
  }

  return fallback
}

export async function transcribeAudio(blob: Blob): Promise<string> {
  const formData = new FormData()
  formData.append('audio', blob, 'recording.webm')

  let response: Response

  try {
    response = await fetch('/api/voice/transcribe', {
      method: 'POST',
      body: formData,
    })
  } catch {
    throw new VoiceApiError('Unable to reach the transcription service. Check your connection.')
  }

  const data: unknown = await response.json()

  if (!response.ok) {
    throw new VoiceApiError(parseError(data, 'Could not transcribe audio. Please try again.'))
  }

  const parsed = data as VoiceTranscribeResponseBody

  if (!parsed.transcript?.trim()) {
    throw new VoiceApiError('No speech was detected in the recording.')
  }

  return parsed.transcript.trim()
}
