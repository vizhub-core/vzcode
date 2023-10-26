import { useCallback, useEffect } from 'react';
import type { TabState } from '../vzReducer';
import type { FileId, Files } from '../../types';
import { Tab } from './Tab';
import './style.scss';

// Displays the list of tabs above the code editor.
export const TabList = ({
  files,
  tabList,
  activeFileId,
  setActiveFileId,
  openTab,
  closeTabs,
  createFile,
}: {
  files: Files;
  tabList: Array<TabState>;
  activeFileId: FileId;
  setActiveFileId: (fileId: FileId) => void;
  openTab: (tabState: TabState) => void;
  closeTabs: (fileIds: FileId[]) => void;
  createFile: () => void;
}) => {
  // Close the active tab on alt+w
  const handleKeyPress = useCallback(
    (event: { altKey: boolean; key: string }) => {
      if (event.altKey == true) {
        if (event.key == 'w') {
          closeTabs([activeFileId]);
        }
        if (event.key == 'n') {
          createFile();
        }
      }
    },
    [createFile, closeTabs, activeFileId],
  );

  // Add the global keydown event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyPress,
      );
    };
  }, [handleKeyPress]);

  return (
    <div className="vz-tab-list">
      {files &&
        tabList.map((tabState: TabState) => (
          <Tab
            key={tabState.fileId}
            fileId={tabState.fileId}
            isTransient={tabState.isTransient}
            isActive={tabState.fileId === activeFileId}
            setActiveFileId={setActiveFileId}
            openTab={openTab}
            closeTabs={closeTabs}
            fileName={files[tabState.fileId].name}
          />
        ))}
    </div>
  );
};
