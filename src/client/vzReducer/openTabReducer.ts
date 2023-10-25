import { TabState, VZAction, VZState } from '.';

export const openTabReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  if (action.type !== 'open_tab') {
    return state;
  }
  // Is the tab already open?
  const tabIsOpen = state.tabList.some(
    (tab) => tab.fileId === action.fileId,
  );

  // The new tab state.
  const newTabState: TabState = {
    fileId: action.fileId,
    isTransient: action.isTransient,
  };

  return {
    ...state,
    activeFileId: action.fileId,
    tabList: !tabIsOpen
      ? [...state.tabList, newTabState]
      : state.tabList.map((tabState) =>
          tabState.fileId === action.fileId
            ? newTabState
            : tabState,
        ),
  };
};
