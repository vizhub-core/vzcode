import {
  assembleFullPrompt,
  prepareFilesForPrompt,
} from 'editcodewithai';
import { clearAIScratchpadAndStatus } from './chatOperations.js';
import { formatMarkdownFiles } from 'llm-code-format';

const DEBUG = true;

/**
 * Performs AI editing operations using streaming with incremental OT operations
 */
export const performAIEditing = async ({
  prompt,
  shareDBDoc,
  chatId,
  llmFunction,
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
  DEBUG &&
    console.log('[performAiEdit] fullPrompt:', fullPrompt);

  // Call the LLM function which will handle streaming and incremental file updates
  const result = await llmFunction(fullPrompt);

  // Clear the scratchpad and update status
  // clearAIScratchpadAndStatus(
  //   shareDBDoc,
  //   chatId,
  //   'Done editing with AI.',
  // );

  // Set isInteracting
  // setIsInteracting(shareDBDoc, true);

  // Wait for propagation
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Unset isInteracting
  // setIsInteracting(shareDBDoc, false);

  return {
    content: result.content,
    generationId: result.generationId,
  };
};
