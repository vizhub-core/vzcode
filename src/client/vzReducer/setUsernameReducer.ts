import { VZAction, VZState } from '.';

export const setUsernameReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'set_username'
    ? { ...state, username: action.username }
    : state;
