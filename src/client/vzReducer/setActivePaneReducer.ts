import { VZAction, VZState } from '.';
import { findPane } from './findPane';

export const setActivePaneReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  if (action.type !== 'set_active_pane') {
    return state;
  }

  const { paneId } = action;

  // Check if the pane exists and is a leaf pane
  const pane = findPane(state.pane, paneId);
  if (!pane || pane.type !== 'leafPane') {
    return state;
  }

  return {
    ...state,
    activePaneId: paneId,
  };
};
