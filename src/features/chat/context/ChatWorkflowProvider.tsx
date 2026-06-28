import type { ReactNode } from 'react'
import {
  ChatWorkflowContext,
  type ChatWorkflowContextValue,
} from './chatWorkflowContext'

export function ChatWorkflowProvider({
  children,
  value,
}: {
  children: ReactNode
  value: ChatWorkflowContextValue
}) {
  return <ChatWorkflowContext.Provider value={value}>{children}</ChatWorkflowContext.Provider>
}
