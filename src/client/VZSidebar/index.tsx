import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  FileId,
  FileTree,
  FileTreeFile,
  Presence,
  PresenceId,
  PresenceIndicator,
} from '../../types';
import { Tooltip, OverlayTrigger } from '../bootstrap';
import { Search } from './Search';
import { getFileTree } from '../getFileTree';
import { sortFileTree } from '../sortFileTree';
import { SplitPaneResizeContext } from '../SplitPaneResizeContext';
import {
  FolderSVG,
  SearchSVG,
  BugSVG,
  GearSVG,
  NewSVG,
  FileSVG,
  QuestionMarkSVG,
  PinSVG,
  SunSVG,
  MoonSVG,
  RecentSVG,
} from '../Icons';
import { VZCodeContext } from '../VZCodeContext';
import { Listing } from './Listing';
import { useDragAndDrop } from './useDragAndDrop';
import './styles.scss';

const enableConnectionStatus = true;

export const VZSidebar = ({
  createFileTooltipText = (
    <>
      <strong>New file</strong>
      <div>(Alt + N or Ctrl + Shift + N)</div>
    </>
  ),
  createDirTooltipText = (
    <div>
      <strong>New Directory</strong>
      <div>(Ctrl + Shift + D)</div>
    </div>
  ),
  openSettingsTooltipText = (
    <div>
      <strong>Open Settings</strong>
      <div>(Ctrl + Shift + S or Ctrl + ,)</div>
    </div>
  ),
  openKeyboardShortcuts = (
    <div>
      <strong>Keyboard Shortcuts</strong>
      <div>(Ctrl + Shift + K)</div>
    </div>
  ),
  reportBugTooltipText = (
    <div>
      <strong>Report Bug</strong>
    </div>
  ),
  searchToolTipText = (
    <div>
      <strong>Search</strong>
      <div>(Ctrl + Shift + F)</div>
    </div>
  ),
  filesToolTipText = (
    <div>
      <strong>Files</strong>
      <div>(Ctrl + Shift + E)</div>
    </div>
  ),
  enableAutoFollowTooltipText = (
    <div>
      <strong>Enable Auto Follow</strong>
      <div>(Ctrl + Shift + A)</div>
    </div>
  ),
  disableAutoFollowTooltipText = (
    <div>
      <strong>Disable Auto Follow</strong>
      <div>(Ctrl + Shift + A)</div>
    </div>
  ),
  recentFilesTooltipText = (
    <div>
      <strong>Recent Files</strong>
    </div>
  ),
  toggleThemeTooltipText = (
    <div>
      <strong>Toggle Theme</strong>
    </div>
  ),
}: {
  createFileTooltipText?: React.ReactNode;
  createDirTooltipText?: React.ReactNode;
  openSettingsTooltipText?: React.ReactNode;
  reportBugTooltipText?: React.ReactNode;
  openKeyboardShortcuts?: React.ReactNode;
  searchToolTipText?: React.ReactNode;
  filesToolTipText?: React.ReactNode;
  enableAutoFollowTooltipText?: React.ReactNode;
  disableAutoFollowTooltipText?: React.ReactNode;
  recentFilesTooltipText?: React.ReactNode;
  toggleThemeTooltipText?: React.ReactNode;
}) => {
  const {
    files,
    openTab,
    setIsSettingsOpen,
    setIsDocOpen,
    isSearchOpen,
    setIsSearchOpen,
    handleOpenCreateFileModal,
    handleOpenCreateDirModal,
    connected,
    sidebarRef,
    enableAutoFollow,
    toggleAutoFollow,
    docPresence,
    updatePresenceIndicator,
    sidebarPresenceIndicators,
    recentFiles,
    setRecentFiles,
    theme,
    toggleTheme,
  } = useContext(VZCodeContext);

  const fileTree = useMemo(
    () => (files ? sortFileTree(getFileTree(files)) : null),
    [files],
  );

  const handleFileClick = useCallback(
    (fileId: FileId) => {
      openTab({ fileId, isTransient: true });
      setRecentFiles((prev) => [...new Set([fileId, ...prev])]);
    },
    [openTab, setRecentFiles],
  );

  const handleFileDoubleClick = useCallback(
    (fileId: FileId) => {
      openTab({ fileId, isTransient: false });
      setRecentFiles((prev) => [...new Set([fileId, ...prev])]);
    },
    [openTab, setRecentFiles],
  );

  const {
    isDragOver,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop();

  useEffect(() => {
    if (docPresence) {
      const handleReceive = (
        presenceId: PresenceId,
        update: Presence,
      ) => {
        const presenceIndicator: PresenceIndicator = {
          username: update.username,
          fileId: update.start[1] as FileId,
        };
        updatePresenceIndicator(presenceIndicator);
      };

      docPresence.on('receive', handleReceive);
      return () => {
        docPresence.off('receive', handleReceive);
      };
    }
  }, [docPresence]);

  const attemptReconnect = useCallback(() => {
    if (!connected) {
      console.log('Attempting to reconnect...');
      // Reconnection logic here
    }
  }, [connected]);

  useEffect(() => {
    const interval = setInterval(() => {
      attemptReconnect();
    }, 5000);

    return () => clearInterval(interval);
  }, [attemptReconnect]);

  return (
    <div
      className="vz-sidebar"
      style={{ width: sidebarWidth + 'px' }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="full-box" ref={sidebarRef} tabIndex={-1}>
        <div className="sidebar-section-buttons">
          {/* Other buttons */}
          
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id="recent-files-tooltip">
                {recentFilesTooltipText}
              </Tooltip>
            }
          >
            <i
              id="recent-files-icon"
              className="icon-button icon-button-dark"
            >
              <RecentSVG />
            </i>
          </OverlayTrigger>

          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id="toggle-theme-tooltip">
                {toggleThemeTooltipText}
              </Tooltip>
            }
          >
            <i
              id="theme-toggle-icon"
              className="icon-button icon-button-dark"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <SunSVG /> : <MoonSVG />}
            </i>
          </OverlayTrigger>
        </div>
        
        {/* Main Sidebar Logic */}
      </div>
      
      {enableConnectionStatus && (
        <div className="connection-status">
          {connected ? 'Connected' : 'Connection Lost'}
          <div className="connection">
            <div
              className={`connection-status-indicator ${
                connected ? 'connected' : 'disconnected'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
