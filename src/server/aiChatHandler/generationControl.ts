import { VizChatId } from '@vizhub/viz-types';

const controllers = new Map<VizChatId, AbortController>();

export const registerController = (
  chatId: VizChatId,
  controller: AbortController,
) => {
  controllers.set(chatId, controller);
};

export const deregisterController = (chatId: VizChatId) => {
  controllers.delete(chatId);
};

export const stopGenerationNow = (chatId: VizChatId) => {
  const ctrl = controllers.get(chatId);
  if (ctrl) ctrl.abort(); // Triggers AbortError in your streaming loop
  controllers.delete(chatId);
};
