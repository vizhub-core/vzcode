import { TabState, VZAction, VZState } from '.';

export const initializeTabsReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  if (action.type !== 'initialize_tabs') return state;
  let { tabList, activeFileId } = action;
  if (activeFileId === null && tabList.length > 0) {
    activeFileId = tabList[0].fileId;
  }
  // TODO check that file ids are valid

  return {
    ...state,
    activeFileId,
    tabList,

    editorWantsFocus: activeFileId !== null,
  };
};
