import { FileId } from '../types';
import { ThemeLabel } from './themes';

export type VZState = {
  tabList: Array<FileId>;
  activeFileId: FileId | null;
  theme: ThemeLabel;
  isSettingsOpen: boolean;
};

export type VZAction =
  | { type: 'set_active_file_id'; activeFileId: FileId }
  | { type: 'open_tab'; fileId: FileId }
  | { type: 'close_tab'; fileIdToRemove: FileId }
  | { type: 'close_tabs'; idsToDelete: Array<FileId> }
  | { type: 'set_theme'; themeLabel: ThemeLabel }
  | { type: 'set_is_settings_open'; value: boolean };

export const reducer = (
  state: VZState,
  action: VZAction,
) => {
  switch (action.type) {
    case 'set_active_file_id': {
      return {
        ...state,
        activeFileId: action.activeFileId,
      };
    }
    case 'open_tab': {
      if (!state.tabList.includes(action.fileId)) {
        return {
          ...state,
          activeFileId: action.fileId,
          tabList: [...state.tabList, action.fileId],
        };
      } else {
        return {
          ...state,
          activeFileId: action.fileId,
        };
      }
    }
    case 'close_tab': {
      const i = state.tabList.findIndex(
        (fileId: FileId) =>
          fileId === action.fileIdToRemove,
      );
      if (i != -1) {
        const newTabList = [
          ...state.tabList.slice(0, i),
          ...state.tabList.slice(i + 1),
        ];
        if (state.activeFileId === action.fileIdToRemove) {
          // set the new active file to the next tab over,
          if (newTabList.length > 0) {
            return {
              ...state,
              activeFileId:
                i === 0 ? newTabList[i] : newTabList[i - 1],
              tabList: newTabList,
            };
          } else {
            // or clear out the active file
            // if we've closed the last tab.
            return {
              ...state,
              activeFileId: null,
              tabList: newTabList,
            };
          }
        }
        return {
          ...state,
          tabList: newTabList,
        };
      }
      return {
        ...state,
      };
    }
    case 'close_tabs': {
      const newTabList = state.tabList.filter(
        (fileId: FileId) =>
          !action.idsToDelete.includes(fileId),
      );

      let newActiveFileId: FileId | null =
        state.activeFileId;

      if (action.idsToDelete.includes(newActiveFileId)) {
        const index =
          state.tabList.indexOf(newActiveFileId);
        newActiveFileId = newTabList[index]
          ? newTabList[index]
          : newTabList[index - 1] || null;
      }

      return {
        ...state,
        tabList: newTabList,
        activeFileId: newActiveFileId,
      };
    }
    case 'set_theme': {
      return {
        ...state,
        theme: action.themeLabel,
      };
    }
    case 'set_is_settings_open': {
      return {
        ...state,
        isSettingsOpen: action.value,
      };
    }
  }
};
