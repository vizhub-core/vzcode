import { useContext } from 'react';
import { VZCodeContext } from '../VZCodeContext';
import { Tab } from './Tab';
import './style.scss';
import { TabState } from '../../types';

// Displays the list of tabs above the code editor.
export const TabList = () => {
  const {
    files,
    activeFileId,
    setActiveFileId,
    tabList,
    openTab,
    closeTabs,
  } = useContext(VZCodeContext);

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
