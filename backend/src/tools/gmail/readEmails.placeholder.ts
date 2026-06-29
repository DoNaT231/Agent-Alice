/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * Placeholder: gmail.read.placeholder
 * Később Gmail API vagy Gmail MCP olvasás (inbox, thread).
 *
 * Jövőbeli gmail.read meta:
 *   requiresApproval: scope-függő (true ajánlott), riskLevel: medium
 * Jövőbeli gmail.modify / gmail.delete:
 *   requiresApproval: true, riskLevel: high
 */

import type { ToolDefinition } from '../types.js'

export const readEmailsPlaceholderTool: ToolDefinition<Record<string, never>> = {
  name: 'gmail.read.placeholder',
  description: 'Placeholder for future Gmail inbox read via API or MCP.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  permissions: {
    reads: ['gmail.inbox'],
    writes: [],
    externalAccess: true,
  },
  requiresApproval: false,
  riskLevel: 'medium',
  async handler() {
    return {
      type: 'text',
      content: 'Gmail olvasás még nincs bekötve. Később Gmail API vagy Gmail MCP kerül ide.',
      payload: {},
      moduleUsed: 'email',
    }
  },
}
