import { useState, useCallback } from 'react';

export const File = ({
  key,
  name,
  setActiveFileId,
  tabList,
  setTabList,
  renameFile,
  handleDeleteFileClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      className="full-box file"
      onClick={() => {
        // TODO move this logic out of here
        setActiveFileId(key);
        if (!tabList.includes(key)) {
          setTabList([...tabList, key]);
        }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={isHovered ? 'hover-name' : 'name'}>{name}</div>
      <div className={isHovered ? 'utils' : 'noUtils'}>
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
  );
};
