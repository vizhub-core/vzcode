import { clearAIScratchpadAndStatus } from './chatOperations.js';

/**
 * Performs AI editing operations using streaming with incremental OT operations
 */
export const performAIEditing = async (
  shareDBDoc,
  chatId,
  content,
  files,
  llmFunction,
) => {
  // Set isInteracting flag
  // setIsInteracting(shareDBDoc, true);

  // Create the prompt for the LLM
  const filesContext = Object.values(files)
    .map(
      (file) =>
        `**${file.name}**\n\`\`\`\n${file.text}\n\`\`\``,
    )
    .join('\n\n');

  const fullPrompt = `${content}\n\nCurrent files:\n${filesContext}`;

  // Call the LLM function which will handle streaming and incremental file updates
  const result = await llmFunction(fullPrompt);

  // Clear the scratchpad and update status
  clearAIScratchpadAndStatus(
    shareDBDoc,
    chatId,
    'Done editing with AI.',
  );

  // Wait for propagation
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Unset isInteracting
  // setIsInteracting(shareDBDoc, false);

  return {
    content: result.content,
    generationId: result.generationId,
    // Note: changedFiles is no longer needed since files are updated incrementally
  };
};
