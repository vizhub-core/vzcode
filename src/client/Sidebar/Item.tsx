import { useState, useCallback, useMemo } from 'react';
import { ConfirmationBox } from './ConfirmationBox';

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
  }, []);

  const onBlur = useCallback((event) => {
    if (event.target.value.trim() === '') {
      // setEditingValue(value);
      console.log('TODO: handle empty rename');
    } else {
      setIsRenaming(false);
      handleRenameClick(event.target.value);
    }
  }, []);
  const getDisplayMode = (renaming) =>
    isRenaming ? (
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
    );

  const displayMode = useMemo(
    (isRenaming) => getDisplayMode(isRenaming),
    [isRenaming, renameValue],
  );

  const [showModal, setShowModal] = useState(false);

  // Function to open the delete file confirmation modal
  const handleModalOpen = useCallback(() => {
    setShowModal(true);
  }, []);

  // Function to close the modal
  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  // Function to handle confirmation on modal
  const handleConfirmModal = useCallback(() => {
    setShowModal(false);
    handleDeleteClick();
  }, [handleDeleteClick]);

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
      onClick={isRenaming ? null : handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="name">{displayMode}</div>
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
            onClick={handleModalOpen}
          ></i>
        </div>
      ) : null}

      <ConfirmationBox
        show={showModal}
        onClose={handleModalClose}
        onConfirm={handleConfirmModal}
      />
    </div>
  );
};
