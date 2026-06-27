export type MessageRole = 'user' | 'assistant'

export type ProjectTone = 'friendly' | 'professional' | 'short' | 'formal'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  model?: string
  moduleUsed?: 'chat' | null
  createdAt: number
}

export interface Conversation {
  id: string
  projectId: string | null
  title: string
  summary: string
  lastMessage: string
  archived: boolean
  createdAt: number
  updatedAt: number
}

export interface Project {
  id: string
  name: string
  description: string
  instructions: string
  summary: string
  defaultTone: ProjectTone | null
  archived: boolean
  createdAt: number
  updatedAt: number
}

export interface ChatApiMessage {
  role: MessageRole
  content: string
}

export interface ChatRequestBody {
  messages: ChatApiMessage[]
}

export interface ChatResponseBody {
  message: ChatApiMessage
}

export interface ChatErrorBody {
  error: string
}

export interface TitleRequestBody {
  messages: ChatApiMessage[]
}

export interface TitleResponseBody {
  title: string
}
