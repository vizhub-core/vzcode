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


  const [flattenedItems, setFlattenedItems] = useState(() =>
    fileTree ? flattenFileTree(fileTree.children) : []
  );

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const fileRefs = useMemo(() => [], []);

  const flattenFileTree = useCallback(
    (tree: Array<FileTree | FileTreeFile>, parentPath = ''): Array<any> => {
      const items = [];
      tree.forEach((item) => {
        if ('fileId' in item) {
          items.push(item);
        } else {
          items.push({ ...item, type: 'folder' });
          if (expandedFolders.has(item.path)) {
            items.push(...flattenFileTree(item.children, item.path));
          }
        }
      });
      return items;
    },
    [expandedFolders],
  );

  useEffect(() => {
    // Reset flattenedItems whenever fileTree changes
    if (fileTree) {
      setFlattenedItems(flattenFileTree(fileTree.children));
    }
  }, [fileTree, flattenFileTree]);

  // Function to reorder items based on dragged and drop targets
  const handleReorderItems = (draggedId: string, dropTargetId: string) => {
    const fromIndex = flattenedItems.findIndex(item => item.fileId === draggedId || item.path === draggedId);
    const toIndex = flattenedItems.findIndex(item => item.fileId === dropTargetId || item.path === dropTargetId);

    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;

    const updatedItems = [...flattenedItems];
    const [movedItem] = updatedItems.splice(fromIndex, 1);
    updatedItems.splice(toIndex, 0, movedItem);

    setFlattenedItems(updatedItems); 
    setDropTargetIndex(null); 
  };

  const handleSidebarKeyDown = (event: React.KeyboardEvent) => {
    if (!flattenedItems.length) return;

    const moveItem = (fromIndex: number, toIndex: number) => {
      const updatedItems = [...flattenedItems];
      const [movedItem] = updatedItems.splice(fromIndex, 1);
      updatedItems.splice(toIndex, 0, movedItem);
    };


    switch (event.key) {
      case 'ArrowUp':
        setFocusedIndex((prevIndex) => {
          const newIndex = prevIndex === null ? 0 : Math.max(prevIndex - 1, 0);
          fileRefs[newIndex]?.focus();
          return newIndex;
        });
        event.preventDefault();
        break;
      case 'ArrowDown':
        setFocusedIndex((prevIndex) => {
          const newIndex =
            prevIndex === null
              ? 0
              : Math.min(prevIndex + 1, flattenedItems.length - 1);
          fileRefs[newIndex]?.focus();
          return newIndex;
        });
        event.preventDefault();
        break;
      case 'ArrowRight':
        if (focusedIndex !== null) {
          const item = flattenedItems[focusedIndex];
          if (item.type === 'folder') {
            expandFolder(item.path);
          }
        }
        event.preventDefault();
        break;
      case 'ArrowLeft':
        if (focusedIndex !== null) {
          const item = flattenedItems[focusedIndex];
          if (item.type === 'folder') {
            foldFolder(item.path);
          }
        }
        event.preventDefault();
        break;
      case 'Enter':
        if (focusedIndex !== null) {
          const item = flattenedItems[focusedIndex];
          if (item.type === 'folder') {
            toggleFolder(item.path);
          } else if ('fileId' in item) {
            openTab({ fileId: item.fileId, isTransient: false });
          }
        }
        event.preventDefault();
        break;
      case ' ':
        if (focusedIndex !== null) {
          const item = flattenedItems[focusedIndex];
          if (item.type === 'folder') {
            toggleFolder(item.path);
          } else if ('fileId' in item) {
            openTab({ fileId: item.fileId, isTransient: false });
          }
        }
        event.preventDefault();
        break;
      case 'Home':
        setFocusedIndex(0);
        fileRefs[0]?.focus();
        event.preventDefault();
        break;
      case 'End':
        setFocusedIndex(flattenedItems.length - 1);
        fileRefs[flattenedItems.length - 1]?.focus();
        event.preventDefault();
        break;
      case '[':
        if (focusedIndex !== null && focusedIndex > 0) {
          moveItem(focusedIndex, focusedIndex - 1);
          setFocusedIndex(focusedIndex - 1);
          fileRefs[focusedIndex - 1]?.focus();
        }
        event.preventDefault();
        break;
      case ']':
        if (focusedIndex !== null && focusedIndex < flattenedItems.length - 1) {
          moveItem(focusedIndex, focusedIndex + 1);
          setFocusedIndex(focusedIndex + 1);
          fileRefs[focusedIndex + 1]?.focus();
        }
        event.preventDefault();
        break;
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(path)) newExpanded.delete(path);
      else newExpanded.add(path);
      return newExpanded;
    });
  };
  const foldFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const newExpanded = new Set(prev);
      newExpanded.delete(path);
      return newExpanded;
    });
  };
  const expandFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const newExpanded = new Set(prev);
       newExpanded.add(path);
      return newExpanded;
    });
  };
  const handleFileFocusShortcut = useCallback(() => {
    if (flattenedItems.length > 0) {
      setFocusedIndex(0);
      fileRefs[0]?.focus();
    }
  }, [flattenedItems]);

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
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop(setDropTargetIndex);

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
      onDragOver={(event) => handleDragOver(event, null)}
      onDragLeave={handleDragLeave}
      onDrop={(event) => handleDrop(event as React.DragEvent<HTMLDivElement>, null, handleReorderItems)}
      tabIndex={0}
      onKeyDown={handleSidebarKeyDown}
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
                flattenedItems.map((item, index) => (
                  <div
                    key={item.fileId || item.path}
                    className={`sidebar-file-item ${focusedIndex === index ? 'focused' : ''} ${dropTargetIndex === index ? 'drag-over' : ''}`}
                    tabIndex={0}
                    ref={(el) => (fileRefs[index] = el)}
                    onClick={() => {
                      if (item.type === 'folder') toggleFolder(item.path);
                      else handleFileClick(item.fileId);
                    }}
                    onDoubleClick={() => {
                      if ('fileId' in item) handleFileDoubleClick(item.fileId);
                    }}
                  >
                    <Listing
                      entity={item}
                      handleFileClick={handleFileClick}
                      handleFileDoubleClick={handleFileDoubleClick}
                      isExpanded={expandedFolders.has(item.path)}
                      onDragStart={() => handleDragStart(item.fileId || item.path)}
                      onDragOver={(event) => handleDragOver(event, item.fileId || item.path)}
                      onDrop={(event) => handleDrop(event as React.DragEvent<HTMLDivElement>, item.fileId || item.path, handleReorderItems)}
                    />
                  </div>
                ))
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
