import { useCallback, useContext, useMemo } from 'react';
import {
  FileId,
  FileTree,
  FileTreeFile,
  Files,
} from '../../types';
import { getFileTree } from '../getFileTree';
import { sortFileTree } from '../sortFileTree';
import { disableSettings } from '../featureFlags';
import { SplitPaneResizeContext } from '../SplitPaneResizeContext';
import { Listing } from './Listing';
import './styles.scss';

export const Sidebar = ({
  createFile,
  files,
  handleRenameFileClick,
  handleDeleteFileClick,
  handleFileClick,
  setIsSettingsOpen,
  isDirectoryOpen,
  toggleDirectory,
}: {
  files: Files;
  createFile?: (name: string) => void;
  handleRenameFileClick?: (
    fileId: FileId,
    newName: string,
  ) => void;
  handleDeleteFileClick?: (
    fileId: FileId,
    event: React.MouseEvent,
  ) => void;
  handleFileClick?: (fileId: FileId) => void;
  setIsSettingsOpen?: (isSettingsOpen: boolean) => void;
  isDirectoryOpen?: (path: string) => boolean;
  toggleDirectory?: (path: string) => void;
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

  return (
    <div
      className="vz-sidebar"
      style={{ width: codeEditorWidth + 'px' }}
    >
      <div className="files">
        <div className="full-box">
          <div>
            <a className="link-name" href="#">
              Files
            </a>
          </div>
          <div>
            <i
              className="bx bxs-file-plus new-btn"
              style={{ color: '#dbdde1' }}
              onClick={() => createFile}
            ></i>
          </div>
        </div>
        {fileTree
          ? fileTree.children.map((entity) => {
              const { fileId } = entity as FileTreeFile;
              const { path } = entity as FileTree;
              const key = fileId ? fileId : path;
              return (
                <Listing
                  entity={entity}
                  key={key}
                  handleRenameFileClick={
                    handleRenameFileClick
                  }
                  handleDeleteFileClick={
                    handleDeleteFileClick
                  }
                  handleFileClick={handleFileClick}
                  isDirectoryOpen={isDirectoryOpen}
                  toggleDirectory={toggleDirectory}
                />
              );
            })
          : null}
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
