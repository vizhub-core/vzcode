import { useState, useCallback } from 'react';

function FileItem(props) {
  const {
    key,
    data,
    setActiveFileId,
    setTabList,
    tabList,
    renameFile,
    deleteFile,
  } = props;
  const [utils, setUtils] = useState(false);
  return (
    <div
      className="full-Box"
      onClick={() => {
        setActiveFileId(key);
        if (!tabList.includes(key)) {
          setTabList([...tabList, key]);
        }
      }}
      onMouseEnter={() => {
        setUtils(true);
      }}
      onMouseLeave={() => {
        setUtils(false);
      }}
    >
      <div>
        <a className="name">{data[key].name}</a>
      </div>
      <div className={utils ? 'utils' : 'noUtils'}>
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
          onClick={() => {
            deleteFile(key);
          }}
        ></i>
      </div>
    </div>
  );
}

export default FileItem;
