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
  // Tracks whether the mouse is hovering over the file or directory
  const [isHovered, setIsHovered] = useState(false);

  // Tracks whether the file is being renamed (inline text input)
  const [isRenaming, setIsRenaming] = useState(false);

  // Tracks the value of the input field when renaming
  const [renameValue, setRenameValue] = useState('');

  const onKeyDown = useCallback((event) => {
    // TODO make 'Escape' cancel the changes - do not commit the rename
    // https://github.com/vizhub-core/vzcode/issues/207
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.target.blur();
    }
  }, []);

  const onBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (event.target.value.trim() === '') {
        // setEditingValue(value);
        console.log('TODO: handle empty rename');
      } else {
        setIsRenaming(false);
        handleRenameClick(event.target.value);
      }
    },
    [handleRenameClick],
  );

  const [showModal, setShowModal] = useState(false);

  // Function to open the delete file confirmation modal
  const handleModalOpen = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      setShowModal(true);
    },
    [],
  );

  // Function to close the modal
  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  // Function to handle confirmation on modal
  const handleConfirmModal = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      setShowModal(false);
      handleDeleteClick();
    },
    [handleDeleteClick],
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRenameValue(event.target.value);
    },
    [],
  );

  return (
    <div
      className="full-box file-or-directory"
      onClick={isRenaming ? null : handleClick}
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
            onChange={onChange}
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
            onClick={(event: React.MouseEvent) => {
              event.stopPropagation();
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
