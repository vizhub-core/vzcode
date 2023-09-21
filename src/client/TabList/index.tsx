import { useCallback, useMemo, useEffect } from 'react';
import { FileId, Files } from '../../types';
import './style.scss';

// Supports adding the file's containing folder to the tab name
const fileNameSplit = (fileName) => {
  const split = fileName.split('/');
  if (split.length === 1) return split[split.length - 1];
  return (
    split[split.length - 2] + '/' + split[split.length - 1]
  );
};

const Tab = ({
  fileId,
  isActive,
  setActiveFileId,
  closeTab,
  fileName,
}: {
  fileId: FileId;
  isActive: boolean;
  setActiveFileId: (fileId: FileId) => void;
  closeTab: (fileId: FileId) => void;
  fileName: string;
}) => {
  const handleCloseClick = useCallback(
    (event: React.MouseEvent) => {
      // Stop propagation so that the outer listener doesn't fire.
      event.stopPropagation();

      closeTab(fileId);
    },
    [closeTab, fileId],
  );

  const tabName = useMemo(
    () => fileNameSplit(fileName),
    [fileName],
  );

  return (
    <div
      className={isActive ? 'tab active' : 'tab'}
      onClick={() => {
        setActiveFileId(fileId);
      }}
    >
      {tabName}
      <div
        className={isActive ? 'bx bx-x tab-close' : ''}
        onClick={handleCloseClick}
      ></div>
    </div>
  );
};

// Displays the list of tabs above the code editor.
export const TabList = ({
  files,
  tabList,
  activeFileId,
  setActiveFileId,
  closeTab,
}: {
  files: Files;
  tabList: FileId[];
  activeFileId: FileId;
  setActiveFileId: (fileId: FileId) => void;
  closeTab: (fileId: FileId) => void;
}) => {
  //Create a function to perform the logic to delete the current tab
  const handleKeyPress = useCallback(
    (event: { altKey: boolean; key: string }) => {
      if (event.altKey == true) {
        if (event.key == 'w') {
          closeTab(activeFileId);
        }
      }
    },
    [closeTab, activeFileId],
  );
  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);
    // remove the event listener
    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyPress,
      );
    };
  }, [handleKeyPress]);
  //Checks the current state of the tablist and if it is an invalid file it removes it from the files array.
  for (let i = 0; i < tabList.length; i++) {
    if (files[tabList[i]] == undefined) {
      closeTab(tabList[i]);
      tabList = tabList.splice(i, i);
    }
  }
  return (
    <div className="vz-tab-list">
      {files &&
        tabList.map((fileId: FileId) => (
          <Tab
            key={fileId}
            fileId={fileId}
            isActive={fileId === activeFileId}
            setActiveFileId={setActiveFileId}
            closeTab={closeTab}
            fileName={files[fileId].name}
          />
        ))}
    </div>
  );
};
