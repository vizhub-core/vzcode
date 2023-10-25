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

  let newActiveFileId: FileId | null = state.activeFileId;

  if (action.fileIdsToClose.includes(newActiveFileId)) {
    const originalIndex = state.tabList.findIndex(
      (tabState) => tabState.fileId === newActiveFileId,
    );

    newActiveFileId =
      originalIndex > 0
        ? state.tabList[originalIndex - 1].fileId
        : newTabList[0]
        ? newTabList[0].fileId
        : null;
  }

  return {
    ...state,
    tabList: newTabList,
    activeFileId: newActiveFileId,
  };
};
