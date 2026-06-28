export function formatEmailPreview(body: string, maxLength = 120): string {
  const singleLine = body.replace(/\s+/g, ' ').trim()
  if (singleLine.length <= maxLength) return singleLine
  return `${singleLine.slice(0, maxLength - 3)}...`
}
