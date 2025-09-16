import fs from 'fs';
import OpenAI from 'openai';
import {
  parseMarkdownFiles,
  StreamingMarkdownParser,
} from 'llm-code-format';
import { mergeFileChanges } from 'editcodewithai';
import { VizChatId, VizContent } from '@vizhub/viz-types';
import { generateRunId } from '@vizhub/viz-utils';
import {
  updateAIStatus,
  createAIMessage,
  updateAIMessageContent,
  finalizeAIMessage,
  updateFiles,
  updateAIScratchpad,
} from './chatOperations.js';
import { diff } from '../../ot.js';
import { ShareDBDoc } from '../../types.js';

const DEBUG = false;

// Useful for testing/debugging the streaming behavior
const slowMode = false;

// Throttle the streaming updates, so that we don't
// overwhelm the ShareDB server with too many updates.
// It happened actually, before adding this.
// MongoDB VizHub server got in fact overloaded with
// too many updates from the AI streaming response, with
// warning: "Replication Oplog Window has gone below 1 hour"
const THROTTLE_INTERVAL_MS = 500;

/**
 * Creates and configures the LLM function for streaming with reasoning tokens
 */
export const createLLMFunction = ({
  shareDBDoc,
  chatId,
  // Feature flag to enable/disable reasoning tokens.
  // When false, reasoning tokens are not requested from the API
  // and reasoning content is not processed in the streaming response.
  enableReasoningTokens = false,
  model,
  aiRequestOptions,
}: {
  shareDBDoc: ShareDBDoc<VizContent>;
  chatId: VizChatId;
  enableReasoningTokens?: boolean;
  model?: string;
  aiRequestOptions?: any;
}) => {
  return async (fullPrompt: string) => {
    // Create OpenRouter client for reasoning token support
    const openRouterClient = new OpenAI({
      apiKey: process.env.VZCODE_EDIT_WITH_AI_API_KEY,
      baseURL:
        process.env.VZCODE_EDIT_WITH_AI_BASE_URL ||
        'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://vizhub.com',
        'X-Title': 'VizHub',
      },
    });

    let fullContent = '';
    let generationId = '';
    let currentEditingFileName = null;

    // Create initial AI message for streaming
    const aiMessageId = createAIMessage(shareDBDoc, chatId);

    // --- throttle wrapper ---
    function makeThrottledUpdater() {
      let lastCall = 0;
      let latestContent = '';
      let timer: NodeJS.Timeout | null = null;

      function invoke() {
        updateAIMessageContent(
          shareDBDoc,
          chatId,
          aiMessageId,
          latestContent,
        );
        lastCall = Date.now();
      }

      const fn = (content: string) => {
        latestContent = content;
        const now = Date.now();

        if (now - lastCall >= THROTTLE_INTERVAL_MS) {
          // safe to call immediately
          invoke();
        } else if (!timer) {
          // schedule for later
          timer = setTimeout(
            () => {
              timer = null;
              invoke();
            },
            THROTTLE_INTERVAL_MS - (now - lastCall),
          );
        }
      };

      // expose a flush() helper to force an immediate write
      fn.flush = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        invoke();
      };

      return fn;
    }

    const throttledUpdateAIMessageContent =
      makeThrottledUpdater();

    // Function to report file edited
    // This is called when the AI has finished editing a file
    // and we want to update the message content with the file name.
    const reportFileEdited = () => {
      if (currentEditingFileName) {
        fullContent += ` * Edited ${currentEditingFileName}\n`;
        throttledUpdateAIMessageContent(fullContent);
        currentEditingFileName = null;
      }
    };

    // Define callbacks for streaming parser
    const callbacks = {
      onFileNameChange: async (
        fileName: string,
        format: string,
      ) => {
        DEBUG &&
          console.log(
            `File changed to: ${fileName} (${format})`,
          );

        reportFileEdited();
        currentEditingFileName = fileName;

        // Update AI status
        updateAIStatus(
          shareDBDoc,
          chatId,
          'Editing ' + fileName,
        );
      },
      onCodeLine: async (line: string) => {
        DEBUG && console.log(`Code line: ${line}`);
      },
      onNonCodeLine: async (line: string) => {
        // We want to report a file edited only if the line is not empty,
        // because sometimes the LLMs leave a newline between the file name
        // declaration and the first line of code.
        if (line.trim() !== '') {
          reportFileEdited();
        }
      },
    };

    const parser = new StreamingMarkdownParser(callbacks);

    const chunks = [];
    let reasoningContent = '';

    // Stream the response with reasoning tokens
    const modelName =
      model ||
      process.env.VZCODE_EDIT_WITH_AI_MODEL_NAME ||
      'anthropic/claude-3.5-sonnet';

    // Configure reasoning tokens based on enableReasoningTokens flag
    const requestConfig: any = {
      model: modelName,
      messages: [{ role: 'user', content: fullPrompt }],
      usage: { include: true },
      stream: true,
      ...aiRequestOptions,
    };

    // Only include reasoning configuration if reasoning tokens are enabled
    if (enableReasoningTokens) {
      requestConfig.reasoning = {
        effort: 'low',
        exclude: false,
      };
    }

    const stream = await (
      openRouterClient.chat.completions.create as any
    )(requestConfig);

    let reasoningStarted = false;
    let contentStarted = false;

    for await (const chunk of stream) {
      if (slowMode) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500),
        );
      }
      const delta = chunk.choices[0]?.delta as any; // Type assertion for OpenRouter-specific reasoning fields

      if (delta?.reasoning && enableReasoningTokens) {
        // Handle reasoning tokens (thinking) - only if enabled
        if (!reasoningStarted) {
          reasoningStarted = true;
          updateAIStatus(shareDBDoc, chatId, 'Thinking...');
        }
        reasoningContent += delta.reasoning;
        updateAIScratchpad(
          shareDBDoc,
          chatId,
          reasoningContent,
        );
      } else if (delta?.content) {
        // Handle regular content tokens
        if (reasoningStarted && !contentStarted) {
          // Clear reasoning when content starts
          contentStarted = true;
          updateAIScratchpad(shareDBDoc, chatId, '');
          updateAIStatus(
            shareDBDoc,
            chatId,
            'Generating response...',
          );
        }

        const chunkContent = delta.content;
        chunks.push(chunkContent);

        await parser.processChunk(chunkContent);
        fullContent += chunkContent;
      } else if (chunk.usage) {
        // Handle usage information
        DEBUG && console.log('Usage:', chunk.usage);
      }

      if (!generationId && chunk.id) {
        generationId = chunk.id;
      }
    }
    await parser.flushRemaining();
    reportFileEdited();

    // Final cleanup - clear scratchpad and set final status
    updateAIScratchpad(shareDBDoc, chatId, '');
    updateAIStatus(shareDBDoc, chatId, 'Done editing.');
    throttledUpdateAIMessageContent(fullContent);

    // Flush to ensure the final content is written immediately
    throttledUpdateAIMessageContent.flush();

    // Finalize the AI message by clearing temporary fields
    finalizeAIMessage(shareDBDoc, chatId);

    // apply all the edits at once
    updateFiles(
      shareDBDoc,
      mergeFileChanges(
        shareDBDoc.data.files,
        parseMarkdownFiles(fullContent, 'bold').files,
      ),
    );

    // Generate a new runId to trigger a run when AI finishes editing
    // This will trigger a re-run without hot reloading
    const newRunId = generateRunId();
    const runIdOp = diff(shareDBDoc.data, {
      ...shareDBDoc.data,
      runId: newRunId,
    });
    shareDBDoc.submitOp(runIdOp, (error) => {
      if (error) {
        console.warn(
          'Error setting runId after AI editing:',
          error,
        );
      } else {
        DEBUG &&
          console.log(
            'Set new runId after AI editing:',
            newRunId,
          );
      }
    });

    // Write chunks file for debugging
    if (DEBUG) {
      const chunksFileJSONpath = `./ai-chunks-${chatId}.json`;
      fs.writeFileSync(
        chunksFileJSONpath,
        JSON.stringify(chunks, null, 2),
      );
      console.log(
        `AI chunks written to ${chunksFileJSONpath}`,
      );
    }

    return {
      content: fullContent,
      generationId: generationId,
    };
  };
};
