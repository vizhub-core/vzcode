import { useCallback, useEffect } from 'react';
import { FileId, Files } from '../../types';
import { Tab } from './Tab';
import './style.scss';

// Displays the list of tabs above the code editor.
export const TabList = ({
  files,
  tabList,
  activeFileId,
  setActiveFileId,
  closeTabs,
  createFile,
}: {
  files: Files;
  tabList: FileId[];
  activeFileId: FileId;
  setActiveFileId: (fileId: FileId) => void;
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
        tabList.map((fileId: FileId) => (
          <Tab
            key={fileId}
            fileId={fileId}
            isActive={fileId === activeFileId}
            setActiveFileId={setActiveFileId}
            closeTabs={closeTabs}
            fileName={files[fileId].name}
            createFile={createFile}
          />
        ))}
    </div>
  );
};
