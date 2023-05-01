import { useState, useCallback } from 'react';

export const File = ({
  name,
  fileId,
  renameFile,
  handleDeleteFileClick,
  handleFileClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleClick = useCallback(() => {
    handleFileClick(fileId);
  }, [fileId, handleFileClick]);

  const handleDeleteClick = useCallback(() => {
    handleDeleteFileClick(fileId);
  }, [fileId]);

  const handleRenameClick = useCallback(() => {
    renameFile(fileId);
  }, [fileId]);

  return (
    <div
      className="full-box file"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={isHovered ? 'hover-name' : 'name'}>{name}</div>
      <div className={isHovered ? 'utils' : 'noUtils'}>
        <i
          className="bx bxs-edit utilities"
          style={{ color: '#abdafb' }}
          onClick={handleRenameClick}
        ></i>
        <i
          className="bx bx-trash"
          style={{ color: '#eb336c' }}
          onClick={handleDeleteClick}
        ></i>
      </div>
    </div>
  );
};
