/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * Kliens oldali tool futtató – backend runTool() + böngészős ToolContext.
 */

import type { ToolMessageResult } from '../../../../shared/tools/types'
import type { ToolAuthUser } from '../../../../shared/tools/context'
import { runTool as runToolCore } from '../../../../backend/src/tools/runTool'
import { createClientToolContext } from './createClientToolContext'

export interface RunToolClientOptions {
  userId?: string
  authUser?: ToolAuthUser | null
}

export async function runTool(
  toolName: string,
  input: Record<string, unknown>,
  options?: RunToolClientOptions,
): Promise<ToolMessageResult> {
  const userId =
    options?.userId ?? (typeof input.userId === 'string' ? input.userId : '')

  return runToolCore(
    toolName,
    input,
    createClientToolContext({
      userId,
      authUser: options?.authUser ?? null,
    }),
  )
}

export { getTool, listTools } from '../../../../backend/src/tools/runTool'
