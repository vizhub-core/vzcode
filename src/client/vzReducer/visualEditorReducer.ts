import { VZAction, VZState } from '.';

export const setIsVisualEditorOpenReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'set_is_visual_editor_open'
    ? { ...state, isVisualEditorOpen: action.value }
    : state;