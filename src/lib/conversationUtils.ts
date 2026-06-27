export function generateConversationTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim()
  if (trimmed.length <= 40) return trimmed
  return `${trimmed.slice(0, 40)}...`
}

export function getConversationPath(conversation: {
  id: string
  projectId: string | null
}): string {
  if (conversation.projectId) {
    return `/projects/${conversation.projectId}/chat/${conversation.id}`
  }

  return `/chat/${conversation.id}`
}
