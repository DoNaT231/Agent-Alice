import Busboy from 'busboy'
import { Readable } from 'node:stream'

export interface ParsedMultipartFile {
  fieldname: string
  filename: string
  mimeType: string
  buffer: Buffer
}

export interface ParsedMultipartResult {
  fields: Record<string, string>
  file: ParsedMultipartFile | null
}

const MAX_AUDIO_BYTES = 20 * 1024 * 1024

export function parseMultipartBody(
  body: Buffer,
  contentType: string,
): Promise<ParsedMultipartResult> {
  return new Promise((resolve, reject) => {
    if (!contentType.includes('multipart/form-data')) {
      reject(new Error('Expected multipart/form-data request.'))
      return
    }

    const fields: Record<string, string> = {}
    let file: ParsedMultipartFile | null = null
    let totalBytes = 0

    const busboy = Busboy({
      headers: { 'content-type': contentType },
      limits: { fileSize: MAX_AUDIO_BYTES, files: 1 },
    })

    busboy.on('file', (fieldname, fileStream, info) => {
      const chunks: Buffer[] = []

      fileStream.on('data', (chunk: Buffer) => {
        totalBytes += chunk.length
        if (totalBytes > MAX_AUDIO_BYTES) {
          reject(new Error('Audio file is too large.'))
          fileStream.resume()
          return
        }

        chunks.push(chunk)
      })

      fileStream.on('end', () => {
        file = {
          fieldname,
          filename: info.filename,
          mimeType: info.mimeType,
          buffer: Buffer.concat(chunks),
        }
      })
    })

    busboy.on('field', (name, value) => {
      fields[name] = value
    })

    busboy.on('finish', () => resolve({ fields, file }))
    busboy.on('error', reject)

    Readable.from(body).pipe(busboy)
  })
}
