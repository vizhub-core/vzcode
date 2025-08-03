import { undoAIEdit } from './chatOperations.js';
import { handleError } from './errorHandling.js';
import { ShareDBDoc } from '../../types.js';
import { VizContent } from '@vizhub/viz-types';

const DEBUG = false;

/**
 * Validates incoming request data for AI chat undo
 */
const validateUndoRequest = (req, res) => {
  const { chatId, messageId } = req.body;

  if (!chatId || typeof chatId !== 'string') {
    res.status(400).json({
      error:
        'Invalid request: chatId is required and must be a string',
    });
    return false;
  }

  if (!messageId || typeof messageId !== 'string') {
    res.status(400).json({
      error:
        'Invalid request: messageId is required and must be a string',
    });
    return false;
  }

  return true;
};

export const handleAIChatUndo =
  ({
    shareDBDoc,
  }: {
    shareDBDoc: ShareDBDoc<VizContent>;
  }) =>
  async (req: any, res: any) => {
    const { chatId, messageId } = req.body;

    if (DEBUG) {
      console.log(
        '[handleAIChatUndo] chatId:',
        chatId,
        'messageId:',
        messageId,
        'shareDBDoc:',
        shareDBDoc,
      );
    }

    // Validate request
    if (!validateUndoRequest(req, res)) {
      return;
    }

    try {
      const chat = shareDBDoc.data.chats?.[chatId];
      if (!chat) {
        res.status(404).json({
          error: 'Chat not found',
        });
        return;
      }

      const message = chat.messages.find(
        (msg) => msg.id === messageId,
      );

      if (
        !message ||
        message.role !== 'assistant' ||
        !(message as any).beforeFiles
      ) {
        res.status(400).json({
          error: 'Invalid message for undo',
        });
        return;
      }

      // Perform the undo operation
      undoAIEdit(
        shareDBDoc,
        chatId,
        messageId,
        (message as any).beforeFiles,
      );

      res.status(200).json({ success: true });
    } catch (error) {
      if (DEBUG) {
        console.error('[handleAIChatUndo] Error:', error);
      }
      handleError(shareDBDoc, chatId, error, res);
    }
  };
