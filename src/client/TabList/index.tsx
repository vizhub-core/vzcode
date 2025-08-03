import { useContext } from 'react';
import { TabState } from '../../types';
import { VZCodeContext } from '../VZCodeContext';
import { Tab } from './Tab';
import { SplitEditorSVG } from '../Icons';
import './style.scss';

// Displays the list of tabs above the code editor.
export const TabList = ({ activeFileId, tabList }) => {
  const { files, setActiveFileId, openTab, closeTabs, splitCurrentPane } =
    useContext(VZCodeContext);

  return (
    <div className="vz-tab-list">
      {files &&
        tabList
          // Handles the case that the tab list references a file that was deleted.
          .filter(
            (tabState: TabState) =>
              tabState.fileId in files,
          )
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
      <button 
        className="vz-split-pane-button"
        onClick={splitCurrentPane}
        title="Split editor right"
      >
        <SplitEditorSVG />
      </button>
    </div>
  );
};
