import { VZAction, VZState } from '.';
import { Pane } from '../../types';
import { findPane } from './findPane';
import { updatePane } from './updatePane';

export const setActiveFileIdReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  if (action.type !== 'set_active_file_id') return state;

  const { pane, activePaneId } = state;
  const activePane: Pane = findPane(pane, activePaneId);

  if (activePane.type !== 'leafPane') {
    throw new Error(
      'closeTabsReducer: activePane is not a leafPane',
    );
  }
  return {
    ...state,
    pane: updatePane({
      pane,
      activePaneId,
      newActiveFileId: action.activeFileId,
    }),
  };
};
