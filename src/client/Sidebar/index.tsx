import { useMemo } from 'react';
import { getFileTree } from '../getFileTree';
import { sortFileTree } from '../sortFileTree';
import { disableSettings } from '../featureFlags';
import { Listing } from './Listing';
import { useOpenDirectories } from './useOpenDirectories';

import './styles.scss';
import { FileId, Files } from '../../types';

export const Sidebar = ({
  createFile,
  files,
  handleRenameFileClick,
  handleDeleteFileClick,
  handleFileClick,
  setIsSettingsOpen,
  isSettingsOpen,
}: {
  files: Files;
  createFile?: () => void;
  handleRenameFileClick?: (fileId: FileId) => void;
  handleDeleteFileClick?: (fileId: FileId, event: React.MouseEvent) => void;
  handleFileClick?: (fileId: FileId) => void;
  setIsSettingsOpen?: (isSettingsOpen: boolean) => void;
  isSettingsOpen?: boolean;
}) => {
  const fileTree = useMemo(
    () => (files ? sortFileTree(getFileTree(files)) : null),
    [files]
  );

  const { openDirectories, toggleDirectory } = useOpenDirectories();

  return (
    <div className="vz-sidebar">
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
              onClick={createFile}
            ></i>
          </div>
        </div>
        {fileTree
          ? fileTree.children.map((entity) => (
              <Listing
                key={entity.fileId || entity.path}
                entity={entity}
                handleRenameFileClick={handleRenameFileClick}
                handleDeleteFileClick={handleDeleteFileClick}
                handleFileClick={handleFileClick}
                openDirectories={openDirectories}
                toggleDirectory={toggleDirectory}
              />
            ))
          : null}
      </div>
      {disableSettings ? null : (
        <div
          className="settings"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        >
          Settings
        </div>
      )}
    </div>
  );
};
