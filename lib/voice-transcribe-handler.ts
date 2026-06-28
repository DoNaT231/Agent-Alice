import { transcribeAudioWithGemini } from './gemini.js'
import { parseMultipartBody } from './parse-multipart.js'
import type {
  VoiceTranscribeErrorBody,
  VoiceTranscribeResponseBody,
} from '../shared/types/voice.js'

export type VoiceTranscribeHandlerResult =
  | { status: 200; body: VoiceTranscribeResponseBody }
  | { status: 400 | 405 | 500; body: VoiceTranscribeErrorBody }

export async function handleVoiceTranscribeRequest(
  method: string,
  body: Buffer,
  contentType: string,
  apiKey: string | undefined,
): Promise<VoiceTranscribeHandlerResult> {
  if (method !== 'POST') {
    return {
      status: 405,
      body: { error: 'Method not allowed.' },
    }
  }

  if (!apiKey?.trim()) {
    return {
      status: 500,
      body: { error: 'Gemini API key is not configured on the server.' },
    }
  }

  if (!body.length) {
    return {
      status: 400,
      body: { error: 'Audio file is required.' },
    }
  }

  let parsed

  try {
    parsed = await parseMultipartBody(body, contentType)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid audio upload.'
    return {
      status: 400,
      body: { error: message },
    }
  }

  const uploadedFile = parsed.file

  if (!uploadedFile?.buffer.length) {
    return {
      status: 400,
      body: { error: 'Audio file is required.' },
    }
  }

  try {
    const transcript = await transcribeAudioWithGemini(
      uploadedFile.buffer,
      uploadedFile.mimeType,
      apiKey,
    )

    return {
      status: 200,
      body: { transcript },
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not transcribe audio. Please try again.'

    return {
      status: 500,
      body: { error: message },
    }
  }
}
