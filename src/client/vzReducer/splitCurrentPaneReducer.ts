import { PaneId, Pane } from '../../types';
import { VZAction, VZState } from '.';
import { updatePane } from './updatePane';

export const splitCurrentPaneReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  // console.log('splitCurrentPaneReducer');
  if (action.type !== 'split_current_pane') {
    return state;
  }

  const activePaneId = state.activePaneId;

  const newLeafPane1: Pane = {
    id: `${activePaneId}-1`, // Generate unique IDs for new panes
    type: 'leafPane',
    tabList: [],
    activeFileId: null,
  };

  const newLeafPane2: Pane = {
    id: `${activePaneId}-2`,
    type: 'leafPane',
    tabList: [],
    activeFileId: null,
  };

  const newSplitPane: Pane = {
    id: activePaneId,
    type: 'splitPane',
    orientation: 'horizontal',
    children: [newLeafPane1, newLeafPane2],
  };

  const updatedPane = updatePane({
    pane: state.pane,
    activePaneId,
    newTabList: undefined,
    newActiveFileId: undefined,
  });

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
    updatedPane,
    activePaneId,
  );

  return {
    ...state,
    pane: finalPane,
    activePaneId: newLeafPane1.id,
  };
};
