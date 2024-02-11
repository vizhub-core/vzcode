import { VZAction, VZState } from '.';

export const setActiveFileLeftReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  if (action.type !== 'set_active_file_left') {
    return state;
  }

  let index = state.tabList.findIndex(
    (tab) => tab.fileId === state.activeFileId,
  );

  index -= 1;
  if (index < 0) {
    index = state.tabList.length - 1;
  }

  return {
    ...state,
    activeFileId: state.tabList[index].fileId,
  };
};

export const setActiveFileRightReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  if (action.type !== 'set_active_file_right') {
    return state;
  }

  let index = state.tabList.findIndex(
    (tab) => tab.fileId === state.activeFileId,
  );

  index += 1;
  if (index > state.tabList.length - 1) {
    index = 0;
  }

  return {
    ...state,
    activeFileId: state.tabList[index].fileId,
  };
};
