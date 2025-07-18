import { dateToTimestamp } from '@vizhub/viz-utils';
import { diff } from '../../client/diff.js';

/**
 * Ensures the chats object exists in the ShareDB document
 */
export const ensureChatsExist = (shareDBDoc) => {
  if (!shareDBDoc.data.chats) {
    const op = diff(shareDBDoc.data, {
      ...shareDBDoc.data,
      chats: {},
    });
    shareDBDoc.submitOp(op);
  }
};

/**
 * Ensures a specific chat exists in the ShareDB document
 */
export const ensureChatExists = (shareDBDoc, chatId) => {
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
};

/**
 * Adds a user message to the chat
 */
export const addUserMessage = (
  shareDBDoc,
  chatId,
  content,
) => {
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

  return userMessage;
};

/**
 * Updates AI status in the chat
 */
export const updateAIStatus = (
  shareDBDoc,
  chatId,
  status,
) => {
  const op = diff(shareDBDoc.data, {
    ...shareDBDoc.data,
    chats: {
      ...shareDBDoc.data.chats,
      [chatId]: {
        ...shareDBDoc.data.chats[chatId],
        aiStatus: status,
      },
    },
  });
  shareDBDoc.submitOp(op);
};

/**
 * Updates AI scratchpad content
 */
export const updateAIScratchpad = (
  shareDBDoc,
  chatId,
  content,
) => {
  const op = diff(shareDBDoc.data, {
    ...shareDBDoc.data,
    chats: {
      ...shareDBDoc.data.chats,
      [chatId]: {
        ...shareDBDoc.data.chats[chatId],
        aiScratchpad: content,
      },
    },
  });
  shareDBDoc.submitOp(op);
};

/**
 * Clears AI scratchpad and updates status
 */
export const clearAIScratchpadAndStatus = (
  shareDBDoc,
  chatId,
  status,
) => {
  const op = diff(shareDBDoc.data, {
    ...shareDBDoc.data,
    chats: {
      ...shareDBDoc.data.chats,
      [chatId]: {
        ...shareDBDoc.data.chats[chatId],
        aiScratchpad: undefined,
        aiStatus: status,
      },
    },
  });
  shareDBDoc.submitOp(op);
};

/**
 * Adds an AI response message to the chat
 */
export const addAIMessage = (
  shareDBDoc,
  chatId,
  content,
) => {
  const aiResponse = {
    id: Date.now() + 1,
    role: 'assistant',
    content: content || 'AI edit completed successfully.',
    timestamp: dateToTimestamp(new Date()),
  };

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

  return aiResponse;
};

/**
 * Updates files in the ShareDB document
 */
export const updateFiles = (shareDBDoc, files) => {
  const filesOp = diff(shareDBDoc.data, {
    ...shareDBDoc.data,
    files: files,
    isInteracting: true,
  });
  shareDBDoc.submitOp(filesOp);
};

/**
 * Sets isInteracting flag
 */
export const setIsInteracting = (
  shareDBDoc,
  isInteracting,
) => {
  const interactingOp = diff(
    { isInteracting: !isInteracting },
    { isInteracting: isInteracting },
  );
  shareDBDoc.submitOp(interactingOp);
};
