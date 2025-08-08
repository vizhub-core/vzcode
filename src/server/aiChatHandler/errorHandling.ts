import { dateToTimestamp } from '@vizhub/viz-utils';
import { diff } from '../../ot.js';

/**
 * Handles errors by adding an error message to the chat and clearing AI state
 */
export const handleError = (
  shareDBDoc,
  chatId,
  error,
  res,
) => {
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

  if (res) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Handles errors in background processing (without HTTP response)
 */
export const handleBackgroundError = (
  shareDBDoc,
  chatId,
  error,
) => {
  handleError(shareDBDoc, chatId, error, null);
};
