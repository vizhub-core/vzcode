import OpenAI from 'openai';
import {
  parseMarkdownFiles,
  StreamingMarkdownParser,
} from 'llm-code-format';
import { mergeFileChanges } from 'editcodewithai';
import { VizChatId } from '@vizhub/viz-types';
import { generateRunId } from '@vizhub/viz-utils';
import {
  updateFiles,
  updateAIScratchpad,
  createStreamingAIMessage,
  addStreamingEvent,
  updateStreamingStatus,
  finalizeStreamingMessage,
} from './chatOperations.js';
import { diff } from '../../ot.js';
import {
  ShareDBDoc,
  ExtendedVizContent,
} from '../../types.js';
import {
  registerController,
  deregisterController,
} from './generationControl.js';
import {
  setStopRequested,
  isStopRequested,
} from './chatStopFlag.js';

const DEBUG = false;

// Useful for testing/debugging the streaming behavior
const slowMode = false;

// Policy: false = discard partial edits on stop, true = apply partial edits
const APPLY_PARTIAL_EDITS_ON_STOP = false;

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
  shareDBDoc: ShareDBDoc<ExtendedVizContent>;
  chatId: VizChatId;
  enableReasoningTokens?: boolean;
  model?: string;
  aiRequestOptions?: any;
}) => {
  return async (fullPrompt: string) => {
    // Reset any previous stop requests for this chat
    setStopRequested(shareDBDoc, chatId, false);

    const abortController = new AbortController();
    registerController(chatId, abortController);

    // Test mode for simulating streaming without API keys
    const testMode =
      process.env.VZCODE_TEST_MODE === 'true';

    if (testMode) {
      return simulateStreamingForTesting(
        shareDBDoc,
        chatId,
        fullPrompt,
        abortController,
      );
    }

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
    let accumulatedTextChunk = '';
    let currentFileContent = '';
    let stopped = false;

    // Create streaming AI message
    createStreamingAIMessage(shareDBDoc, chatId);

    // Set initial content generation status
    updateStreamingStatus(
      shareDBDoc,
      chatId,
      'Formulating a plan...',
    );

    // Helper to get original file content
    const getOriginalFileContent = (
      fileName: string,
    ): string => {
      const files = shareDBDoc.data.files;
      for (const file of Object.values(files)) {
        if ((file as any).name === fileName) {
          return (file as any).text || '';
        }
      }
      return '';
    };

    // Helper to emit text chunk when accumulated
    const emitTextChunk = async () => {
      if (accumulatedTextChunk.trim()) {
        DEBUG &&
          console.log(
            'LLMStreaming: Emitting text chunk:',
            accumulatedTextChunk.substring(0, 100) + '...',
          );
        await addStreamingEvent(shareDBDoc, chatId, {
          type: 'text_chunk',
          content: accumulatedTextChunk,
          timestamp: Date.now(),
        });
        accumulatedTextChunk = '';
      }
    };

    // Helper to complete file editing
    const completeFileEditing = async (
      fileName: string,
    ) => {
      if (fileName && currentFileContent) {
        DEBUG &&
          console.log(
            `LLMStreaming: Completing file editing for ${fileName}`,
          );
        await addStreamingEvent(shareDBDoc, chatId, {
          type: 'file_complete',
          fileName,
          beforeContent: getOriginalFileContent(fileName),
          afterContent: currentFileContent,
          timestamp: Date.now(),
        });
        currentFileContent = '';
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
            `LLMStreaming: File changed to: ${fileName} (${format})`,
          );

        // Emit any accumulated text chunk first
        await emitTextChunk();

        // Complete previous file if any
        if (currentEditingFileName) {
          await completeFileEditing(currentEditingFileName);
        }

        // Start new file
        currentEditingFileName = fileName;
        currentFileContent = '';

        // Emit file start event
        await addStreamingEvent(shareDBDoc, chatId, {
          type: 'file_start',
          fileName,
          timestamp: Date.now(),
        });

        // Update status
        updateStreamingStatus(
          shareDBDoc,
          chatId,
          `Editing ${fileName}...`,
        );
      },
      onCodeLine: async (line: string) => {
        DEBUG && console.log(`Code line: ${line}`);
        // Accumulate code content for the current file
        currentFileContent += line + '\n';
      },
      onNonCodeLine: async (line: string) => {
        DEBUG && console.log(`Non-code line: ${line}`);
        // Accumulate non-code content as text chunk
        if (line.trim() !== '') {
          accumulatedTextChunk += line + '\n';

          // Update status for subsequent non-code chunks
          if (firstNonCodeChunkProcessed) {
            updateStreamingStatus(
              shareDBDoc,
              chatId,
              'Describing changes...',
            );
          } else {
            firstNonCodeChunkProcessed = true;
          }
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
      // IMPORTANT: pass abort signal so we can stop immediately
      signal: abortController.signal,
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
    let firstNonCodeChunkProcessed = false;

    try {
      for await (const chunk of stream) {
        // Early out if UI requested stop (cooperative cancel)
        if (isStopRequested(shareDBDoc, chatId)) {
          stopped = true;
          abortController.abort(); // ensure the SDK/network stops too
          break;
        }

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
            updateStreamingStatus(
              shareDBDoc,
              chatId,
              'Thinking...',
            );
          }
          reasoningContent += delta.reasoning;
          updateAIScratchpad(
            shareDBDoc,
            chatId,
            reasoningContent,
          );
        } else if (delta?.content) {
          // Handle regular content tokens
          if (!contentStarted) {
            contentStarted = true;
            if (reasoningStarted) {
              // Clear reasoning when content starts
              updateAIScratchpad(shareDBDoc, chatId, '');
            }
            // // Set initial content generation status
            // updateStreamingStatus(
            //   shareDBDoc,
            //   chatId,
            //   'Formulating a plan...',
            // );
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

      // Flush any parser buffers if we didn't hard abort
      if (!abortController.signal.aborted) {
        await parser.flushRemaining();
        await emitTextChunk();
        if (currentEditingFileName) {
          await completeFileEditing(currentEditingFileName);
        }
      }
    } catch (err: any) {
      // If stopped by user, OpenAI SDK throws an AbortError
      if (err?.name === 'AbortError') {
        stopped = true;
      } else {
        // Real error
        updateStreamingStatus(
          shareDBDoc,
          chatId,
          'Generation failed.',
        );
        await addStreamingEvent(shareDBDoc, chatId, {
          type: 'error',
          message: String(err?.message || err),
          timestamp: Date.now(),
        });
        // Ensure controller cleanup
        deregisterController(chatId);
        setStopRequested(shareDBDoc, chatId, false);
        // Do not apply edits; finalize message as failed
        await finalizeStreamingMessage(shareDBDoc, chatId);
        throw err;
      }
    } finally {
      // Always cleanup controller
      deregisterController(chatId);
      setStopRequested(shareDBDoc, chatId, false);
    }

    // If user stopped: decide policy (apply partial or discard)
    if (stopped) {
      updateStreamingStatus(
        shareDBDoc,
        chatId,
        'Stopped by user.',
      );
      await addStreamingEvent(shareDBDoc, chatId, {
        type: 'stopped',
        timestamp: Date.now(),
      });

      if (
        APPLY_PARTIAL_EDITS_ON_STOP &&
        fullContent.trim()
      ) {
        // (optional) apply partial changes — your call
        updateFiles(
          shareDBDoc,
          mergeFileChanges(
            shareDBDoc.data.files,
            parseMarkdownFiles(fullContent, 'bold').files,
          ),
        );
      }

      await finalizeStreamingMessage(shareDBDoc, chatId);
      return { content: fullContent, generationId };
    }

    // Normal completion: apply edits, finalize, kick runId
    // Normal completion: apply edits, finalize, kick runId
    updateFiles(
      shareDBDoc,
      mergeFileChanges(
        shareDBDoc.data.files,
        parseMarkdownFiles(fullContent, 'bold').files,
      ),
    );

    // Finalize streaming message
    await finalizeStreamingMessage(shareDBDoc, chatId);

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
    // if (DEBUG) {
    //   const chunksFileJSONpath = `./ai-chunks-${chatId}.json`;
    //   fs.writeFileSync(
    //     chunksFileJSONpath,
    //     JSON.stringify(chunks, null, 2),
    //   );
    //   console.log(
    //     `AI chunks written to ${chunksFileJSONpath}`,
    //   );
    // }

    return {
      content: fullContent,
      generationId: generationId,
    };
  };
};

/**
 * Simulates streaming for testing purposes when no API key is available
 */
async function simulateStreamingForTesting(
  shareDBDoc: ShareDBDoc<ExtendedVizContent>,
  chatId: VizChatId,
  fullPrompt: string,
  abortController: AbortController,
) {
  let stopped = false;
  let fullContent = '';

  try {
    createStreamingAIMessage(shareDBDoc, chatId);
    updateStreamingStatus(
      shareDBDoc,
      chatId,
      'Formulating a plan...',
    );

    // Simulate some thinking time (for testing only)
    for (let i = 0; i < 10; i++) {
      if (
        isStopRequested(shareDBDoc, chatId) ||
        abortController.signal.aborted
      ) {
        stopped = true;
        break;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, 500),
      );
      updateStreamingStatus(
        shareDBDoc,
        chatId,
        `Thinking... (${i + 1}/10)`,
      );
    }

    if (!stopped) {
      updateStreamingStatus(
        shareDBDoc,
        chatId,
        'Generating response...',
      );

      // Simulate streaming text content
      const simulatedResponse = `I'll help you add a console.log statement to the index.js file.

\`\`\`js
// index.js
console.log('Hello from VZCode!');
\`\`\`

This adds a simple console.log statement at the beginning of your index.js file.`;

      const words = simulatedResponse.split(' ');
      for (let i = 0; i < words.length; i++) {
        if (
          isStopRequested(shareDBDoc, chatId) ||
          abortController.signal.aborted
        ) {
          stopped = true;
          break;
        }

        const word = words[i];
        fullContent += word + ' ';

        await addStreamingEvent(shareDBDoc, chatId, {
          type: 'text_chunk',
          content: word + ' ',
          timestamp: Date.now(),
        });

        // Simulate typing delay (for testing only)
        await new Promise((resolve) =>
          setTimeout(resolve, 200),
        );
      }
    }

    if (stopped) {
      updateStreamingStatus(
        shareDBDoc,
        chatId,
        'Stopped by user.',
      );
      await addStreamingEvent(shareDBDoc, chatId, {
        type: 'stopped',
        timestamp: Date.now(),
      });
    } else {
      updateStreamingStatus(shareDBDoc, chatId, 'Done');
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      stopped = true;
    } else {
      updateStreamingStatus(
        shareDBDoc,
        chatId,
        'Generation failed.',
      );
      await addStreamingEvent(shareDBDoc, chatId, {
        type: 'error',
        message: String(err?.message || err),
        timestamp: Date.now(),
      });
    }
  } finally {
    deregisterController(chatId);
    setStopRequested(shareDBDoc, chatId, false);
    await finalizeStreamingMessage(shareDBDoc, chatId);
  }

  return {
    content: fullContent,
    generationId: 'test-generation-id',
  };
}
