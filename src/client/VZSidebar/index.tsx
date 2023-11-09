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
import { getFileTree } from '../getFileTree';
import { sortFileTree } from '../sortFileTree';
import { disableSettings } from '../featureFlags';
import { SplitPaneResizeContext } from '../SplitPaneResizeContext';
import { Listing } from './Listing';
import { CreateFileModal } from './CreateFileModal';
import './styles.scss';

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
  renameFile,
  deleteFile,
  deleteDirectory,
  openTab,
  closeTabs,
  setIsSettingsOpen,
  isDirectoryOpen,
  toggleDirectory,
  activeFileId,
}: {
  files: Files;
  createFile: (fileName) => void;
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

  const { codeEditorWidth } = useContext(
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
      style={{ width: codeEditorWidth + 'px' }}
    >
      <div className="files">
        <div className="full-box">
          <div className="sidebar-section-hint">Files</div>
          <div>
            <CreateFileButton
              handleCreateFile={handleCreateFile}
            />
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
      {disableSettings ? null : (
        <div
          className="settings"
          onClick={handleSettingsClick}
        >
          Editor Settings
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
