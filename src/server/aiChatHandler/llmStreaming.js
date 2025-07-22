import { StreamingMarkdownParser } from 'llm-code-format';
import { ChatOpenAI } from '@langchain/openai';
import {
  updateAIStatus,
  updateAIScratchpad,
  ensureFileExists,
  clearFileContent,
  appendLineToFile,
} from './chatOperations.js';

const debug = false;

/**
 * Creates and configures the LLM function for streaming
 */
export const createLLMFunction = (shareDBDoc, chatId) => {
  return async (fullPrompt) => {
    const chatModel = new ChatOpenAI({
      modelName:
        process.env.VIZHUB_EDIT_WITH_AI_MODEL_NAME ||
        'anthropic/claude-sonnet-4',
      configuration: {
        apiKey: process.env.VIZHUB_EDIT_WITH_AI_API_KEY,
        baseURL: process.env.VIZHUB_EDIT_WITH_AI_BASE_URL,
        defaultHeaders: {
          'HTTP-Referer': 'https://vizhub.com',
          'X-Title': 'VizHub',
        },
      },
      streaming: true,
    });

    let fullContent = '';
    let generationId = '';
    let currentEditingFileId = null;

    // Track expected state to avoid race conditions
    let expectedAiScratchpad =
      shareDBDoc.data.chats[chatId]?.aiScratchpad || '';

    // Throttle updates to avoid "op too long" errors
    let lastUpdateTime = 0;
    const UPDATE_THROTTLE_MS = 100;

    // Define callbacks for streaming parser
    const callbacks = {
      onFileNameChange: (fileName, format) => {
        debug &&
          console.log(
            `File changed to: ${fileName} (${format})`,
          );

        // Find existing file or create new one
        currentEditingFileId = ensureFileExists(
          shareDBDoc,
          fileName,
        );

        // Clear the file content to start fresh
        // (AI will regenerate the entire file content)
        clearFileContent(shareDBDoc, currentEditingFileId);

        // Update AI status
        updateAIStatus(
          shareDBDoc,
          chatId,
          'Editing ' + fileName,
        );
      },
      onCodeLine: (line) => {
        debug && console.log(`Code line: ${line}`);

        if (currentEditingFileId) {
          // Apply OT operation for this line immediately
          appendLineToFile(
            shareDBDoc,
            currentEditingFileId,
            line,
          );
        }
      },
      onNonCodeLine: (line) => {
        debug && console.log(`Comment/text: ${line}`);
      },
    };

    const parser = new StreamingMarkdownParser(callbacks);

    // Stream the response
    const stream = await chatModel.stream(fullPrompt);
    for await (const chunk of stream) {
      if (chunk.content) {
        const chunkContent = String(chunk.content);
        fullContent += chunkContent;

        // Throttle updates
        const now = Date.now();
        const shouldUpdate =
          now - lastUpdateTime >= UPDATE_THROTTLE_MS;

        if (shouldUpdate) {
          updateAIScratchpad(
            shareDBDoc,
            chatId,
            fullContent,
          );
          expectedAiScratchpad = fullContent;
          lastUpdateTime = now;
        }

        parser.processChunk(chunkContent);
      }

      if (!generationId && chunk.lc_kwargs?.id) {
        generationId = chunk.lc_kwargs.id;
      }
    }
    parser.flushRemaining();

    // Submit final update if there's pending content
    if (expectedAiScratchpad !== fullContent) {
      updateAIScratchpad(shareDBDoc, chatId, fullContent);
    }

    return {
      content: fullContent,
      generationId: generationId,
    };
  };
};
