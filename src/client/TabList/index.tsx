import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import type { TabState } from '../vzReducer';
import type { FileId, Files } from '../../types';
import { Tab } from './Tab';
import './style.scss';

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
  createFile: (fileName: string) => void;
}) => {
  const [draggedTabIndex, setDraggedTabIndex] = useState<
    number | null
  >(null);

  const handleDragStart = useCallback((index: number) => {
    setDraggedTabIndex(index);
  }, []);

  const handleDrop = useCallback(
    (index: number) => {
      if (
        draggedTabIndex !== null &&
        draggedTabIndex !== index
      ) {
        const newTabList = [...tabList];
        const [removed] = newTabList.splice(
          draggedTabIndex,
          1,
        );
        newTabList.splice(index, 0, removed);
        // Assuming you have a way to update the global state of tabList
        // updateTabList(newTabList);
      }
      setDraggedTabIndex(null);
    },
    [draggedTabIndex, tabList],
  );

  // Close the active tab on alt+w and create new file on alt+n
  const handleKeyPress = useCallback(
    (event: { altKey: boolean; key: string }) => {
      if (event.altKey) {
        if (event.key === 'w') {
          closeTabs([activeFileId]);
        }
        if (event.key === 'n') {
          createFile('UnnamedFile');
        }
      }
    },
    [closeTabs, createFile, activeFileId],
  );

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
        tabList.map((tabState, index) => (
          <Tab
            key={tabState.fileId}
            fileId={tabState.fileId}
            index={index}
            isActive={tabState.fileId === activeFileId}
            setActiveFileId={setActiveFileId}
            openTab={openTab}
            closeTabs={closeTabs}
            fileName={files[tabState.fileId].name}
            onDragStart={() => handleDragStart(index)}
            onDrop={() => handleDrop(index)}
          />
        ))}
    </div>
  );
};
