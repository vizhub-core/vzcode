import { VZAction, VZState } from '.';

export const toggleAutoFollowReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'toggle_auto_follow'
    ? {
        ...state,
        enableAutoFollow: !state.enableAutoFollow,
      }
    : state;
