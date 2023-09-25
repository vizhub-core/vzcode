import {
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { ConfirmationBox } from './ConfirmationBox';

export const Item = ({
  children,
  handleClick,
  handleRenameClick,
  handleDeleteClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

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
  }, []);

  return (
    <div
      className="full-box file-or-directory"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="name">{children}</div>
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
