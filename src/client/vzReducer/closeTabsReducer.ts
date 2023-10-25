import { TabState, VZAction, VZState } from '.';
import { FileId } from '../../types';

export const closeTabsReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  if (action.type !== 'close_tabs') {
    return state;
  }

  const newTabList: Array<TabState> = state.tabList.filter(
    (tabState) =>
      !action.fileIdsToClose.includes(tabState.fileId),
  );

  // If the active tab wasn't closed, keep it active.
  if (
    !action.fileIdsToClose.includes(state.activeFileId!)
  ) {
    return {
      ...state,
      tabList: newTabList,
    };
  }

  const originalIndex = state.tabList.findIndex(
    (tabState) => tabState.fileId === state.activeFileId,
  );

  let newActiveFileId: FileId | null = null;

  // Try getting the previous available tab first.
  for (let i = originalIndex - 1; i >= 0; i--) {
    if (
      !action.fileIdsToClose.includes(
        state.tabList[i].fileId,
      )
    ) {
      newActiveFileId = state.tabList[i].fileId;
      break;
    }
  }

  // If no previous tab available, get the next available one.
  if (!newActiveFileId) {
    for (
      let i = originalIndex + 1;
      i < state.tabList.length;
      i++
    ) {
      if (
        !action.fileIdsToClose.includes(
          state.tabList[i].fileId,
        )
      ) {
        newActiveFileId = state.tabList[i].fileId;
        break;
      }
    }
  }

  return {
    ...state,
    tabList: newTabList,
    activeFileId: newActiveFileId,
  };
};
