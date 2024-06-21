import { VZAction, VZState } from '.';

export const setIsSearchOpenReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'set_is_search_open'
    ? { ...state, isSearchOpen: action.value }
    : state;
