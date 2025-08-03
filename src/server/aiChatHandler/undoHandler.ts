import { validateRequest } from './validation.js';
import { undoAIEdit } from './chatOperations.js';
import { handleError } from './errorHandling.js';
import { ShareDBDoc } from '../../types.js';
import { VizContent } from '@vizhub/viz-types';

const DEBUG = false;

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
    if (!validateRequest(req, res)) {
      return;
    }

    // Validate required parameters
    if (!chatId || !messageId) {
      res.status(400).json({
        error: 'Missing chatId or messageId',
      });
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
