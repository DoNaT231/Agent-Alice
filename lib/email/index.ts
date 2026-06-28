// Backend email module scaffold — Gmail OAuth not implemented yet.

export { buildEmailDraftUserPrompt, EMAIL_DRAFT_SYSTEM_PROMPT } from './prompts/emailDraft.prompt.js'
export { buildEmailReplyUserPrompt, EMAIL_REPLY_SYSTEM_PROMPT } from './prompts/emailReply.prompt.js'
export {
  buildEmailClassifierUserPrompt,
  EMAIL_CLASSIFIER_SYSTEM_PROMPT,
} from './prompts/emailClassifier.prompt.js'

export { sendEmail, isGmailConnected } from './services/gmail.service.js'
