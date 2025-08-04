import { VZAction, VZState } from '.';

export const toggleAIGhostCompletionsReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'toggle_ai_ghost_completions'
    ? { ...state, enableAIGhostCompletions: !state.enableAIGhostCompletions }
    : state;