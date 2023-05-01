import { useState, useCallback } from 'react';

export const Item = ({
  children,
  handleClick,
  handleRenameClick,
  handleDeleteClick,
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
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={isHovered ? 'hover-name' : 'name'}>{children}</div>
      {isHovered ? (
        <div className="utils">
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
      ) : null}
    </div>
  );
};
