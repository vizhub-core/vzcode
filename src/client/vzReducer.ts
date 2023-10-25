import { FileId } from '../types';
import { ThemeLabel } from './themes';

// Representation of a tab.
export type TabState = {
  // `fileId`
  // The ID of the file that the tab represents.
  fileId: FileId;

  // `isTransient`
  // Represents whether the tab is temporary or persistent.
  //  * `true` if the tab is temporary, meaning its text
  //    appears as italic, and it will be automatically
  //    closed when the user switches to another file.
  //    If `true` and the tab is opened, the editor will not focus.
  //  * `false` if the tab is persistent, meaning its text
  //    appears as normal, and it will not be automatically
  //    closed when the user switches to another file.
  //    If `false` and the tab is opened, the editor will focus.
  isTransient: boolean;
};

export type VZState = {
  tabList: Array<TabState>;
  activeFileId: FileId | null;
  theme: ThemeLabel;
  isSettingsOpen: boolean;
};

export type VZAction =
  | { type: 'set_active_file_id'; activeFileId: FileId }
  | {
      type: 'open_tab';
      fileId: FileId;
      isTransient: boolean;
    }
  | { type: 'close_tab'; fileIdToRemove: FileId }
  | { type: 'close_tabs'; idsToDelete: Array<FileId> }
  | { type: 'set_theme'; themeLabel: ThemeLabel }
  | { type: 'set_is_settings_open'; value: boolean };

export const vzReducer = (
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
      // Is the tab already open?
      const tabIsOpen = state.tabList.some(
        (tab) => tab.fileId === action.fileId,
      );

      // The new tab state.
      const newTabState: TabState = {
        fileId: action.fileId,
        isTransient: action.isTransient,
      };
      // If the tab is not open, add it to
      // the end of the tab list.
      //
      // If the tab is already open, replace
      // it with the new tab state, which may
      // or may not change the `isTransient`
      // property.
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
    }
    case 'close_tab': {
      // The index of the tab to close.
      const i = state.tabList.findIndex(
        (tabState) =>
          tabState.fileId === action.fileIdToRemove,
      );

      // If the tab is open, remove it from the tab list.
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
                i === 0
                  ? newTabList[i].fileId
                  : newTabList[i - 1].fileId,
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

      // If the tab is not open, do nothing.
      return {
        ...state,
      };
    }
    case 'close_tabs': {
      const newTabList: Array<TabState> = [];
      for (const tabState of state.tabList) {
        if (!action.idsToDelete.includes(tabState.fileId)) {
          newTabList.push(tabState);
        }
      }

      let newActiveFileId: FileId | null =
        state.activeFileId;

      if (action.idsToDelete.includes(newActiveFileId)) {
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
