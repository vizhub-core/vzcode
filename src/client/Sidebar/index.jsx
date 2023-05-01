import { disableSettings } from '../featureFlags';
import { File } from './File';
import './styles.css';

export const Sidebar = ({
  createFile,
  data,
  setActiveFileId,
  tabList,
  setTabList,
  renameFile,
  handleDeleteFileClick,
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
              name={data[key].name}
              setActiveFileId={setActiveFileId}
              tabList={tabList}
              setTabList={setTabList}
              renameFile={renameFile}
              handleDeleteFileClick={handleDeleteFileClick}
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
