import {
  dateToTimestamp,
  vizFilesToFileCollection,
  fileCollectionToVizFiles,
} from '@vizhub/viz-utils';
import { StreamingMarkdownParser } from 'llm-code-format';
import { ChatOpenAI } from '@langchain/openai';
import { performAiEdit } from 'editcodewithai';
import { diff } from '../client/diff.js';

const debug = false;

export const handleAIChatMessage =
  (shareDBDoc) => async (req, res) => {
    const { content, chatId } = req.body;

    if (debug) {
      console.log(
        '[handleAIChatMessage] content:',
        content,
        'chatId:',
        chatId,
      );
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        error:
          'Invalid request: content is required and must be a string',
      });
    }

    if (!chatId || typeof chatId !== 'string') {
      return res.status(400).json({
        error:
          'Invalid request: chatId is required and must be a string',
      });
    }

    try {
      // Get existing files from ShareDB doc and convert to FileCollection format
      const vizFiles = shareDBDoc.data.files;
      const files = vizFiles;

      // Ensure chats object exists
      if (!shareDBDoc.data.chats) {
        const op = diff(shareDBDoc.data, {
          ...shareDBDoc.data,
          chats: {},
        });
        shareDBDoc.submitOp(op);
      }

      // Ensure the specific chat exists
      if (!shareDBDoc.data.chats[chatId]) {
        const op = diff(shareDBDoc.data, {
          ...shareDBDoc.data,
          chats: {
            ...shareDBDoc.data.chats,
            [chatId]: {
              id: chatId,
              messages: [],
              createdAt: dateToTimestamp(new Date()),
              updatedAt: dateToTimestamp(new Date()),
            },
          },
        });
        shareDBDoc.submitOp(op);
      }

      // Add user message to chat
      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content,
        timestamp: dateToTimestamp(new Date()),
      };

      const userMessageOp = diff(shareDBDoc.data, {
        ...shareDBDoc.data,
        chats: {
          ...shareDBDoc.data.chats,
          [chatId]: {
            ...shareDBDoc.data.chats[chatId],
            messages: [
              ...shareDBDoc.data.chats[chatId].messages,
              userMessage,
            ],
            updatedAt: dateToTimestamp(new Date()),
          },
        },
      });
      shareDBDoc.submitOp(userMessageOp);

      // Define LLM function for streaming
      const llmFunction = async (fullPrompt) => {
        const chatModel = new ChatOpenAI({
          modelName:
            process.env.VIZHUB_EDIT_WITH_AI_MODEL_NAME ||
            'gpt-4o-mini',
          configuration: {
            apiKey: process.env.VIZHUB_EDIT_WITH_AI_API_KEY,
            baseURL:
              process.env.VIZHUB_EDIT_WITH_AI_BASE_URL,
            defaultHeaders: {
              'HTTP-Referer': 'https://vizhub.com',
              'X-Title': 'VizHub',
            },
          },
          streaming: true,
        });

        let fullContent = '';
        let generationId = '';

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
            const op = diff(shareDBDoc.data, {
              ...shareDBDoc.data,
              chats: {
                ...shareDBDoc.data.chats,
                [chatId]: {
                  ...shareDBDoc.data.chats[chatId],
                  aiStatus: 'Editing ' + fileName,
                },
              },
            });
            shareDBDoc.submitOp(op);
          },
          onCodeLine: (line) => {
            debug && console.log(`Code line: ${line}`);
          },
          onNonCodeLine: (line) => {
            debug && console.log(`Comment/text: ${line}`);
          },
        };

        const parser = new StreamingMarkdownParser(
          callbacks,
        );

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
              const newExpectedState = {
                ...shareDBDoc.data,
                chats: {
                  ...shareDBDoc.data.chats,
                  [chatId]: {
                    ...shareDBDoc.data.chats[chatId],
                    aiScratchpad: fullContent,
                  },
                },
              };

              const op = diff(
                shareDBDoc.data,
                newExpectedState,
              );
              shareDBDoc.submitOp(op);

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
          const newExpectedState = {
            ...shareDBDoc.data,
            chats: {
              ...shareDBDoc.data.chats,
              [chatId]: {
                ...shareDBDoc.data.chats[chatId],
                aiScratchpad: fullContent,
              },
            },
          };

          const op = diff(
            shareDBDoc.data,
            newExpectedState,
          );
          shareDBDoc.submitOp(op);
        }

        return {
          content: fullContent,
          generationId: generationId,
        };
      };

      const editResult = await performAiEdit({
        prompt: content,
        files,
        llmFunction,
        apiKey: process.env.VIZHUB_EDIT_WITH_AI_API_KEY,
      });

      // Clear the scratchpad and update status
      const clearOp = diff(shareDBDoc.data, {
        ...shareDBDoc.data,
        chats: {
          ...shareDBDoc.data.chats,
          [chatId]: {
            ...shareDBDoc.data.chats[chatId],
            aiScratchpad: undefined,
            aiStatus: 'Done editing with AI.',
          },
        },
      });
      shareDBDoc.submitOp(clearOp);

      // Apply AI edits to files (convert back to VizFiles format)
      const filesOp = diff(shareDBDoc.data, {
        ...shareDBDoc.data,
        files: editResult.changedFiles,
        isInteracting: true,
      });
      shareDBDoc.submitOp(filesOp);

      // Wait for propagation
      await new Promise((resolve) =>
        setTimeout(resolve, 100),
      );

      // Unset isInteracting
      const interactingOp = diff(
        { isInteracting: true },
        { isInteracting: false },
      );
      shareDBDoc.submitOp(interactingOp);

      // Create AI response message
      const aiResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content:
          editResult.content ||
          'AI edit completed successfully.',
        timestamp: dateToTimestamp(new Date()),
      };

      // Add the AI response to the chat messages
      const messageOp = diff(shareDBDoc.data, {
        ...shareDBDoc.data,
        chats: {
          ...shareDBDoc.data.chats,
          [chatId]: {
            ...shareDBDoc.data.chats[chatId],
            messages: [
              ...shareDBDoc.data.chats[chatId].messages,
              aiResponse,
            ],
            updatedAt: dateToTimestamp(new Date()),
            aiStatus: undefined,
          },
        },
      });
      shareDBDoc.submitOp(messageOp);

      res.status(200).json(aiResponse);
    } catch (error) {
      console.error('[handleAIChatMessage] error:', error);

      // Clear scratchpad and add error message on error
      try {
        const errorResponse = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            'Sorry, I encountered an error while processing your message. Please try again.',
          timestamp: dateToTimestamp(new Date()),
        };

        const errorOp = diff(shareDBDoc.data, {
          ...shareDBDoc.data,
          chats: {
            ...shareDBDoc.data.chats,
            [chatId]: {
              ...shareDBDoc.data.chats[chatId],
              messages: [
                ...shareDBDoc.data.chats[chatId].messages,
                errorResponse,
              ],
              aiScratchpad: undefined,
              aiStatus: undefined,
              updatedAt: dateToTimestamp(new Date()),
            },
          },
        });
        shareDBDoc.submitOp(errorOp);
      } catch (opError) {
        console.error(
          '[handleAIChatMessage] error handling error state:',
          opError,
        );
      }

      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  };
