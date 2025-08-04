import { validateRequest } from './validation.js';
import {
  ensureChatsExist,
  ensureChatExists,
  addUserMessage,
  addDiffToAIMessage,
} from './chatOperations.js';
import { createLLMFunction } from './llmStreaming.js';
import {
  performAIEditing,
  performAIChat,
} from './aiEditing.js';
import { handleError } from './errorHandling.js';
import { createRunCodeFunction } from '../../runCode.js';
import { ShareDBDoc } from '../../types.js';
import { VizContent } from '@vizhub/viz-types';
import { createSubmitOperation } from '../../submitOperation.js';

const DEBUG = false;

export const handleAIChatMessage =
  ({
    shareDBDoc,
    createAIEditLocalPresence,
    onCreditDeduction,
  }: {
    shareDBDoc: ShareDBDoc<VizContent>;
    createAIEditLocalPresence: () => any;
    onCreditDeduction?: any;
  }) =>
  async (req: any, res: any) => {
    const { content, chatId, mode = 'edit' } = req.body;

    if (DEBUG) {
      console.log(
        '[handleAIChatMessage] content:',
        content,
        'chatId:',
        chatId,
        'shareDBDoc:',
        shareDBDoc,
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
        createAIEditLocalPresence,
        chatId,
      });

      // Create server-side runCode function using shareDBDoc
      const submitOperation =
        createSubmitOperation(shareDBDoc);
      const runCode =
        createRunCodeFunction(submitOperation);

      // Perform AI editing or chat based on mode
      const editResult =
        mode === 'ask'
          ? await performAIChat({
              prompt: content,
              shareDBDoc,
              llmFunction,
            })
          : await performAIEditing({
              prompt: content,
              shareDBDoc,
              llmFunction,
              runCode,
            });

      // Add diff data to the AI message if there are changes
      if (
        editResult.diffData &&
        Object.keys(editResult.diffData).length > 0
      ) {
        addDiffToAIMessage(
          shareDBDoc,
          chatId,
          editResult.diffData,
          (editResult as any).beforeFiles, // Pass the beforeFiles snapshot for undo (only available for edit mode)
        );
      }

      // Handle credit deduction if callback is provided
      if (
        onCreditDeduction &&
        (editResult as any).upstreamCostCents
      ) {
        try {
          await onCreditDeduction({
            upstreamCostCents: (editResult as any)
              .upstreamCostCents,
            provider: (editResult as any).provider,
            inputTokens: (editResult as any).inputTokens,
            outputTokens: (editResult as any).outputTokens,
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
