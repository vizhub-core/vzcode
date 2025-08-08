import {
  assembleFullPrompt,
  prepareFilesForPrompt,
} from 'editcodewithai';
import { formatMarkdownFiles } from 'llm-code-format';
import {
  createFilesSnapshot,
  generateFilesUnifiedDiff,
} from '../../utils/fileDiff.js';
import {
  VizChatId,
  VizChatMessage,
} from '@vizhub/viz-types';

// Dev flag for waiting 1 second before starting the LLM function.
// Useful for debugging and testing purposes, e.g. checking the typing indicator.
const delayStart = false;

/**
 * Formats chat history for inclusion in LLM prompts
 * Excludes the most recent user message since it's passed separately as the main prompt
 */
const formatChatHistory = (
  messages: VizChatMessage[],
): string => {
  // Get all messages except the last one (which should be the current user message)
  const historyMessages = messages.slice(0, -1);

  if (historyMessages.length === 0) {
    return '';
  }

  const formattedHistory = historyMessages
    .map((msg) => {
      const role =
        msg.role === 'user' ? 'User' : 'Assistant';
      return `${role}: ${msg.content}`;
    })
    .join('\n\n');

  return `Previous conversation:\n${formattedHistory}\n\nCurrent request:\n`;
};

/**
 * Performs AI chat without editing - just generates a response
 */
export const performAIChat = async ({
  prompt,
  shareDBDoc,
  llmFunction,
  chatId,
}: {
  prompt: string;
  shareDBDoc: any;
  llmFunction: any;
  chatId: VizChatId;
}) => {
  const preparedFiles = prepareFilesForPrompt(
    shareDBDoc.data.files,
  );
  const filesContext = formatMarkdownFiles(preparedFiles);

  // Include chat history in the prompt
  const chatMessages =
    shareDBDoc.data.chats?.[chatId]?.messages || [];
  const chatHistoryPrefix = formatChatHistory(chatMessages);
  const promptWithHistory = chatHistoryPrefix + prompt;

  // 2. Assemble the final prompt for Q&A mode
  const fullPrompt = assembleFullPrompt({
    filesContext,
    prompt: promptWithHistory,
    editFormat: 'whole',
  });

  if (delayStart) {
    await new Promise((resolve) =>
      setTimeout(resolve, 1000),
    );
  }

  // Call the LLM function which will handle streaming but won't edit files
  const result = await llmFunction(fullPrompt);

  return {
    content: result.content,
    generationId: result.generationId,
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
}: {
  prompt: string;
  shareDBDoc: any;
  llmFunction: any;
  runCode: any;
  chatId: VizChatId;
}) => {
  // 1. Capture the current state of files before editing
  const beforeFiles = createFilesSnapshot(
    shareDBDoc.data.files,
  );

  const preparedFiles = prepareFilesForPrompt(
    shareDBDoc.data.files,
  );
  const filesContext = formatMarkdownFiles(preparedFiles);

  // Include chat history in the prompt
  const chatMessages =
    shareDBDoc.data.chats?.[chatId]?.messages || [];
  const chatHistoryPrefix = formatChatHistory(chatMessages);
  const promptWithHistory = chatHistoryPrefix + prompt;

  // 2. Assemble the final prompt
  const fullPrompt = assembleFullPrompt({
    filesContext,
    prompt: promptWithHistory,
    editFormat: 'whole',
  });

  if (delayStart) {
    await new Promise((resolve) =>
      setTimeout(resolve, 1000),
    );
  }

  // Call the LLM function which will handle streaming and incremental file updates
  const result = await llmFunction(fullPrompt);

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
