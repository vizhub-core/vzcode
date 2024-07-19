import { VZAction, VZState } from '.';
import { Pane } from '../../types';
import { findPane } from './findPane';
import { updatePane } from './updatePane';

export const openTabReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  if (action.type !== 'open_tab') return state;

  const { pane, activePaneId } = state;
  const activePane: Pane = findPane(pane, activePaneId);

  if (activePane.type !== 'leafPane') {
    throw new Error(
      'closeTabsReducer: activePane is not a leafPane',
    );
  }

  // Check if the tab is already open and if it's transient.
  const existingTabIndex = activePane.tabList.findIndex(
    (tab) => tab.fileId === action.fileId,
  );
  const tabExists = existingTabIndex !== -1;
  const existingTabIsTransient =
    tabExists &&
    activePane.tabList[existingTabIndex].isTransient;

  // Find if there's any other transient tab.
  const transientTabIndex = activePane.tabList.findIndex(
    (tab) =>
      tab.isTransient && tab.fileId !== action.fileId,
  );

  // The new tab state.
  const newTabState: TabState = {
    fileId: action.fileId,
    isTransient: action.isTransient,
  };

  let newTabList: Array<TabState>;

  if (tabExists) {
    if (existingTabIsTransient) {
      newTabList = activePane.tabList.map((tabState) =>
        tabState.fileId === action.fileId
          ? newTabState
          : tabState,
      );
    } else {
      newTabList = [...activePane.tabList];
    }
  } else if (transientTabIndex !== -1) {
    newTabList = [...activePane.tabList];
    newTabList[transientTabIndex] = newTabState;
  } else {
    newTabList = [...activePane.tabList, newTabState];
  }

  return {
    ...state,
    pane: updatePane({
      pane,
      activePaneId,
      newTabList,
      newActiveFileId: action.fileId,
    }),

    // If the tab is persistent, the editor should focus on the next render.
    editorWantsFocus: !action.isTransient,
  };
};
