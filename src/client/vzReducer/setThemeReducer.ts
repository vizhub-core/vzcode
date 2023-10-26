import { VZAction, VZState } from '.';

export const setThemeReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'set_theme'
    ? { ...state, theme: action.themeLabel }
    : state;
