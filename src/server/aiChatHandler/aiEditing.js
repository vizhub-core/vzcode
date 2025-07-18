import { performAiEdit } from 'editcodewithai';
import {
  clearAIScratchpadAndStatus,
  updateFiles,
  setIsInteracting,
} from './chatOperations.js';

/**
 * Performs AI editing operations on the files
 */
export const performAIEditing = async (
  shareDBDoc,
  chatId,
  content,
  files,
  llmFunction,
) => {
  const editResult = await performAiEdit({
    prompt: content,
    files,
    llmFunction,
    apiKey: process.env.VIZHUB_EDIT_WITH_AI_API_KEY,
  });

  // Clear the scratchpad and update status
  clearAIScratchpadAndStatus(
    shareDBDoc,
    chatId,
    'Done editing with AI.',
  );

  // Apply AI edits to files
  updateFiles(shareDBDoc, editResult.changedFiles);

  // Wait for propagation
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Unset isInteracting
  setIsInteracting(shareDBDoc, false);

  return editResult;
};
