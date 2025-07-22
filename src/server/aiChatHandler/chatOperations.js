import { dateToTimestamp } from '@vizhub/viz-utils';
import { diff } from '../../client/diff.js';
import { randomId } from '../../randomId.js';
import { textUnicode } from '../../ot.js';

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

/**
 * Finds a file ID by searching for a matching file name
 */
export const resolveFileId = (fileName, shareDBDoc) => {
  const files = shareDBDoc.data.files;

  // Search through all files to find matching name
  for (const [fileId, file] of Object.entries(files)) {
    if (file.name === fileName) {
      return fileId;
    }
  }

  // If file doesn't exist, return null
  return null;
};

/**
 * Creates a new file with a random ID
 */
export const createNewFile = (shareDBDoc, fileName) => {
  // Generate a new random file ID
  const newFileId = randomId();

  const op = diff(shareDBDoc.data, {
    ...shareDBDoc.data,
    files: {
      ...shareDBDoc.data.files,
      [newFileId]: {
        name: fileName,
        text: '',
      },
    },
  });

  shareDBDoc.submitOp(op);
  return newFileId;
};

/**
 * Ensures a file exists, creating it if necessary
 */
export const ensureFileExists = (shareDBDoc, fileName) => {
  let fileId = resolveFileId(fileName, shareDBDoc);

  if (!fileId) {
    // File doesn't exist, create it
    fileId = createNewFile(shareDBDoc, fileName);
  }

  return fileId;
};

/**
 * Clears the content of a file
 */
export const clearFileContent = (shareDBDoc, fileId) => {
  const currentFile = shareDBDoc.data.files[fileId];
  if (currentFile && currentFile.text) {
    // Clear the file content
    const op = diff(shareDBDoc.data, {
      ...shareDBDoc.data,
      files: {
        ...shareDBDoc.data.files,
        [fileId]: {
          ...currentFile,
          text: '',
        },
      },
    });
    shareDBDoc.submitOp(op);
  }
};

/**
 * Appends a line to a file using OT operations
 */
export const appendLineToFile = (
  shareDBDoc,
  fileId,
  line,
) => {
  const currentFile = shareDBDoc.data.files[fileId];
  const currentContent = currentFile?.text || '';
  const newContent = currentContent + line + '\n';

  // Create the new file state
  const newFileState = {
    ...currentFile,
    text: newContent,
  };

  // Generate OT operation using the diff utility
  const op = diff(shareDBDoc.data, {
    ...shareDBDoc.data,
    files: {
      ...shareDBDoc.data.files,
      [fileId]: newFileState,
    },
  });

  shareDBDoc.submitOp(op);
};
