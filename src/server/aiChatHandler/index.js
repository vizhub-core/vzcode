import { validateRequest } from './validation.js';
import {
  ensureChatsExist,
  ensureChatExists,
  addUserMessage,
  addAIMessage,
} from './chatOperations.js';
import { createLLMFunction } from './llmStreaming.js';
import { performAIEditing } from './aiEditing.js';
import { handleError } from './errorHandling.js';

const debug = false;

export const handleAIChatMessage =
  (shareDBDoc, options = {}) =>
  async (req, res) => {
    const { content, chatId } = req.body;

    if (debug) {
      console.log(
        '[handleAIChatMessage] content:',
        content,
        'chatId:',
        chatId,
      );
    }

    // Validate request
    if (!validateRequest(req, res)) {
      return;
    }

    try {
      // Ensure chats structure exists
      ensureChatsExist(shareDBDoc);
      ensureChatExists(shareDBDoc, chatId);

      // Add user message to chat
      addUserMessage(shareDBDoc, chatId, content);

      // Create LLM function for streaming
      const llmFunction = createLLMFunction(
        shareDBDoc,
        chatId,
      );

      // Perform AI editing
      const editResult = await performAIEditing({
        prompt: content,
        shareDBDoc,
        chatId,
        llmFunction,
      });

      // Add AI response message
      const aiResponse = addAIMessage(
        shareDBDoc,
        chatId,
        editResult.content,
      );

      // Handle credit deduction if callback is provided
      if (
        options.onCreditDeduction &&
        editResult.upstreamCostCents
      ) {
        try {
          await options.onCreditDeduction({
            upstreamCostCents: editResult.upstreamCostCents,
            provider: editResult.provider,
            inputTokens: editResult.inputTokens,
            outputTokens: editResult.outputTokens,
          });
        } catch (creditError) {
          console.error(
            'Credit deduction error:',
            creditError,
          );
          // Don't fail the request if credit deduction fails
        }
      }

      res.status(200).json(aiResponse);
    } catch (error) {
      handleError(shareDBDoc, chatId, error, res);
    }
  };
