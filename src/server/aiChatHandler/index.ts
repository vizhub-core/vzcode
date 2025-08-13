import { validateRequest } from './validation.js';
import {
  ensureChatsExist,
  ensureChatExists,
  addUserMessage,
  addDiffToAIMessage,
  setAIStatus,
} from './chatOperations.js';
import { createLLMFunction } from './llmStreaming.js';
import {
  performAIEditing,
  performAIChat,
} from './aiEditing.js';
import {
  handleError,
  handleBackgroundError,
} from './errorHandling.js';
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
    getCurrentCommitId,
    model,
    aiRequestOptions,
  }: {
    shareDBDoc: ShareDBDoc<VizContent>;
    createAIEditLocalPresence: () => any;
    onCreditDeduction?: any;
    getCurrentCommitId?: () => string | null;
    model?: string;
    aiRequestOptions?: any;
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

      // Return success immediately - AI generation continues in background
      res.status(200).json('success');

      // Set AI status to indicate generation is starting
      setAIStatus(shareDBDoc, chatId, 'generating');

      // Continue AI processing in background (don't await)
      processAIRequestAsync({
        shareDBDoc,
        chatId,
        content,
        mode,
        createAIEditLocalPresence,
        getCurrentCommitId,
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
  mode,
  createAIEditLocalPresence,
  getCurrentCommitId,
  model,
  aiRequestOptions,
  onCreditDeduction,
}: {
  shareDBDoc: ShareDBDoc<VizContent>;
  chatId: string;
  content: string;
  mode: string;
  createAIEditLocalPresence: () => any;
  getCurrentCommitId?: () => string | null;
  model?: string;
  aiRequestOptions?: any;
  onCreditDeduction?: any;
}) => {
  try {
    // Capture the current commit ID before making changes (for VizHub integration)
    const beforeCommitId = getCurrentCommitId
      ? getCurrentCommitId()
      : null;

    // Create LLM function for streaming
    const llmFunction = createLLMFunction({
      shareDBDoc,
      createAIEditLocalPresence,
      chatId,
      model,
      aiRequestOptions,
    });

    // Create server-side runCode function using shareDBDoc
    const submitOperation =
      createSubmitOperation(shareDBDoc);
    const runCode = createRunCodeFunction(submitOperation);

    // Perform AI editing or chat based on mode
    const editResult =
      mode === 'ask'
        ? await performAIChat({
            prompt: content,
            shareDBDoc,
            llmFunction,
            chatId,
            model,
            aiRequestOptions,
          })
        : await performAIEditing({
            prompt: content,
            shareDBDoc,
            llmFunction,
            runCode,
            chatId,
            model,
            aiRequestOptions,
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
        (editResult as any).beforeFiles, // Pass the beforeFiles snapshot for undo (legacy)
        beforeCommitId, // Pass the commit ID before AI changes (for VizHub integration)
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

    // Clear the AI status to indicate completion
    setAIStatus(shareDBDoc, chatId, undefined);
  } catch (error) {
    // Set error status and add error message to chat
    setAIStatus(shareDBDoc, chatId, 'error');
    handleBackgroundError(shareDBDoc, chatId, error);
  }
};
