import { validateRequest } from './validation.js';
import {
  ensureChatsExist,
  ensureChatExists,
  addUserMessage,
} from './chatOperations.js';
import { createLLMFunction } from './llmStreaming.js';
import { performAIEditing } from './aiEditing.js';
import { handleError } from './errorHandling.js';
import { createRunCodeFunction } from '../../runCode.js';

const DEBUG = false;

export const handleAIChatMessage =
  ({ shareDBDoc, localPresence, onCreditDeduction }) =>
  async (req, res) => {
    const { content, chatId } = req.body;

    if (DEBUG) {
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
      const llmFunction = createLLMFunction({
        shareDBDoc,
        localPresence,
        chatId,
      });

      // Create server-side runCode function using shared module
      const runCode = createRunCodeFunction(shareDBDoc);

      // Perform AI editing
      const editResult = await performAIEditing({
        prompt: content,
        shareDBDoc,
        chatId,
        llmFunction,
        runCode,
      });

      // Handle credit deduction if callback is provided
      if (
        onCreditDeduction &&
        editResult.upstreamCostCents
      ) {
        try {
          await onCreditDeduction({
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

      res.status(200).json('success');
    } catch (error) {
      handleError(shareDBDoc, chatId, error, res);
    }
  };
