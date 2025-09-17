import { validateRequest } from './validation.js';
import {
  ensureChatsExist,
  ensureChatExists,
  addUserMessage,
  setAIStatus,
} from './chatOperations.js';
import { createLLMFunction } from './llmStreaming.js';
import { performAIEditing } from './aiEditing.js';
import {
  handleError,
  handleBackgroundError,
} from './errorHandling.js';
import { createRunCodeFunction } from '../../runCode.js';
import { ShareDBDoc } from '../../types.js';
import { VizContent } from '@vizhub/viz-types';
import { createSubmitOperation } from '../../submitOperation.js';
import { getGenerationMetadata } from 'editcodewithai';

const DEBUG = false;

export const handleAIChatMessage =
  ({
    shareDBDoc,
    onCreditDeduction,
    model,
    aiRequestOptions,
  }: {
    shareDBDoc: ShareDBDoc<VizContent>;
    onCreditDeduction?: any;
    model?: string;
    aiRequestOptions?: any;
  }) =>
  async (req: any, res: any) => {
    const { content, chatId } = req.body;

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

      // Return success immediately - AI generation continues in background
      res.status(200).json('success');

      // Set initial AI status to indicate request analysis is starting
      setAIStatus(
        shareDBDoc,
        chatId,
        'Analyzing request...',
      );

      // Continue AI processing in background (don't await)
      processAIRequestAsync({
        shareDBDoc,
        chatId,
        content,
        model,
        aiRequestOptions,
        onCreditDeduction,
      }).catch((error) => {
        console.error(
          'Background AI processing error:',
          error,
        );
        // Handle error without HTTP response
        handleBackgroundError(shareDBDoc, chatId, error);
      });
    } catch (error) {
      handleError(shareDBDoc, chatId, error, res);
    }
  };

/**
 * Processes the AI request asynchronously in the background
 */
const processAIRequestAsync = async ({
  shareDBDoc,
  chatId,
  content,
  model,
  aiRequestOptions,
  onCreditDeduction,
}: {
  shareDBDoc: ShareDBDoc<VizContent>;
  chatId: string;
  content: string;
  model?: string;
  aiRequestOptions?: any;
  onCreditDeduction?: any;
}) => {
  try {
    // Create LLM function for streaming
    const llmFunction = createLLMFunction({
      shareDBDoc,
      chatId,
      model,
      aiRequestOptions,
    });

    // Create server-side runCode function using shareDBDoc
    const submitOperation =
      createSubmitOperation(shareDBDoc);
    const runCode = createRunCodeFunction(submitOperation);

    // Perform AI editing or chat based on mode
    const editResult = await performAIEditing({
      prompt: content,
      shareDBDoc,
      llmFunction,
      runCode,
    });

    // Handle credit deduction if callback is provided
    if (onCreditDeduction && editResult.generationId) {
      try {
        await onCreditDeduction(
          await getGenerationMetadata({
            apiKey: process.env.VZCODE_EDIT_WITH_AI_API_KEY,
            generationId: editResult.generationId,
          }),
        );
      } catch (creditError) {
        console.error(
          'Credit deduction error:',
          creditError,
        );
        // Don't fail the request if credit deduction fails
      }
    }

    // Clear the AI status to indicate completion
    setAIStatus(shareDBDoc, chatId, undefined);
  } catch (error) {
    // Set error status and add error message to chat
    setAIStatus(shareDBDoc, chatId, 'error');
    handleBackgroundError(shareDBDoc, chatId, error);
  }
};
