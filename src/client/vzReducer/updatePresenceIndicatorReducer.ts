import { VZAction, VZState } from '.';

export const updatePresenceIndicatorReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  if (action.type === 'update_presence_indicator') {
    const { username, userColor } = action.presenceIndicator;

    const needsUpdate = state.sidebarPresenceIndicators.find(
      (d) => d.username === username,
    );

    return {
      ...state,
      sidebarPresenceIndicators: needsUpdate
        ? state.sidebarPresenceIndicators.map((d) =>
            d.username === username
              ? { ...d, userColor: userColor || '#FFFFFF' } // Ensure userColor is updated
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
