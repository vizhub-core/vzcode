import { VZAction, VZState } from '.';
import { Pane } from '../../types';
import { findPane } from './findPane';
import { updatePane } from './updatePane';

export const setActiveFileLeftReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  if (action.type !== 'set_active_file_left') {
    return state;
  }

  const { pane, activePaneId } = state;
  const activePane: Pane = findPane(pane, activePaneId);

  if (activePane.type !== 'leafPane') {
    throw new Error(
      'closeTabsReducer: activePane is not a leafPane',
    );
  }

  let index = activePane.tabList.findIndex(
    (tab) => tab.fileId === activePane.activeFileId,
  );

  index -= 1;
  if (index < 0) {
    index = activePane.tabList.length - 1;
  }

  return {
    ...state,
    pane: updatePane({
      pane,
      activePaneId,
      newActiveFileId: activePane.tabList[index].fileId,
    }),
  };
};

export const setActiveFileRightReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  if (action.type !== 'set_active_file_right') {
    return state;
  }

  const { pane, activePaneId } = state;
  const activePane: Pane = findPane(pane, activePaneId);

  if (activePane.type !== 'leafPane') {
    throw new Error(
      'closeTabsReducer: activePane is not a leafPane',
    );
  }

  let index = activePane.tabList.findIndex(
    (tab) => tab.fileId === activePane.activeFileId,
  );

  index += 1;
  if (index > activePane.tabList.length - 1) {
    index = 0;
  }

  return {
    ...state,
    pane: updatePane({
      pane,
      activePaneId,
      newActiveFileId: activePane.tabList[index].fileId,
    }),
  };
};
