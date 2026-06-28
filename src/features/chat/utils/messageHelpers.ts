import type { ChatMessage } from '../../../types/chat'
import { isActionMessageType } from '../utils/messageTypes'

export function isActionMessage(message: ChatMessage): boolean {
  if (message.role !== 'assistant') return false
  if (message.type === 'profile_updated') return true
  return isActionMessageType(message.type ?? 'text')
}

export function isTextMessage(message: ChatMessage): boolean {
  return !isActionMessage(message)
}

export function getDefaultMessageType(role: ChatMessage['role']): ChatMessage['type'] {
  return role === 'user' ? 'text' : 'text'
}
