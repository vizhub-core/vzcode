import { VZAction, VZState } from '.';

export const setActiveFileIdReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'set_active_file_id'
    ? { ...state, activeFileId: action.activeFileId }
    : state;
