import { ShareDBDoc } from '../../types.js';
import { VizChatId } from '@vizhub/viz-types';
import { diff } from '../../ot.js';

export const setStopRequested = (shareDBDoc: ShareDBDoc<any>, chatId: VizChatId, value: boolean) => {
  // Store under your existing chat state, e.g. data.chats[chatId].stopRequested = value
  const currentStopRequested = !!shareDBDoc.data.chats?.[chatId]?.stopRequested;
  if (currentStopRequested !== value) {
    const op = diff(shareDBDoc.data, {
      ...shareDBDoc.data,
      chats: {
        ...shareDBDoc.data.chats,
        [chatId]: {
          ...shareDBDoc.data.chats[chatId],
          stopRequested: value
        }
      }
    });
    shareDBDoc.submitOp(op);
  }
};

export const isStopRequested = (shareDBDoc: ShareDBDoc<any>, chatId: VizChatId) =>
  !!shareDBDoc.data.chats?.[chatId]?.stopRequested;