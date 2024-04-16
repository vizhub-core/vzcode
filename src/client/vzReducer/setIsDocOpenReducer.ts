import { VZAction, VZState } from '.';

export const setIsDocOpenReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'set_is_doc_open'
    ? { ...state, isDocOpen: action.value }
    : state;
