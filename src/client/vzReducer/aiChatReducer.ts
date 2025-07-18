import { VZState, VZAction } from '.';

export const setIsAIChatOpenReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  if (action.type === 'set_is_ai_chat_open') {
    return {
      ...state,
      isAIChatOpen: action.value,
      // When opening AI chat, close search
      isSearchOpen: action.value
        ? false
        : state.isSearchOpen,
    };
  }
  return state;
};

export const toggleAIChatFocusedReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  if (action.type === 'toggle_ai_chat_focused') {
    return {
      ...state,
      aiChatFocused: !state.aiChatFocused,
    };
  }
  return state;
};
