import { PaneId, Pane } from '../../types';
import { VZAction, VZState } from '.';
import { updatePane } from './updatePane';
import { findPane } from './findPane';

export const splitCurrentPaneReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  // console.log('splitCurrentPaneReducer');
  if (action.type !== 'split_current_pane') {
    return state;
  }

  const activePaneId = state.activePaneId;
  const currentPane = findPane(state.pane, activePaneId);

  if (!currentPane || currentPane.type !== 'leafPane') {
    return state; // Can only split leaf panes
  }

  // Create two new leaf panes - the first one gets the current tabs
  const newLeafPane1: Pane = {
    id: `${activePaneId}-1`, // Generate unique IDs for new panes
    type: 'leafPane',
    tabList: currentPane.tabList, // Transfer current tabs to first pane
    activeFileId: currentPane.activeFileId, // Transfer active file
  };

  const newLeafPane2: Pane = {
    id: `${activePaneId}-2`,
    type: 'leafPane',
    tabList: [],
    activeFileId: null,
  };

  // Create the new split pane to replace the current pane
  const newSplitPane: Pane = {
    id: activePaneId,
    type: 'splitPane',
    orientation: 'horizontal',
    children: [newLeafPane1, newLeafPane2],
  };

  // Helper function to recursively update the pane tree
  const updateSplitPane = (pane: Pane, id: PaneId): Pane =>
    pane.id === id
      ? newSplitPane
      : pane.type === 'splitPane'
        ? {
            ...pane,
            children: pane.children.map((child) =>
              updateSplitPane(child, id),
            ),
          }
        : pane;

  const finalPane = updateSplitPane(
    state.pane,
    activePaneId,
  );

  return {
    ...state,
    pane: finalPane,
    activePaneId: newLeafPane1.id, // Keep the first pane as active
  };
};
