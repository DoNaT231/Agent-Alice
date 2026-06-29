/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * Placeholder: gmail.send.placeholder
 * Valódi küldéshez később gmail.send tool – Gmail API vagy Gmail MCP.
 * SOHA ne küldjön automatikusan; mindig explicit felhasználói jóváhagyás kell.
 *
 * Jövőbeli gmail.send meta:
 *   requiresApproval: true, riskLevel: high, writes: ['gmail.send']
 */

import type { ToolDefinition } from '../types.js'

export const sendEmailPlaceholderTool: ToolDefinition<Record<string, never>> = {
  name: 'gmail.send.placeholder',
  description: 'Placeholder for future real Gmail send via API or MCP.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  permissions: {
    reads: ['email.draft'],
    writes: ['gmail.send'],
    externalAccess: true,
  },
  requiresApproval: true,
  riskLevel: 'high',
  async handler() {
    return {
      type: 'text',
      content:
        'Valódi Gmail küldés még nincs bekötve. Jelenleg csak email.mockSend használható tesztelésre.',
      payload: {},
      moduleUsed: 'email',
    }
  },
}
