export const EMAIL_REPLY_SYSTEM_PROMPT =
  'Draft professional email replies and return JSON with to, companyName, subject, and body fields only.'

export function buildEmailReplyUserPrompt(originalEmail: string): string {
  return `Reply to this email:\n\n${originalEmail}`
}
