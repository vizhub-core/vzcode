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
    const index = newTabList.findIndex(
      (tabState) => tabState.fileId === newActiveFileId,
    );
    newActiveFileId = newTabList[index]
      ? newTabList[index].fileId
      : newTabList[index - 1]
      ? newTabList[index - 1].fileId
      : null;
  }

  return {
    ...state,
    tabList: newTabList,
    activeFileId: newActiveFileId,
  };
};
