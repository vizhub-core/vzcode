import {
  assembleFullPrompt,
  prepareFilesForPrompt,
} from 'editcodewithai';
import { formatMarkdownFiles } from 'llm-code-format';
import {
  createFilesSnapshot,
  generateFilesUnifiedDiff,
} from '../../utils/fileDiff.js';
import { createLangChainChatbot } from './langchainChatbot.js';
import {
  VizChatId,
  VizChatMessage,
} from '@vizhub/viz-types';

// Dev flag for waiting 1 second before starting the LLM function.
// Useful for debugging and testing purposes, e.g. checking the typing indicator.
const delayStart = false;

/**
 * Performs AI chat without editing - just generates a response
 */
export const performAIChat = async ({
  prompt,
  shareDBDoc,
  llmFunction,
  chatId,
  model,
  aiRequestOptions,
}: {
  prompt: string;
  shareDBDoc: any;
  llmFunction: any;
  chatId: VizChatId;
  model?: string;
  aiRequestOptions?: any;
}) => {
  const preparedFiles = prepareFilesForPrompt(
    shareDBDoc.data.files,
  );
  const filesContext = formatMarkdownFiles(preparedFiles);

  // Assemble the system prompt for Q&A mode using existing format
  const systemPrompt = assembleFullPrompt({
    filesContext,
    prompt:
      'You are a helpful AI assistant for code review and questions.',
    editFormat: 'whole',
  });

  // Get chat history from ShareDB
  const chatMessages: VizChatMessage[] =
    shareDBDoc.data.chats?.[chatId]?.messages || [];

  // Create LangChain chatbot with proper history management
  const chatbot = createLangChainChatbot(
    systemPrompt,
    chatId,
    model,
    aiRequestOptions,
  );

  if (delayStart) {
    await new Promise((resolve) =>
      setTimeout(resolve, 1000),
    );
  }

  // Use LangChain chatbot for chat mode (no file editing needed)
  const responseContent = await chatbot.sendMessage(
    prompt,
    chatMessages,
  );

  return {
    content: responseContent,
    generationId: 'langchain-' + Date.now(), // Generate a simple ID
    diffData: {}, // No file changes in ask mode
  };
};

/**
 * Performs AI editing operations using streaming with incremental OT operations
 */
export const performAIEditing = async ({
  prompt,
  shareDBDoc,
  llmFunction,
  runCode,
  chatId,
  model,
  aiRequestOptions,
}: {
  prompt: string;
  shareDBDoc: any;
  llmFunction: any;
  runCode: any;
  chatId: VizChatId;
  model?: string;
  aiRequestOptions?: any;
}) => {
  // 1. Capture the current state of files before editing
  const beforeFiles = createFilesSnapshot(
    shareDBDoc.data.files,
  );

  const preparedFiles = prepareFilesForPrompt(
    shareDBDoc.data.files,
  );
  const filesContext = formatMarkdownFiles(preparedFiles);

  // Assemble the system prompt for editing mode
  const systemPrompt = assembleFullPrompt({
    filesContext,
    prompt:
      'You are a helpful AI assistant for code editing. When making changes, provide complete file contents with your modifications.',
    editFormat: 'whole',
  });

  // Get chat history from ShareDB
  const chatMessages: VizChatMessage[] =
    shareDBDoc.data.chats?.[chatId]?.messages || [];

  // Create LangChain chatbot with proper history management
  const chatbot = createLangChainChatbot(
    systemPrompt,
    chatId,
    model,
    aiRequestOptions,
  );

  if (delayStart) {
    await new Promise((resolve) =>
      setTimeout(resolve, 1000),
    );
  }

  // Use the updated LLM function (which now uses LangChain internally)
  const result = await llmFunction(systemPrompt);

  runCode();

  // 3. Capture the state of files after editing and generate diff
  const afterFiles = createFilesSnapshot(
    shareDBDoc.data.files,
  );
  const diffData = generateFilesUnifiedDiff(
    beforeFiles,
    afterFiles,
  );

  return {
    content: result.content,
    generationId: result.generationId,
    diffData,
    beforeFiles, // Store the snapshot for undo functionality
  };
};
