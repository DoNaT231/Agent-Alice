export const EMAIL_CLASSIFIER_SYSTEM_PROMPT =
  'Classify emails and return JSON with category, priority, and summary fields only.'

export function buildEmailClassifierUserPrompt(email: {
  from: string
  subject: string
  body: string
}): string {
  return `From: ${email.from}\nSubject: ${email.subject}\n\n${email.body}`
}
