import { useState, useCallback } from 'react';

export const Item = ({
  name,
  children,
  handleClick,
  handleRenameClick,
  handleDeleteClick,
  isDir,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const [isRenaming, setIsRenaming] = useState(false);

  const [renameValue, setRenameValue] = useState('');

  const onKeyDown = useCallback((event) => {
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.target.blur();
    }
  });
  const onBlur = useCallback((event) => {
    if (event.target.value.trim() === '') {
      setEditingValue(value);
    } else {
      setIsRenaming(false);
      handleRenameClick(event.target.value);
    }
  });

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsRenaming(false);
  }, []);

  return (
    <div
      className="full-box file-or-directory"
      onClick={
        isRenaming?null:handleClick
      }
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="name">
        {isRenaming ? (
          <input
            type="text"
            aria-label="Field name"
            value={renameValue}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            onChange={(event) =>
              setRenameValue(event.target.value)
            }
          />
        ) : (
          children
        )}
      </div>
      {isHovered ? (
        <div className="utils">
          <i
            className="bx bxs-edit utilities"
            style={{ color: '#abdafb' }}
            onClick={() => {
              setIsRenaming(!isRenaming);
              setRenameValue(isDir ? name : children);
            }}
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
