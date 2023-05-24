import { useMemo } from 'react';
import { getFileTree } from '../getFileTree';
import { sortFileTree } from '../sortFileTree';
import { disableSettings } from '../featureFlags';
import { FileOrDirectory } from './FileOrDirectory';
import { useOpenDirectories } from './useOpenDirectories';

import './styles.css';

export const Sidebar = ({
  createFile,
  data,
  handleRenameFileClick,
  handleDeleteFileClick,
  handleFileClick,
  setSettings,
  settings,
}) => {
  const fileTree = useMemo(
    () => (data ? sortFileTree(getFileTree(data)) : null),
    [data]
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
      </div>
      {fileTree
        ? fileTree.children.map((entity) => (
            <FileOrDirectory
              entity={entity}
              key={entity.fileId || entity.path}
              handleRenameFileClick={handleRenameFileClick}
              handleDeleteFileClick={handleDeleteFileClick}
              handleFileClick={handleFileClick}
              openDirectories={openDirectories}
              toggleDirectory={toggleDirectory}
            />
          ))
        : null}
      {disableSettings ? null : (
        <div className="settings" onClick={() => setSettings(!settings)}>
          Settings
        </div>
      )}
    </div>
  );
};
