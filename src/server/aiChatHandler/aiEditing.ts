import {
  assembleFullPrompt,
  prepareFilesForPrompt,
} from 'editcodewithai';
import { formatMarkdownFiles } from 'llm-code-format';
import {
  createFilesSnapshot,
  generateFilesUnifiedDiff,
} from '../../utils/fileDiff.js';
import { formatFiles } from '../prettier.js';
import { createSubmitOperation } from '../../submitOperation.js';
import { VizContent } from '@vizhub/viz-types';

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
  const preparedFiles = prepareFilesForPrompt(
    shareDBDoc.data.files,
  );
  const filesContext = formatMarkdownFiles(preparedFiles);

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
  // 1. Capture the current state of files before editing
  const beforeFiles = createFilesSnapshot(
    shareDBDoc.data.files,
  );

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

  // 3. Run Prettier on changed files before running code
  const afterLLMFiles = createFilesSnapshot(
    shareDBDoc.data.files,
  );

  // Find files that were changed by the AI
  const changedFileIds = Object.keys(afterLLMFiles).filter(
    (fileId) =>
      beforeFiles[fileId]?.text !==
      afterLLMFiles[fileId]?.text,
  );

  if (changedFileIds.length > 0) {
    // Format the changed files
    const formattedFiles = await formatFiles(
      shareDBDoc.data.files,
      changedFileIds,
    );

    // Apply formatted versions to shareDBDoc if formatting succeeded
    if (Object.keys(formattedFiles).length > 0) {
      const submitOperation =
        createSubmitOperation(shareDBDoc);
      submitOperation((document: VizContent) => {
        const updatedFiles = { ...document.files };

        // Apply each formatted file
        Object.entries(formattedFiles).forEach(
          ([fileId, formattedText]) => {
            if (updatedFiles[fileId]) {
              updatedFiles[fileId] = {
                ...updatedFiles[fileId],
                text: formattedText,
              };
            }
          },
        );

        return {
          ...document,
          files: updatedFiles,
        };
      });
    }
  }

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
    beforeFiles, // Store the snapshot for undo functionality
  };
};
