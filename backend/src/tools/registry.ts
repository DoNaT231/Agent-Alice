/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * Központi tool regiszter – minden belső és placeholder tool egy helyen.
 * MCP tools/list kompatibilis metaadat exportálás.
 */

import type { ToolDefinition, ToolListing } from './types.js'
import { getProfileTool } from './profile/getProfile.tool.js'
import { updateProfileTool } from './profile/updateProfile.tool.js'
import { createEmailDraftTool } from './email/createEmailDraft.tool.js'
import { mockSendEmailTool } from './email/mockSendEmail.tool.js'
import { connectGmailPlaceholderTool } from './gmail/connectGmail.placeholder.js'
import { sendEmailPlaceholderTool } from './gmail/sendEmail.placeholder.js'
import { readEmailsPlaceholderTool } from './gmail/readEmails.placeholder.js'

const toolList: ToolDefinition<Record<string, unknown>>[] = [
  getProfileTool as unknown as ToolDefinition<Record<string, unknown>>,
  updateProfileTool as unknown as ToolDefinition<Record<string, unknown>>,
  createEmailDraftTool as unknown as ToolDefinition<Record<string, unknown>>,
  mockSendEmailTool as unknown as ToolDefinition<Record<string, unknown>>,
  connectGmailPlaceholderTool as unknown as ToolDefinition<Record<string, unknown>>,
  sendEmailPlaceholderTool as unknown as ToolDefinition<Record<string, unknown>>,
  readEmailsPlaceholderTool as unknown as ToolDefinition<Record<string, unknown>>,
]

const tools: Record<string, ToolDefinition<Record<string, unknown>>> = Object.fromEntries(
  toolList.map((tool) => [tool.name, tool]),
)

/** Egy tool definíció lekérése név alapján. */
export function getTool(name: string): ToolDefinition<Record<string, unknown>> | undefined {
  return tools[name]
}

/** Összes regisztrált tool MCP-kompatibilis listája. */
export function listTools(): ToolListing[] {
  return toolList.map(
    ({ name, description, inputSchema, outputSchema, permissions, requiresApproval, riskLevel }) => ({
      name,
      description,
      inputSchema,
      outputSchema,
      permissions,
      requiresApproval,
      riskLevel,
    }),
  )
}

export {
  getProfileTool,
  updateProfileTool,
  createEmailDraftTool,
  mockSendEmailTool,
  connectGmailPlaceholderTool,
  sendEmailPlaceholderTool,
  readEmailsPlaceholderTool,
}
