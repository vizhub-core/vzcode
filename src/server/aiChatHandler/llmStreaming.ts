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

const DEBUG = true;

// Useful for testing/debugging the streaming behavior
const slowMode = false;

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

    // Create streaming AI message
    const aiMessageId = createStreamingAIMessage(
      shareDBDoc,
      chatId,
    );

    // Set initial status
    DEBUG &&
      console.log(
        'LLMStreaming: Setting initial status - Analyzing request...',
      );
    updateStreamingStatus(
      shareDBDoc,
      chatId,
      'Analyzing request...',
    );

    // Helper to get original file content
    const getOriginalFileContent = (
      fileName: string,
    ): string => {
      const files = shareDBDoc.data.files;
      for (const [fileId, file] of Object.entries(files)) {
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

    // Emit any remaining text chunk
    await emitTextChunk();

    // Complete final file if any
    if (currentEditingFileName) {
      await completeFileEditing(currentEditingFileName);
    }

    // Finalize streaming message
    await finalizeStreamingMessage(shareDBDoc, chatId);

    // Apply all the edits at once
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
