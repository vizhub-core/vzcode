/**
 * @vizhub/llm-streaming-server
 *
 * Server-side library for streaming LLM responses with ShareDB integration.
 * This module provides functionality for:
 * - Creating and managing LLM streaming functions
 * - Performing AI-assisted code editing
 * - Managing chat operations with ShareDB
 * - Validating requests and handling errors
 */

// Core LLM streaming functionality
export { createLLMFunction } from './llmStreaming.js';

// AI editing operations
export {
  performAIChat,
  performAIEditing,
} from './aiEditing.js';

// ShareDB chat operations
export {
  ensureChatsExist,
  ensureChatExists,
  addUserMessage,
  updateAIStatus,
  updateAIScratchpad,
  clearAIScratchpadAndStatus,
  createAIMessage,
  updateAIMessageContent,
  setAIStatus,
  finalizeAIMessage,
  addDiffToAIMessage,
  addAIMessage,
  updateFiles,
  resolveFileId,
  createNewFile,
  createStreamingAIMessage,
  addStreamingEvent,
  updateStreamingStatus,
  finalizeStreamingMessage,
} from './chatOperations.js';

// Request validation
export { validateRequest } from './validation.js';

// Error handling
export {
  handleError,
  handleBackgroundError,
} from './errorHandling.js';
