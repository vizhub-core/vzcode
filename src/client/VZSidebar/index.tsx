import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import {
  FileTree,
  FileTreeFile,
  Presence,
  PresenceId,
  PresenceIndicator,
  FileId, // added so the fileNames memo compiles
} from '../../types';
import { VizFileId } from '@vizhub/viz-types';
import { OverlayTrigger, Tooltip } from '../bootstrap';
import { getFileTree } from '../getFileTree';
import {
  BugSVG,
  FileSVG,
  FolderSVG,
  GearSVG,
  NewSVG,
  PinSVG,
  QuestionMarkSVG,
  SearchSVG,
} from '../Icons';
import { MicSVG } from '../Icons/MicSVG';
import { sortFileTree } from '../sortFileTree';
import { SplitPaneResizeContext } from '../SplitPaneResizeContext';
import { VZCodeContext } from '../VZCodeContext';
import { Listing } from './Listing';
import { Search } from './Search';
import './styles.scss';
import { useDragAndDrop } from './useDragAndDrop';
import { enableLiveKit } from '../featureFlags';

// TODO turn this UI back on when we are actually detecting
// the connection status.
// See https://github.com/vizhub-core/vzcode/issues/456
const enableConnectionStatus = true;

const collectFilesRecursively = (
  node,
  path = '',
  files: string[] = [],
) => {
  const currentPath = path ? `${path}/${node.name}` : node.name;

  if (node.type === 'file') {
    files.push(currentPath);
  } else if (node.type === 'directory' && node.children) {
    node.children.forEach((child) =>
      collectFilesRecursively(child, currentPath, files),
    );
  }

  return files;
};

