import { disableSettings } from '../featureFlags';
import { File } from './File';
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
              className="bx bxs-file-plus newBTN"
              style={{ color: '#dbdde1' }}
              onClick={createFile}
            ></i>
          </div>
        </div>
      </div>
      {data
        ? Object.keys(data).map((key) => (
            <File
              key={key}
              fileId={key}
              name={data[key].name}
              renameFile={renameFile}
              handleDeleteFileClick={handleDeleteFileClick}
              handleFileClick={handleFileClick}
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
