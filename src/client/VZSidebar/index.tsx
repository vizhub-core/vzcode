import { useCallback, useContext, useMemo } from 'react';
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
import './styles.scss';

const CreateFileButton = ({ createFile }) => {
  return (
    <i
      className="bx bxs-file-plus new-btn"
      style={{ color: '#dbdde1' }}
      onClick={createFile}
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
  setIsSettingsOpen,
  isDirectoryOpen,
  toggleDirectory,
  activeFileId,
}: {
  files: Files;
  createFile: () => void;
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
  setIsSettingsOpen: (isSettingsOpen: boolean) => void;
  isDirectoryOpen: (path: string) => boolean;
  toggleDirectory: (path: string) => void;
  activeFileId?: FileId;
}) => {
  const fileTree = useMemo(
    () => (files ? sortFileTree(getFileTree(files)) : null),
    [files],
  );

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
            <CreateFileButton createFile={createFile} />
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

            <CreateFileButton createFile={createFile} />
          </div>
        )}
      </div>
      {disableSettings ? null : (
        <div
          className="settings"
          onClick={handleSettingsClick}
        >
          Settings
        </div>
      )}
    </div>
  );
};