const copyFileList = async (fileNames: string[]) => {
  try {
    if (!fileNames || fileNames.length === 0) {
      alert('No files to copy.');
      return;
    }

    const fileListString = fileNames.join('\n');
    await navigator.clipboard.writeText(fileListString);
    alert('File list copied to clipboard!');
  } catch (error) {
    console.error('Error copying file list:', error);
    alert('Failed to copy the file list. Please try again.');
  }
};

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
  voiceChatToolTipText = (
    <div>
      <strong>Open Voice Chat Menu</strong>
    </div>
  ),
}: {
  createFileTooltipText?: React.ReactNode;
  createDirTooltipText?: React.ReactNode;
  openSettingsTooltipText?: React.ReactNode;
  openKeyboardShortcuts?: React.ReactNode;
  reportBugTooltipText?: React.ReactNode;
  searchToolTipText?: React.ReactNode;
  filesToolTipText?: React.ReactNode;
  enableAutoFollowTooltipText?: React.ReactNode;
  disableAutoFollowTooltipText?: React.ReactNode;
  voiceChatToolTipText?: React.ReactNode;
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
    pending,
    sidebarRef,
    enableAutoFollow,
    toggleAutoFollow,
    docPresence,
    updatePresenceIndicator,
    sidebarPresenceIndicators,
    liveKitConnection,
    setLiveKitConnection,
    setVoiceChatModalOpen,
  } = useContext(VZCodeContext);

  const fileTree = useMemo(
    () => (files ? sortFileTree(getFileTree(files)) : null),
    [files],
  );

  const handleQuestionMarkClick = useCallback(
    () => setIsDocOpen(true),
    [setIsDocOpen],
  );
  const handleSettingsClick = useCallback(
    () => setIsSettingsOpen(true),
    [setIsSettingsOpen],
  );

  const { sidebarWidth } = useContext(SplitPaneResizeContext);

  // Open file helpers
  const handleFileClick = useCallback(
    (fileId: VizFileId) => openTab({ fileId, isTransient: true }),
    [openTab],
  );
  const handleFileDoubleClick = useCallback(
    (fileId: VizFileId) => openTab({ fileId, isTransient: false }),
    [openTab],
  );

  const filesExist = !!files;

  const {
    isDragOver,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop();

  /* ---------- Presence ---------- */
  useEffect(() => {
    if (docPresence) {
      const handleReceive = (
        presenceId: PresenceId,
        update: Presence,
      ) => {
        updatePresenceIndicator({
          username: update.username,
          fileId: update.start[1] as VizFileId,
        });
      };
      docPresence.on('receive', handleReceive);
      return () => docPresence.off('receive', handleReceive);
    }
  }, [docPresence, updatePresenceIndicator]);

  /* ---------- Copy‑files‑list feature ---------- */
  const fileNames: string[] = useMemo(
    () =>
      files
        ? Object.keys(files).map(
            (fileId: FileId) => files[fileId].name,
          )
        : [],
    [files],
  );

  useEffect(() => {
    const handler = () => copyFileList(fileNames);
    const el = document.querySelector('.copy-files-list-blurb');
    el?.addEventListener('click', handler);
    return () => el?.removeEventListener('click', handler);
  }, [fileNames]);

  /* ---------- Connection‑status feature ---------- */
  const [saved, setSaved] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const previousPendingRef = useRef<boolean>(pending);

  // transition from "connecting…" to connected/disconnected
  useEffect(() => {
    if (isConnecting && connected) setIsConnecting(false);
  }, [connected, isConnecting]);

  // show "Saved." briefly after a successful save
  useEffect(() => {
    if (
      previousPendingRef.current &&
      !pending &&
      connected &&
      !isConnecting
    ) {
      setSaved(true);
      const timer = setTimeout(() => setSaved(false), 1500);
      return () => clearTimeout(timer);
    }
    previousPendingRef.current = pending;
  }, [pending, connected, isConnecting]);

  /* ---------- Render ---------- */
  return (
    <div
      className="vz-sidebar"
      style={{ width: `${sidebarWidth}px` }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="full-box" ref={sidebarRef} tabIndex={-1}>
        {/* ---------- Sidebar buttons ---------- */}
        <div className="sidebar-section-buttons">
          {/* Files */}
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

          {/* Search */}
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

          {/* Keyboard shortcuts */}
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

          {/* Report bug */}
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

          {/* Settings */}
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

          {/* New file */}
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

          {/* New directory */}
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

          {/* Toggle Auto Follow */}
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
                enableAutoFollow ? ' vh-color-success-01' : ''
              }`}
              onClick={toggleAutoFollow}
            >
              <PinSVG />
            </i>
          </OverlayTrigger>

          {/* Voice Chat */}
          {enableLiveKit && (
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id="voice-chat">
                  {voiceChatToolTipText}
                </Tooltip>
              }
            >
              <i
                id="mic-icon"
                className="icon-button icon-button-dark"
                onClick={() => {
                  setVoiceChatModalOpen(true);
                }}
              >
                <MicSVG />
              </i>
            </OverlayTrigger>
          )}
        </div>

        {/* ---------- Sidebar content ---------- */}
        <div className="files" id="sidebar-view-container">
          {!isSearchOpen ? (
            <div className="sidebar-files">
              {isDragOver ? (
                <div className="empty">
                  <div className="empty-text">Drop files here!</div>
                </div>
              ) : filesExist ? (
                fileTree!.children.map((entity) => {
                  const { fileId } = entity as FileTreeFile;
                  const { path } = entity as FileTree;
                  const key = fileId ? fileId : path;
                  return (
                    <Listing
                      key={key}
                      entity={entity}
                      handleFileClick={handleFileClick}
                      handleFileDoubleClick={handleFileDoubleClick}
                    />
                  );
                })
              ) : (
                <div className="empty">
                  <div className="empty-text">
                    It looks like you don't have any files yet! Click the
                    "Create file" button above to create your first file.
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

      {/* ---------- Copy‑files‑list blurb ---------- */}
      <div className="copy-files-list-blurb">Copy files list</div>

      {/* ---------- Connection‑status banner ---------- */}
      {enableConnectionStatus && (
        <div className="connection-status">
          {isConnecting
            ? 'Connecting...'
            : !connected
              ? 'Connection Lost'
              : pending
                ? 'Saving...'
                : saved
                  ? 'Saved.'
                  : 'Connected'}
          <div className="connection">
            <div
              className={`connection-status-indicator ${
                isConnecting
                  ? 'pending'
                  : !connected
                    ? 'disconnected'
                    : pending
                      ? 'pending'
                      : 'connected'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
