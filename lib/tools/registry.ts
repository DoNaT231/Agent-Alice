/**
 * Copyright (c) 2026 Komoróczy Donát. Minden jog fenntartva.
 * Email: donatkomoroczy@gmail.com
 *
 * Vékony re-export a backend/src/tools rétegre (meglévő import útvonalak kompatibilitása).
 */

export {
  runTool,
  getTool,
  listTools,
} from '../../backend/src/tools/runTool.js'

export {
  getProfileTool,
  updateProfileTool,
  createEmailDraftTool,
  mockSendEmailTool,
  connectGmailPlaceholderTool,
  sendEmailPlaceholderTool,
  readEmailsPlaceholderTool,
} from '../../backend/src/tools/registry.js'
