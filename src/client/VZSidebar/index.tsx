import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import {
  FileId,
  FileTree,
  FileTreeFile,
} from '../../types';
import { Tooltip, OverlayTrigger } from '../bootstrap';
import { getFileTree } from '../getFileTree';
import { sortFileTree } from '../sortFileTree';
import { disableSettings } from '../featureFlags';
import { SplitPaneResizeContext } from '../SplitPaneResizeContext';
import { BugSVG, GearSVG, NewSVG } from '../Icons';
import { Listing } from './Listing';
import { VZCodeContext } from '../VZCodeContext';
import { useDragAndDrop } from './useDragAndDrop';
import './styles.scss';

// TODO turn this UI back on when we are actually detecting
// the connection status.
// See https://github.com/vizhub-core/vzcode/issues/456
const enableConnectionStatus = true;

export const VZSidebar = ({
  createFileTooltipText = 'New File',
  openSettingsTooltipText = 'Open Settings',
  reportBugTooltipText = 'Report Bug',
}: {
  createFileTooltipText?: string;
  openSettingsTooltipText?: string;
  reportBugTooltipText?: string;
}) => {
  const {
    files,
    renameFile,
    deleteFile,
    renameDirectory,
    deleteDirectory,
    activeFileId,
    openTab,
    setIsSettingsOpen,
    isDirectoryOpen,
    toggleDirectory,
    handleOpenCreateFileModal,
    connected,
  } = useContext(VZCodeContext);

  const fileTree = useMemo(
    () => (files ? sortFileTree(getFileTree(files)) : null),
    [files],
  );

  const handleSettingsClick = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const { sidebarWidth } = useContext(
    SplitPaneResizeContext,
  );

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

  return (
    <div
      className={`drop-zone ${isDragOver ? 'dragover' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className="vz-sidebar"
        style={{ width: sidebarWidth + 'px' }}
      >
        <div className="files">
          <div className="full-box">
            <div className="sidebar-section-hint">
              Project Files
            </div>
            <div className="sidebar-section-buttons">
              <OverlayTrigger
                placement="left"
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
                  <i className="icon-button icon-button-dark">
                    <BugSVG />
                  </i>
                </a>
              </OverlayTrigger>
              {disableSettings ? null : (
                <OverlayTrigger
                  placement="left"
                  overlay={
                    <Tooltip id="open-settings-tooltip">
                      {openSettingsTooltipText}
                    </Tooltip>
                  }
                >
                  <i
                    onClick={handleSettingsClick}
                    className="icon-button icon-button-dark"
                  >
                    <GearSVG />
                  </i>
                </OverlayTrigger>
              )}
              <OverlayTrigger
                placement="left"
                overlay={
                  <Tooltip id="create-file-tooltip">
                    {createFileTooltipText}
                  </Tooltip>
                }
              >
                <i
                  onClick={handleOpenCreateFileModal}
                  className="icon-button icon-button-dark"
                >
                  <NewSVG />
                </i>
              </OverlayTrigger>
            </div>
          </div>
          {filesExist ? (
            fileTree.children.map((entity) => {
              const { fileId } = entity as FileTreeFile;
              const { path } = entity as FileTree;
              const key = fileId ? fileId : path;
              return (
                <Listing
                  key={key}
                  entity={entity}
                  renameFile={renameFile}
                  deleteFile={deleteFile}
                  renameDirectory={renameDirectory}
                  deleteDirectory={deleteDirectory}
                  handleFileClick={handleFileClick}
                  handleFileDoubleClick={
                    handleFileDoubleClick
                  }
                  isDirectoryOpen={isDirectoryOpen}
                  toggleDirectory={toggleDirectory}
                  activeFileId={activeFileId}
                />
              );
            })
          ) : (
            <div className="empty">
              <div className="empty-text">
                It looks like you don't have any files yet!
                Click the "Create file" button above to
                create your first file.
              </div>
            </div>
          )}
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
    </div>
  );
};
