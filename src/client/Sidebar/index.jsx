import { useMemo } from 'react';
import { getFileTree } from '../getFileTree';
import { sortFileTree } from '../sortFileTree';
import { disableSettings } from '../featureFlags';
import { File } from './File';
import { Directory } from './Directory';

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

  // console.log(JSON.stringify(fileTree, null, 2));

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
        ? fileTree.children.map(({ name, path, fileId, file, children }) => {
            // console.log(file ? fileId : path);
            return file ? (
              <File
                key={fileId}
                fileId={fileId}
                name={name}
                handleRenameFileClick={handleRenameFileClick}
                handleDeleteFileClick={handleDeleteFileClick}
                handleFileClick={handleFileClick}
              />
            ) : (
              <Directory
                key={path}
                name={name}
                children={children}
                handleRenameFileClick={handleRenameFileClick}
                handleDeleteFileClick={handleDeleteFileClick}
                handleFileClick={handleFileClick}
              />
            );
          })
        : null}
      {disableSettings ? null : (
        <div className="settings" onClick={() => setSettings(!settings)}>
          Settings
        </div>
      )}
    </div>
  );
};
