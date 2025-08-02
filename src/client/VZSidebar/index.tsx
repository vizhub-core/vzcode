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
  SparklesSVG,
} from '../Icons';
import { MicSVG } from '../Icons/MicSVG';
import { sortFileTree } from '../sortFileTree';
import { SplitPaneResizeContext } from '../SplitPaneResizeContext';
import { VZCodeContext } from '../VZCodeContext';
import { AIChat } from './AIChat';
import { Listing } from './Listing';
import { Search } from './Search';
import { useDragAndDrop } from './useDragAndDrop';
import { createAICopyPasteHandlers } from './aiCopyPaste';
import {
  enableLiveKit,
  enableAIChat,
} from '../featureFlags';
import './styles.scss';

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
  voiceChatToolTipText = (
    <div>
      <strong>Open Voice Chat Menu</strong>
    </div>
  ),
  aiChatToolTipText = (
    <div>
      <strong>VizBot - AI Code Editor</strong>
      <div>
        Ask for incremental code changes like "Make it blue
        themed" or "Change the circles to squares"
      </div>
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
  voiceChatToolTipText?: React.ReactNode;
  aiChatToolTipText?: React.ReactNode;
}) => {
  const {
    files,
    openTab,
    setIsSettingsOpen,
    setIsDocOpen,
    isSearchOpen,
    setIsSearchOpen,
    isAIChatOpen,
    setIsAIChatOpen,
    handleOpenCreateFileModal,
    handleOpenCreateDirModal,
    connected,
    pending,
    sidebarRef,
    enableAutoFollow,
    toggleAutoFollow,
    docPresence,
    updatePresenceIndicator,
    setVoiceChatModalOpen,
    submitOperation,
  } = useContext(VZCodeContext);

  const fileTree = useMemo(
    () => (files ? sortFileTree(getFileTree(files)) : null),
    [files],
  );
  const handleQuestionMarkClick = useCallback(() => {
    setIsDocOpen(true);
  }, []);
  const handleSettingsClick = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  // State for AI operation feedback
  const [copyButtonText, setCopyButtonText] =
    useState('Copy for AI');
  const [pasteButtonText, setPasteButtonText] =
    useState('Paste for AI');
  const [exportButtonText, setExportButtonText] =
    useState('Export to ZIP');

  // Create AI copy/paste handlers
  const {
    handleCopyForAI,
    handlePasteForAI,
    handleExportToZip,
  } = useMemo(
    () =>
      createAICopyPasteHandlers(
        files,
        submitOperation,
        setCopyButtonText,
        setPasteButtonText,
        setExportButtonText,
      ),
    [files, submitOperation],
  );

  const { sidebarWidth, setSidebarView } = useContext(
    SplitPaneResizeContext,
  );

  // On single-click, open the file in a transient tab.
  const handleFileClick = useCallback(
    (fileId: VizFileId) => {
      openTab({ fileId, isTransient: true });
    },
    [openTab],
  );

  // On double-click, open the file in a persistent tab.
  const handleFileDoubleClick = useCallback(
    (fileId: VizFileId) => {
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

  // Track presence of remote users across files
  // so that they can be displayed in the sidebar.
  useEffect(() => {
    docPresence;
  }, []);

  // Track the presence indicators for display in sidebar
  useEffect(() => {
    if (docPresence) {
      const handleReceive = (
        presenceId: PresenceId,
        update: Presence,
      ) => {
        // Sometimes this can be null, so we check.
        // This can happen when the user disconnects.
        // If this happens, we do not update the presence indicator.
        // TODO test removal of presence indicator.
        if (!update) return;

        const presenceIndicator: PresenceIndicator = {
          username: update.username,
          fileId: update.start[1] as VizFileId,
        };

        updatePresenceIndicator(presenceIndicator);
      };

      docPresence.on('receive', handleReceive);
      return () => {
        docPresence.off('receive', handleReceive);
      };
    }
  }, [docPresence]);

  const [saved, setSaved] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const previousPendingRef = useRef<boolean>(pending);

  // Handle connection status transitions
  useEffect(() => {
    if (isConnecting && connected) {
      setIsConnecting(false);
    }
  }, [connected, isConnecting]);

  // Handle 'saved' state based on 'pending' transition
  useEffect(() => {
    // Check if 'pending' transitioned from true to false
    if (
      previousPendingRef.current &&
      !pending &&
      connected &&
      !isConnecting
    ) {
      setSaved(true);
      const timer = setTimeout(() => {
        setSaved(false);
      }, 1500); // Reset after 2 seconds
      return () => clearTimeout(timer);
    }
    // Update the ref with the current 'pending' state
    previousPendingRef.current = pending;
  }, [pending, connected, isConnecting]);

  // Automatically adjust sidebar width when view changes
  useEffect(() => {
    setSidebarView(isAIChatOpen);
  }, [isAIChatOpen, setSidebarView]);

  return (
    <div
      className="vz-sidebar"
      style={{ width: sidebarWidth + 'px' }}
    >
      <div
        className="full-box"
        ref={sidebarRef}
        tabIndex={-1}
      >
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
              onClick={() => {
                setIsSearchOpen(false);
                setIsAIChatOpen(false);
                setSidebarView(false); // Switch to files view
              }}
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
              onClick={() => {
                setIsSearchOpen(true);
                setIsAIChatOpen(false);
                setSidebarView(false); // Switch to files view (search uses same width as files)
              }}
            >
              <SearchSVG />
            </i>
          </OverlayTrigger>

          {enableAIChat && (
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id="ai-chat-tooltip">
                  {aiChatToolTipText}
                </Tooltip>
              }
            >
              <i
                id="ai-chat-icon"
                className="icon-button icon-button-dark"
                onClick={() => {
                  setIsAIChatOpen(true);
                  setIsSearchOpen(false);
                  setSidebarView(true); // Switch to AI chat view
                }}
              >
                <SparklesSVG />
              </i>
            </OverlayTrigger>
          )}

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

          {/*Directory Rename*/}
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

          {/*Toggle Follow*/}
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
              <i></i>
              <PinSVG />
            </i>
          </OverlayTrigger>
          {/* Start Voice Chat */}
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
        <div
          className="files"
          id="sidebar-view-container"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isAIChatOpen ? (
            <div className="sidebar-ai-chat">
              <AIChat />
            </div>
          ) : isSearchOpen ? (
            <div className="sidebar-search">
              <Search />
            </div>
          ) : (
            <div className="sidebar-files">
              {isDragOver ? (
                <div className="empty drag-over">
                  <div className="empty-text">
                    It looks like you don't have any files
                    yet! Click the "Create file" button
                    above to create your first file.
                  </div>
                  <div className="empty-text">
                    Drop files here!
                  </div>
                </div>
              ) : filesExist ? (
                fileTree.children.map((entity) => {
                  const { fileId } = entity as FileTreeFile;
                  const { path } = entity as FileTree;
                  const key = fileId ? fileId : path;
                  return (
                    <Listing
                      key={key}
                      entity={entity}
                      handleFileClick={handleFileClick}
                      handleFileDoubleClick={
                        handleFileDoubleClick
                      }
                    />
                  );
                })
              ) : (
                <div className="empty">
                  <div className="empty-text">
                    It looks like you don't have any files
                    yet! Click the "Create file" button
                    above to create your first file.
                  </div>
                  <div className="empty-text">
                    Drop files here!
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {!isAIChatOpen && !isSearchOpen && (
        <div className="ai-buttons">
          {filesExist && (
            <button
              className="ai-button export-button"
              onClick={handleExportToZip}
              title="Export files to ZIP"
            >
              {exportButtonText}
            </button>
          )}
          {filesExist && (
            <button
              className="ai-button copy-button"
              onClick={handleCopyForAI}
              title="Copy files formatted for AI"
            >
              {copyButtonText}
            </button>
          )}

          <button
            className="ai-button paste-button"
            onClick={handlePasteForAI}
            title="Paste files from AI"
          >
            {pasteButtonText}
          </button>
        </div>
      )}
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
