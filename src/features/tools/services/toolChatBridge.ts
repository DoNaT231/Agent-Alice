/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * Híd a tool rendszer és a chat UI között.
 * Lefuttat egy tool-t, majd a ToolMessageResult-ból ChatMessage (assistant) objektumot készít,
 * amit az ActionRenderer meg tud jeleníteni (kártyák, státuszok).
 */

import { runTool } from '../services/toolRunner'
import type { ToolMessageResult } from '../../../../shared/tools/types'
import type { ChatMessage, MessageType } from '../../../types/chat'

type AssistantMessageInput = Omit<ChatMessage, 'id' | 'createdAt'>

export async function executeToolAndBuildMessage(
  toolName: string,
  input: Record<string, unknown>,
  postProcess?: (result: ToolMessageResult) => ToolMessageResult,
): Promise<AssistantMessageInput> {
  let result = await runTool(toolName, input)

  if (postProcess) {
    result = postProcess(result)
  }

  return {
    role: 'assistant',
    type: result.type as MessageType,
    content: result.content,
    payload: result.payload,
    moduleUsed: result.moduleUsed ?? null,
  }
}
