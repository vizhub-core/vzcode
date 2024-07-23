import { VZAction, VZState } from '.';

export const updatePresenceIndicatorReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  if (action.type === 'update_presence_indicator') {
    
    // True if there's already an entry for this user.
    const needsUpdate =
      state.sidebarPresenceIndicators.find(
        (d) =>
          d.username === action.presenceIndicator.username,
      );

    return {
      ...state,
      sidebarPresenceIndicators: needsUpdate
        ? state.sidebarPresenceIndicators.map((d) =>
            d.username === action.presenceIndicator.username
              ? action.presenceIndicator
              : d,
          )
        : [
            ...state.sidebarPresenceIndicators,
            action.presenceIndicator,
          ],
    };
  }
  return state;
};
