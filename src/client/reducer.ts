import { FileId } from '../types';
import { diff } from './diff';
import { randomId } from '../randomId';
export const reducer = (state, action) => {
  switch (action.type) {
    // TODO phase this out

    // The ordered list of tabs.
    // TODO make this a URL param
    case 'set_tab_list': {
      return { ...state, tabList: action.tabList };
    }
    // The id of the currently open file tab.
    // TODO make this a URL param
    case 'set_active_fileId': {
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
        (fileId) => fileId === action.fileIdToRemove,
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
    case 'multi_close_tab': {
      let newTabList = [...state.tabList]; // Create a copy of the tabList array.
      let newActiveFileId: FileId = state.activeFileId;
      action.idsToDelete.forEach((id) => {
        const i = newTabList.findIndex(
          (fileId) => fileId === id,
        );
        if (i !== -1) {
          // Remove the tab from the tab list.
          newTabList = [
            ...newTabList.slice(0, i),
            ...newTabList.slice(i + 1),
          ];
          // If we are closing the active file,
          if (newActiveFileId === id) {
            // set the new active file to the next tab over,
            if (newTabList.length > 0) {
              newActiveFileId =
                i === 0 ? newTabList[i] : newTabList[i - 1];
            } else {
              // or clear out the active file if we've closed the last tab.
              newActiveFileId = null;
            }
          }
        }
      });
      return {
        ...state,
        tabList: newTabList,
        activeFileId: newActiveFileId,
      };
    }
    // A helper function to submit operations to the ShareDB document
    case 'submit_Operation': {
      //Used to submit Operations to the shareDB doc
      const next = action.next;
      const content = state.shareDBDoc.data;
      const op = diff(content, next(content));
      if (op && state.shareDBDoc) {
        state.shareDBDoc.submitOp(op);
      }
      return { ...state };
    }
    case 'set_Share_DB_Doc': {
      return {
        ...state,
        shareDBDoc: action.shareDBDoc,
      };
    }
    case 'delete_File': {
      state.submitOperation((document) => {
        const updatedFiles = { ...document.files };
        delete updatedFiles[action.fileId];
        return { ...document, files: updatedFiles };
      });
      state.closeTab(action.fileId);
      return {
        ...state,
      };
    }
    case 'delete_Directory': {
      let tabsToDelete: Array<FileId> = [];
      state.submitOperation((document) => {
        const updatedFiles = { ...document.files };
        for (const key in updatedFiles) {
          if (
            updatedFiles[key].name.includes(action.path)
          ) {
            tabsToDelete.push(key);
            delete updatedFiles[key];
          }
        }
        return { ...document, files: updatedFiles };
      });
      state.multiCloseTab(tabsToDelete);
      return { ...state };
    }
    case 'create_File': {
      const name = prompt('Enter new file name');
      if (name) {
        state.submitOperation((document) => ({
          ...document,
          files: {
            ...document.files,
            [randomId()]: { name, text: '' },
          },
        }));
      }
      return { ...state };
    }
    // Called when a file in the sidebar is renamed.
    case 'rename_File': {
      state.submitOperation((document) => ({
        ...document,
        files: {
          ...document.files,
          [action.fileId]: {
            ...document.files[action.fileId],
            name: action.newName,
          },
        },
      }));
      return { ...state };
    }
    //The current theme
    // TODO persist this in local storage
    case 'set_Theme': {
      return {
        ...state,
        theme: action.theme,
      };
    }
    case 'is_Settings_Open': {
      return {
        ...state,
        isSettingsOpen: action.isSettingsOpen,
      };
    }
  }
  throw Error('Unknown action: ' + action.type);
};
