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
} from '../Icons';
import { VZCodeContext } from '../VZCodeContext';
import { Listing } from './Listing';
import { useDragAndDrop } from './useDragAndDrop';
import './styles.scss';

// TODO turn this UI back on when we are actually detecting
// the connection status.
// See https://github.com/vizhub-core/vzcode/issues/456
const enableConnectionStatus = true;

export const VZSidebar = ({
  createFileTooltipText = (
    <>
      <strong>New file</strong>
      {/* TODO verify that Ctrl + Shift + N works - does not work in Linux */}
      <div>(Alt + N or Ctrl + Shift + N)</div>
    </>
  ),
  createDirTooltipText = (
    <div>
      <strong>New Directory</strong>
      {/* TODO consider Alt+D, as Ctrl + Shift + D does not work in Linux */}
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
      {/* TODO get this keyboard shortcut working? */}
      {/* <div>(Ctrl + Shift + B)</div> */}
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
      {/* TODO consider Alt+A, this breaks in Linux */}
      <div>(Ctrl + Shift + A)</div>
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
  } = useContext(VZCodeContext);

  const fileTree = useMemo(
    () => (files ? sortFileTree(getFileTree(files)) : null),
    [files],
  );

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null); // Track currently focused item
  const fileRefs = useMemo(() => [], []); // Array of refs to focusable file items

  // Custom function to handle keyboard navigation in the sidebar
  const handleSidebarKeyDown = (event: React.KeyboardEvent) => {
    if (!fileTree || !fileTree.children) return; // Exit if no files are available
    const filesArray = fileTree.children.filter(
      (entity): entity is FileTreeFile => 'fileId' in entity
    ); // Filter out files only

    switch (event.key) {
      case 'ArrowUp':
        if (focusedIndex !== null && focusedIndex > 0) {
          const newIndex = Math.max(focusedIndex - 1, 0);
          setFocusedIndex(newIndex);
          fileRefs[newIndex]?.focus(); // Focus the new element
        }
        event.preventDefault();
        break;
      case 'ArrowDown':
        if (focusedIndex !== null && focusedIndex < filesArray.length - 1) {
          const newIndex = Math.min(focusedIndex + 1, filesArray.length - 1);
          setFocusedIndex(newIndex);
          fileRefs[newIndex]?.focus(); // Focus the new element
        } else if (filesArray.length > 0) {
          setFocusedIndex(0);
          fileRefs[0]?.focus(); // Focus the first element
        }
        event.preventDefault();
        break;
      case 'Enter':
        if (focusedIndex !== null) {
          const fileId = filesArray[focusedIndex].fileId;
          openTab({ fileId, isTransient: false });
        }
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  const handleFileFocusShortcut = useCallback(() => {
    if (fileTree && fileTree.children.length > 0) {
      const { fileId } = fileTree.children[0] as FileTreeFile;
      openTab({ fileId, isTransient: false });
    }
  }, [fileTree, openTab]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === '1') {
        event.preventDefault();
        handleFileFocusShortcut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleFileFocusShortcut]);

  const handleQuestionMarkClick = useCallback(() => {
    setIsDocOpen(true);
  }, []);
  
  const handleSettingsClick = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const { sidebarWidth } = useContext(SplitPaneResizeContext);

  // On single-click, open the file in a transient tab.
  const handleFileClick = useCallback(
    (fileId: FileId) => {
      openTab({ fileId, isTransient: true });
    },
    [openTab],
  );

  // On double-click, open the file in a persistent tab.
  const handleFileDoubleClick = useCallback(
    (fileId: FileId) => {
      openTab({ fileId, isTransient: false });
    },
    [openTab],
  );

  // True if files exist.
  const filesExist =
    fileTree &&
    fileTree.children &&
    fileTree.children.length > 0;

  const {
    isDragOver,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop();

  // Track presence of remote users across files so that they can be displayed in the sidebar.
  useEffect(() => {
    docPresence;
  }, []);

  // Track the presence indicators for display in sidebar
  useEffect(() => {
    if (docPresence) {
      const handleReceive = (presenceId: PresenceId, update: Presence) => {
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

  return (
    <div
      className="vz-sidebar"
      style={{ width: sidebarWidth + 'px' }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      tabIndex={0} // Ensures the sidebar is focusable
      onKeyDown={handleSidebarKeyDown} // Handles keyboard navigation
      ref={sidebarRef}
    >
      <div className="full-box">
        <div className="sidebar-section-buttons">
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id="files-tooltip">
                {filesToolTipText}
              </Tooltip>
            }
          >
            <i
              id="files-icon"
              className="icon-button icon-button-dark"
              onClick={() => setIsSearchOpen(false)}
            >
              <FolderSVG />
            </i>
          </OverlayTrigger>

          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id="search-tooltip">
                {searchToolTipText}
              </Tooltip>
            }
          >
            <i
              id="search-icon"
              className="icon-button icon-button-dark"
              onClick={() => setIsSearchOpen(true)}
            >
              <SearchSVG />
            </i>
          </OverlayTrigger>

          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id="open-keyboard-shortcuts">
                {openKeyboardShortcuts}
              </Tooltip>
            }
          >
            <i
              id="shortcut-icon"
              className="icon-button icon-button-dark"
              onClick={handleQuestionMarkClick}
            >
              <QuestionMarkSVG />
            </i>
          </OverlayTrigger>

          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id="report-bug-tooltip">
                {reportBugTooltipText}
              </Tooltip>
            }
          >
            <a
              href="https://github.com/vizhub-core/vzcode/issues/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i
                id="bug-icon"
                className="icon-button icon-button-dark"
              >
                <BugSVG />
              </i>
            </a>
          </OverlayTrigger>

          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id="open-settings-tooltip">
                {openSettingsTooltipText}
              </Tooltip>
            }
          >
            <i
              id="settings-icon"
              className="icon-button icon-button-dark"
              onClick={handleSettingsClick}
            >
              <GearSVG />
            </i>
          </OverlayTrigger>

          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id="create-file-tooltip">
                {createFileTooltipText}
              </Tooltip>
            }
          >
            <i
              id="new-file-icon"
              className="icon-button icon-button-dark"
              onClick={handleOpenCreateFileModal}
            >
              <NewSVG />
            </i>
          </OverlayTrigger>

          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id="create-dir-tooltip">
                {createDirTooltipText}
              </Tooltip>
            }
          >
            <i
              id="new-directory-icon"
              className="icon-button icon-button-dark"
              onClick={handleOpenCreateDirModal}
            >
              <FileSVG />
            </i>
          </OverlayTrigger>

          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id="toggle-auto-follow">
                {enableAutoFollow
                  ? disableAutoFollowTooltipText
                  : enableAutoFollowTooltipText}
              </Tooltip>
            }
          >
            <i
              id="auto-focus-icon"
              className={`icon-button icon-button-dark${
                enableAutoFollow
                  ? ' vh-color-success-01'
                  : ''
              }`}
              onClick={toggleAutoFollow}
            >
              <PinSVG />
            </i>
          </OverlayTrigger>
        </div>
        <div className="files" id="sidebar-view-container">
          {!isSearchOpen ? (
            <div className="sidebar-files">
              {isDragOver ? (
                <div className="empty">
                  <div className="empty-text">
                    Drop files here!
                  </div>
                </div>
              ) : filesExist ? (
                fileTree.children.map((entity, index) => {
                  const { fileId } = entity as FileTreeFile;
                  const { path } = entity as FileTree;
                  const key = fileId ? fileId : path;
                  const isFocused = focusedIndex === index;

                  return (
                    <div
                      key={key}
                      className={`sidebar-file-item ${isFocused ? 'focused' : ''}`}
                      tabIndex={0}
                      ref={(el) => (fileRefs[index] = el)} // Assign ref to each file item
                      onClick={() => handleFileClick(fileId)}
                      onDoubleClick={() => handleFileDoubleClick(fileId)}
                    >
                      <Listing
                        entity={entity}
                        handleFileClick={handleFileClick}
                        handleFileDoubleClick={handleFileDoubleClick}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="empty">
                  <div className="empty-text">
                    It looks like you don't have any files yet! Click the "Create file" button above to create your first file.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="sidebar-search">
              <Search />
            </div>
          )}
        </div>
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
