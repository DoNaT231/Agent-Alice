export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function canSendEmail(input: {
  to: string
  subject: string
  body: string
}): boolean {
  return (
    isValidEmail(input.to) &&
    input.subject.trim().length > 0 &&
    input.body.trim().length > 0
  )
}
