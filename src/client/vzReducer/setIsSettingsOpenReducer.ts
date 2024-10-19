import { VZAction, VZState } from '.';

export const setIsSettingsOpenReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'set_is_settings_open'
    ? { ...state, isSettingsOpen: action.value }
    : state;
