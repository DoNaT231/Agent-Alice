/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * Tool futtatás belépési pont – név, input és ToolContext alapján.
 * Ismeretlen tool esetén egyértelmű hibaüzenet.
 */

import type { ToolContext } from './types.js'
import type { ToolMessageResult } from './types.js'
import { getTool } from './registry.js'

export async function runTool(
  toolName: string,
  input: Record<string, unknown>,
  context: ToolContext,
): Promise<ToolMessageResult> {
  const tool = getTool(toolName)

  if (!tool) {
    throw new Error(`Unknown tool: ${toolName}`)
  }

  return tool.handler(input, context)
}

export { getTool, listTools } from './registry.js'
