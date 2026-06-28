export async function sendEmail(input: {
  draftId: string
  to: string
  subject: string
  body: string
}) {
  if (!input.to.trim()) {
    throw new Error('Recipient email is required.')
  }

  return {
    status: 'sent' as const,
    messageId: `mock_${input.draftId}_${Date.now()}`,
    mock: true,
  }
}

export async function isGmailConnected(): Promise<boolean> {
  return false
}
