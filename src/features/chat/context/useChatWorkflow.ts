import { useContext } from 'react'
import { ChatWorkflowContext } from './chatWorkflowContext'

export function useChatWorkflow() {
  const context = useContext(ChatWorkflowContext)
  if (!context) {
    throw new Error('useChatWorkflow must be used within ChatWorkflowProvider')
  }
  return context
}

export function useOptionalChatWorkflow() {
  return useContext(ChatWorkflowContext)
}
