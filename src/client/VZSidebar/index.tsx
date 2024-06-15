import { useCallback, useContext, useMemo } from 'react';
import {
  FileId,
  FileTree,
  FileTreeFile,
} from '../../types';
import { Tooltip, OverlayTrigger } from '../bootstrap';
import { Search} from "./Search";
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
  QuestionMarkSVG
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
  createFileTooltipText = 'New File',
  createDirTooltipText = 'New Directory',
  openSettingsTooltipText = 'Open Settings',
  openKeyboardShortcuts = 'Keyboard Shortcuts',
  reportBugTooltipText = 'Report Bug',
  searchToolTipText = 'Search',
  filesToolTipText = 'Files'
}: {
  createFileTooltipText?: string;
  createDirTooltipText?: string;
  openSettingsTooltipText?: string;
  reportBugTooltipText?: string;
  openKeyboardShortcuts?: string;
  searchToolTipText?: string;
  filesToolTipText?: string;
}) => {
  const {
    files,
    openTab,
    setIsSettingsOpen,
    setIsDocOpen,
    isFilesToggled,
    handleToggleFiles,
    handleToggleSearch,
    handleOpenCreateFileModal,
    handleOpenCreateDirModal,
    connected,
    sidebarRef
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
      className="vz-sidebar"
      style={{ width: sidebarWidth + 'px' }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="files" ref={sidebarRef}
        tabIndex={-1}>
        <div className="full-box">
          <div className="sidebar-section-buttons">
            <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="files-tooltip">
                    {filesToolTipText}
                  </Tooltip>
                }
              >
                <i
                  onClick={handleToggleFiles}
                  className="icon-button icon-button-dark"
                >
                  <FolderSVG />
                </i>
              </OverlayTrigger>

            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="search-tooltip">
                  {searchToolTipText}
                </Tooltip>
              }
            >
              <i
                onClick={handleToggleSearch}
                className="icon-button icon-button-dark"
              >
                <SearchSVG />
              </i>
            </OverlayTrigger>

            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="open-keyboard-shortcuts">
                  {openKeyboardShortcuts}
                </Tooltip>
              }
            >
              <i
                onClick={handleQuestionMarkClick}
                className="icon-button icon-button-dark"
              >
                <QuestionMarkSVG />
              </i>
            </OverlayTrigger>

            <OverlayTrigger
              placement="bottom"
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

            <OverlayTrigger
              placement="bottom"
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

            <OverlayTrigger
              placement="bottom"
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

            {/*Directory Rename*/}
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="create-dir-tooltip">
                  {createDirTooltipText}
                </Tooltip>
              }
            >
              <i
                onClick={handleOpenCreateDirModal}
                className="icon-button icon-button-dark"
              >
                <FileSVG />
              </i>
            </OverlayTrigger>
          </div>

          { isFilesToggled ? (
            <div className='sidebar-files'>
              {isDragOver ? (
                <div className="empty">
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
                    It looks like you don't have any files yet!
                    Click the "Create file" button above to create
                    your first file.
                  </div>
                </div>
              )}
          </div>
          ) : (
            <div className='sidebar-search'>
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
