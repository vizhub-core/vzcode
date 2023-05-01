import { useMemo } from 'react';
import { getFileTree } from '../getFileTree';
import { disableSettings } from '../featureFlags';
import { File } from './File';
import { Directory } from './Directory';

import './styles.css';

export const Sidebar = ({
  createFile,
  data,
  renameFile,
  handleDeleteFileClick,
  handleFileClick,
  setSettings,
  settings,
}) => {
  // console.log(data);
  const fileTree = useMemo(() => (data ? getFileTree(data) : null), [data]);
  console.log(fileTree);

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
        ? fileTree.children.map(({ name, fileId, file }) =>
            file ? (
              <File
                key={fileId}
                fileId={fileId}
                name={name}
                renameFile={renameFile}
                handleDeleteFileClick={handleDeleteFileClick}
                handleFileClick={handleFileClick}
              />
            ) : (
              <Directory key={name} name={name} />
            )
          )
        : null}
      {disableSettings ? null : (
        <div className="settings" onClick={() => setSettings(!settings)}>
          Settings
        </div>
      )}
    </div>
  );
};
