import {
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { ConfirmationBox } from './confirmationBox';

export const Item = ({
  children,
  handleClick,
  handleRenameClick,
  handleDeleteClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const [showModal, setShowModal] = useState(false);

  //Function to open the modal
  const handleModalOpen = useCallback(() => {
    setShowModal(true);
  }, []);

  //Function to close the modal
  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  //function to handle confirmation on modal
  const handleConfirmModal = useCallback(() => {
    setShowModal(false);
    handleDeleteClick();
  }, [handleDeleteClick]);

  //function to close Modal if anywhere else on the screen is clicked
  const outsideClickHandler = useCallback((ref) => {
    useEffect(() => {
      //check if clicked outside
      function handleClickOutside(event) {
        if (
          ref.current &&
          !ref.current.contains(event.target)
        ) {
          handleModalClose();
        }
      }
      document.addEventListener(
        'click',
        handleClickOutside,
      );
      return () => {
        document.removeEventListener(
          'click',
          handleClickOutside,
        );
      };
    }, [ref]);
  }, []);

  const wrapperRef = useRef(null);
  outsideClickHandler(wrapperRef);

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
            ref={wrapperRef}
            className="bx bx-trash"
            style={{ color: '#eb336c' }}
            onClick={handleModalOpen}
          ></i>
        </div>
      ) : null}

      {showModal ? (
        <ConfirmationBox
          show={showModal}
          onClose={handleModalClose}
          onConfirm={handleConfirmModal}
        />
      ) : null}
    </div>
  );
};
