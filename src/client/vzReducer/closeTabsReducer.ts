import { VZAction, VZState } from '.';
import {
  FileId,
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

  console.group('closeTabsReducer Debugging Info');
  console.log('Current state:', state);
  console.log('Action received:', action);
  console.log('Tabs being closed:', action.fileIdsToClose);
  console.log('Resulting new tab list:', newTabList);

  // Handle edge case: no tabs left
  if (newTabList.length === 0) {
    console.warn('All tabs have been closed. Returning to default empty state.');
    console.groupEnd();
    return {
      ...state,
      pane: updatePane({
        pane,
        activePaneId,
        newTabList,
        newActiveFileId: null, // No active file since all tabs are closed
      }),
    };
  }

  // If the active tab wasn't closed, keep it active.
  if (
    !action.fileIdsToClose.includes(
      activePane.activeFileId!,
    )
  ) {
    console.log('Active tab remains unchanged:', activePane.activeFileId);
    console.groupEnd();
    return {
      ...state,
      pane: updatePane({
        pane,
        activePaneId,
        newTabList,
      }),
    };
  }

  // Otherwise, find a new active tab.
  let newActiveFileId: FileId | null = null;

  // Get previous tab
  const originalIndex = activePane.tabList.findIndex(
    (tabState) =>
      tabState.fileId === activePane.activeFileId,
  );

  console.log('Original active tab index:', originalIndex);

  for (let i = originalIndex - 1; i >= 0; i--) {
    if (
      !action.fileIdsToClose.includes(
        activePane.tabList[i].fileId,
      )
    ) {
      newActiveFileId = activePane.tabList[i].fileId;
      console.log('Previous tab selected as new active:', newActiveFileId);
      break;
    }
  }

  // Get next tab if no previous one available
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
        console.log('Next tab selected as new active:', newActiveFileId);
        break;
      }
    }
  }

  if (!newActiveFileId) {
    console.warn('No new active tab found. This could indicate all tabs were closed or a logic error.');
  }

  console.log('New active file ID:', newActiveFileId);

  // Trigger side effects (e.g., analytics tracking)
  triggerAnalytics('tab_close', {
    closedTabs: action.fileIdsToClose,
    remainingTabs: newTabList.map((tab) => tab.fileId),
    newActiveTab: newActiveFileId,
  });

  console.groupEnd();

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

// Mock function to demonstrate a side effect like analytics tracking
function triggerAnalytics(event: string, data: Record<string, any>): void {
  console.log(`Analytics Event: ${event}`, data);
}
