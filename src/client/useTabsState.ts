import { useCallback } from 'react';
import { FileId } from '../types';

// Encapsulates the state and logic for managing the list of open tabs.
export const useTabsState = (
  activeFileId: FileId,
  setActiveFileId: (fileId: FileId | null) => void,
  tabList: Array<FileId>,
  setTabList: (tabList: Array<FileId>) => void,
) => {
  // Called when a tab is closed.
  const closeTab = useCallback(
    (fileIdToRemove: FileId) => {
      const i = tabList.findIndex((fileId) => fileId === fileIdToRemove);

      // Support calling `closeTab` on a fileId that is not open,
      // such as when a file is deleted..
      if (i !== -1) {
        // Remove the tab from the tab list.
        const newTabList = [...tabList.slice(0, i), ...tabList.slice(i + 1)];
        setTabList(newTabList);

        // If we are closing the active file,
        if (activeFileId === fileIdToRemove) {
          // set the new active file to the next tab over,
          if (newTabList.length > 0) {
            setActiveFileId(i === 0 ? newTabList[i] : newTabList[i - 1]);
          } else {
            // or clear out the active file
            // if we've closed the last tab.
            setActiveFileId(null);
          }
        }
      }
    },
    [tabList, activeFileId],
  );

  // Called when a tab is opened.
  const openTab = useCallback(
    (fileId: FileId) => {
      setActiveFileId(fileId);
      if (!tabList.includes(fileId)) {
        setTabList([...tabList, fileId]);
      }
    },
    [tabList],
  );

  return { tabList, closeTab, openTab };
};
