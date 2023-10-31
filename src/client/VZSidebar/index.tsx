import { useCallback, useContext, useMemo, useState, useRef, useEffect } from 'react';
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
import { CreateFileModal } from './CreateFileModal';

export const VZSidebar = ({
  createFile,
  files,
  handleRenameFileClick,
  handleDeleteFileClick,
  handleFileClick,
  setIsSettingsOpen,
  isDirectoryOpen,
  toggleDirectory,
  activeFileId,
}: {
  files: Files;
  createFile?: (
    fileName : string,
  ) => void;
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


  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal's visibility
  const [initialFileName, setInitialFileName] = useState('Initial File Name');

  const handleCreateFile = () => {
    setIsModalOpen(true); 
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); 
  };

  const handleRename = (newFileName) => {
    createFile(newFileName)

    setIsModalOpen(false); 
  };


  return (
    <div
      className="vz-sidebar"
      style={{ width: codeEditorWidth + 'px' }}
    >
      <div className="files">
        <div className="full-box">
          <div className="sidebar-section-hint">Files</div>
          <div>
            <i
              className="bx bxs-file-plus new-btn"
              style={{ color: '#dbdde1' }}
              onClick={handleCreateFile}
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
                  activeFileId={activeFileId}
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
      <CreateFileModal
      show={isModalOpen}
      onClose={handleCloseModal}
      onRename={handleRename}
      initialFileName={initialFileName}
      />

    </div>
  );
};
