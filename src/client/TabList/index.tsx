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
  createFile: (fileName: string) => void;
}) => {
  return (
    <div className="vz-tab-list">
      {files &&
        tabList
          // Handles the case that the tab list references a file that was deleted.
          .filter((tabState) => tabState.fileId in files)
          .map((tabState: TabState) => (
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
