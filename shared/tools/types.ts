/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * MCP-kompatibilis tool típusok – frontend és backend közös szerződése.
 */

import type { MessagePayload, MessageType } from '../types/messages.js'
import type { ToolContext } from './context.js'

export type ToolRiskLevel = 'low' | 'medium' | 'high'

export interface ToolPermissions {
  /** Olvasott erőforrások (pl. profile, email.draft, gmail.inbox). */
  reads: string[]
  /** Írt erőforrások (pl. profile, email.draft, gmail.send). */
  writes: string[]
  /** Külső API / MCP hívás szükséges-e. */
  externalAccess: boolean
}

export interface JsonSchemaProperty {
  type: string
  description?: string
  enum?: string[]
}

/** Egyszerű JSON Schema objektum – MCP tool list kompatibilitás. */
export interface ToolSchema {
  type: 'object'
  properties: Record<string, JsonSchemaProperty>
  required?: string[]
}

/** Egy tool futása után a chatbe kerülő strukturált válasz. */
export interface ToolMessageResult {
  type: MessageType
  content: string
  payload: MessagePayload | Record<string, unknown>
  moduleUsed?: 'chat' | 'profile' | 'email' | 'business' | 'search' | null
}

/**
 * MCP-stílusú belső tool definíció.
 * Később külső Gmail MCP szerver tooljai ugyanezt a formát követhetik.
 */
export interface ToolDefinition<TInput = Record<string, unknown>> {
  name: string
  description: string
  inputSchema: ToolSchema
  outputSchema?: ToolSchema
  permissions: ToolPermissions
  requiresApproval: boolean
  riskLevel: ToolRiskLevel
  handler: (input: TInput, context: ToolContext) => Promise<ToolMessageResult>
}

export interface RunToolRequestBody {
  toolName: string
  input: Record<string, unknown>
}

export interface RunToolResponseBody {
  result: ToolMessageResult
}

/** Nyilvános metaadatok tool listázáshoz (MCP tools/list). */
export type ToolListing = Pick<
  ToolDefinition,
  'name' | 'description' | 'inputSchema' | 'outputSchema' | 'permissions' | 'requiresApproval' | 'riskLevel'
>
