import {
  assembleFullPrompt,
  prepareFilesForPrompt,
} from 'editcodewithai';
import { formatMarkdownFiles } from 'llm-code-format';

// Dev flag for waiting 1 second before starting the LLM function.
// Useful for debugging and testing purposes, e.g. checking the typing indicator.
const delayStart = false;

/**
 * Performs AI editing operations using streaming with incremental OT operations
 */
export const performAIEditing = async ({
  prompt,
  shareDBDoc,
  llmFunction,
  runCode,
}) => {
  const preparedFiles = prepareFilesForPrompt(
    shareDBDoc.data.files,
  );
  const filesContext = formatMarkdownFiles(preparedFiles);

  // 2. Assemble the final prompt
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

  // Call the LLM function which will handle streaming and incremental file updates
  const result = await llmFunction(fullPrompt);

  runCode();

  return {
    content: result.content,
    generationId: result.generationId,
  };
};
