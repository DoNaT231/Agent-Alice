/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * Placeholder: gmail.connect.placeholder
 * Később Gmail OAuth (backend-only token tárolás) vagy külső Gmail MCP kapcsolat.
 *
 * Jövőbeli gmail.connect meta:
 *   requiresApproval: true, riskLevel: medium, externalAccess: true
 */

import type { ToolDefinition } from '../types.js'

export const connectGmailPlaceholderTool: ToolDefinition<Record<string, never>> = {
  name: 'gmail.connect.placeholder',
  description: 'Placeholder for future Gmail OAuth or Gmail MCP connection.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  permissions: {
    reads: [],
    writes: ['gmail.oauth'],
    externalAccess: true,
  },
  requiresApproval: true,
  riskLevel: 'medium',
  async handler() {
    return {
      type: 'text',
      content: 'Gmail kapcsolat még nincs bekötve. Később OAuth vagy Gmail MCP kerül ide.',
      payload: {},
      moduleUsed: 'email',
    }
  },
}
