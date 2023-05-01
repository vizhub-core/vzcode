import { disableSettings } from '../featureFlags';
import './styles.css';

export const Sidebar = ({
  createFile,
  data,
  setActiveFileId,
  tabList,
  setTabList,
  utils,
  setUtils,
  renameFile,
  handleDeleteFileClick,
  setSettings,
  settings,
}) => {
  return (
    <div className="vz-sidebar">
      <div className="files">
        <div className="full-Box">
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
            <div className="file" key={key}>
              <div
                className="full-Box"
                onClick={() => {
                  setActiveFileId(key);
                  if (!tabList.includes(key)) {
                    setTabList([...tabList, key]);
                  }
                }}
                onMouseEnter={() => {
                  setUtils(key);
                }}
                onMouseLeave={() => {
                  setUtils(null);
                }}
              >
                <div className={utils === key ? 'hover-name' : 'name'}>
                  {data[key].name}
                </div>
                <div className={utils === key ? 'utils' : 'noUtils'}>
                  <i
                    className="bx bxs-edit utilities"
                    style={{ color: '#abdafb' }}
                    onClick={() => {
                      renameFile(key);
                    }}
                  ></i>
                  <i
                    className="bx bx-trash"
                    style={{ color: '#eb336c' }}
                    onClick={handleDeleteFileClick(key)}
                  ></i>
                </div>
              </div>
            </div>
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
