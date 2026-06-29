/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * HTTP API a tool-ok szerver oldali futtatásához (POST /api/tools/run).
 * Jelenleg a kliens futtatja a tool-okat; szerver ctx később Admin SDK / MCP adapterrel.
 */

import { runTool } from '../../../backend/src/tools/runTool.js'
import type { RunToolRequestBody, RunToolResponseBody, ToolMessageResult } from '../../../shared/tools/types.js'
import type { ToolContext } from '../../../shared/tools/context.js'

type ToolsRouteResult =
  | { status: 200; body: RunToolResponseBody }
  | { status: 400 | 405 | 500; body: { error: string } }

function parseRunBody(body: unknown): RunToolRequestBody | null {
  if (!body || typeof body !== 'object') return null

  const candidate = body as Record<string, unknown>
  if (typeof candidate.toolName !== 'string' || !candidate.toolName.trim()) return null
  if (!candidate.input || typeof candidate.input !== 'object') return null

  return {
    toolName: candidate.toolName.trim(),
    input: candidate.input as Record<string, unknown>,
  }
}

export async function handleToolsRoute(
  path: string,
  method: string,
  body: unknown,
  ctx: ToolContext | null,
): Promise<ToolsRouteResult> {
  if (method !== 'POST') {
    return { status: 405, body: { error: 'Method not allowed.' } }
  }

  if (path !== '/api/tools/run') {
    return { status: 400, body: { error: 'Tools route not found.' } }
  }

  const parsed = parseRunBody(body)
  if (!parsed) {
    return { status: 400, body: { error: 'Invalid request body.' } }
  }

  if (!ctx) {
    return {
      status: 500,
      body: { error: 'Server tool runtime is not configured. Use client tool runner for now.' },
    }
  }

  try {
    const result: ToolMessageResult = await runTool(parsed.toolName, parsed.input, ctx)
    return { status: 200, body: { result } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tool execution failed.'
    return { status: 500, body: { error: message } }
  }
}
