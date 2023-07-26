import { useCallback, useMemo } from 'react';
import { FileId, Files } from '../../types';
import './style.scss';

// Supports adding the file's containing folder to the tab name
const fileNameSplit = (fileName) => {
  const split = fileName.split('/');
  if (split.length === 1) return split[split.length - 1];
  return split[split.length - 2] + '/' + split[split.length - 1];
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

  const tabName = useMemo(() => fileNameSplit(fileName), [fileName]);

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
