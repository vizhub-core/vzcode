import { VZAction, VZState } from '.';

export const editorNoLongerWantsFocusReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'editor_no_longer_wants_focus'
    ? { ...state, editorWantsFocus: false }
    : state;
