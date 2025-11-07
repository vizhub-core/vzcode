import {
  assembleFullPrompt,
  prepareFilesForPrompt,
} from 'editcodewithai';
import { formatMarkdownFiles } from 'llm-code-format';
import {
  createFilesSnapshot,
  generateFilesUnifiedDiff,
} from '../utils/fileDiff.js';

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
}) => {
  const { files } = prepareFilesForPrompt(
    shareDBDoc.data.files,
  );
  const filesContext = formatMarkdownFiles(files);

  // 2. Assemble the final prompt for Q&A mode
  const fullPrompt = assembleFullPrompt({
    filesContext,
    prompt,
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
}) => {
  // Capture the current state of files before editing
  const beforeFiles = createFilesSnapshot(
    shareDBDoc.data.files,
  );

  const { files } = prepareFilesForPrompt(
    shareDBDoc.data.files,
  );
  const filesContext = formatMarkdownFiles(files);

  // Assemble the final prompt
  const fullPrompt = assembleFullPrompt({
    filesContext,
    prompt,
    editFormat: 'whole',
  });

  if (delayStart) {
    await new Promise((resolve) =>
      setTimeout(resolve, 1000),
    );
  }

  // Call the LLM function which will handle streaming, incremental file updates, and Prettier formatting
  const result = await llmFunction(fullPrompt);

  runCode();

  // 4. Capture the state of files after editing and formatting, then generate diff
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
  };
};
