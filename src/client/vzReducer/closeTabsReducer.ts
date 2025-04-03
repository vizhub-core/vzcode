import { VZAction, VZState } from '.';
import {
  VizFileId,
  Pane,
  PaneId,
  TabState,
} from '../../types';
import { findPane } from './findPane';
import { updatePane } from './updatePane';

export const closeTabsReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  if (action.type !== 'close_tabs') {
    return state;
  }

  const { pane, activePaneId } = state;
  const activePane: Pane = findPane(pane, activePaneId);

  if (activePane.type !== 'leafPane') {
    throw new Error(
      'closeTabsReducer: activePane is not a leafPane',
    );
  }

  // Derive the new tab list by filtering out the tabs to close.
  const newTabList: Array<TabState> =
    activePane.tabList.filter(
      (tabState) =>
        !action.fileIdsToClose.includes(tabState.fileId),
    );

  // If the active tab wasn't closed, keep it active.
  if (
    !action.fileIdsToClose.includes(
      activePane.activeFileId!,
    )
  ) {
    return {
      ...state,
      pane: updatePane({
        pane,
        activePaneId,
        newTabList,
      }),
    };
  }

  // Otherwise, we'll need to also find a new active tab.
  let newActiveFileId: VizFileId | null = null;

  // The question becomes: which tab should be active now?
  // - Either the tab to the left or right of the closed tab.

  // Try getting the previous available tab first.
  const originalIndex = activePane.tabList.findIndex(
    (tabState) =>
      tabState.fileId === activePane.activeFileId,
  );
  for (let i = originalIndex - 1; i >= 0; i--) {
    if (
      !action.fileIdsToClose.includes(
        activePane.tabList[i].fileId,
      )
    ) {
      newActiveFileId = activePane.tabList[i].fileId;
      break;
    }
  }

  // If no previous tab available, get the next available one.
  if (!newActiveFileId) {
    for (
      let i = originalIndex + 1;
      i < activePane.tabList.length;
      i++
    ) {
      if (
        !action.fileIdsToClose.includes(
          activePane.tabList[i].fileId,
        )
      ) {
        newActiveFileId = activePane.tabList[i].fileId;
        break;
      }
    }
  }

  return {
    ...state,
    pane: updatePane({
      pane,
      activePaneId,
      newTabList,
      newActiveFileId,
    }),
  };
};
