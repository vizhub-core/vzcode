import {
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import {
  FileId,
  FileTree,
  FileTreeFile,
  FileTreePath,
  Files,
} from '../../types';
import { Tooltip, OverlayTrigger } from '../bootstrap';
import { getFileTree } from '../getFileTree';
import { sortFileTree } from '../sortFileTree';
import { disableSettings } from '../featureFlags';
import { SplitPaneResizeContext } from '../SplitPaneResizeContext';
import { BugSVG, GearSVG, NewSVG } from '../Icons';
import { Listing } from './Listing';
import { CreateFileModal } from './CreateFileModal';
import './styles.scss';

// TODO turn this UI back on when we are actually detecting
// the connection status.
// See https://github.com/vizhub-core/vzcode/issues/456
const enableConnectionStatus = false;

const CreateFileButton = ({ handleCreateFile }) => {
  return (
    <i
      className="bx bxs-file-plus new-btn"
      style={{ color: '#dbdde1' }}
      onClick={handleCreateFile}
      // TODO better tooltip
      title="Create file"
    ></i>
  );
};
export const VZSidebar = ({
  files,
  createFile,
  createFileTooltipText='New File',
  renameFile,
  deleteFile,
  deleteDirectory,
  openTab,
  closeTabs,
  setIsSettingsOpen,
  isDirectoryOpen,
  toggleDirectory,
  activeFileId,
  openSettingsTooltipText='Open Settings',
  reportBugTooltipText='Report Bug',
}: {
  files: Files;
  createFile: (fileName) => void;
  createFileTooltipText?: string;
  renameFile: (fileId: FileId, newName: string) => void;
  deleteFile: (fileId: FileId) => void;
  deleteDirectory: (path: FileTreePath) => void;
  openTab: ({
    fileId,
    isTransient,
  }: {
    fileId: FileId;
    isTransient?: boolean;
  }) => void;
  closeTabs: (fileIds: FileId[]) => void;
  setIsSettingsOpen: (isSettingsOpen: boolean) => void;
  isDirectoryOpen: (path: string) => boolean;
  toggleDirectory: (path: string) => void;
  activeFileId?: FileId;
  openSettingsTooltipText?: string;
  reportBugTooltipText?: string;
}) => {
  const fileTree = useMemo(
    () => (files ? sortFileTree(getFileTree(files)) : null),
    [files],
  );

  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal's visibility

  const handleCreateFile = useCallback(() => {
    setIsModalOpen(true);
  }, [setIsModalOpen]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const handleRename = useCallback(
    (newFileName: string) => {
      createFile(newFileName);
      setIsModalOpen(false);
    },
    [createFile, setIsModalOpen],
  );

  const handleKeyPress = useCallback(
    (event: { altKey: boolean; key: string }) => {
      if (event.altKey == true) {
        if (event.key == 'w') {
          closeTabs([activeFileId]);
        }
        if (event.key == 'n') {
          handleCreateFile();
        }
      }
    },
    [createFile, closeTabs, activeFileId],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyPress,
      );
    };
  }, [handleKeyPress]);

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

  return (
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
                <i className="icon-button">
                  <BugSVG />
                </i>
              </a>
            </OverlayTrigger>
            {disableSettings ? null : (
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
                  className="icon-button"
                >
                  <GearSVG />
                </i>
              </OverlayTrigger>
            )}
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="create-file-tooltip">
                  {createFileTooltipText}
                </Tooltip>
              }
            >
              <i
                onClick={handleCreateFile}
                className="icon-button"
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
              Click the "Create file" button below to create
              your first file.
            </div>
            <CreateFileButton
              handleCreateFile={handleCreateFile}
            />
          </div>
        )}
      </div>

      {enableConnectionStatus && (
        <div className="connection-status">
          Connection Status
          <div className="connection">
            Saved
            <div className="saved" />
          </div>
        </div>
      )}
      <CreateFileModal
        show={isModalOpen}
        onClose={handleCloseModal}
        onRename={handleRename}
      />
    </div>
  );
};
