import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EditSVG, TrashSVG } from '../Icons';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import './item.css';

const enableRenameDirectory = false;

export const Item = ({
  name,
  children,
  handleClick,
  handleDoubleClick,
  handleRenameClick,
  handleDeleteClick,
  isDirectory = false,
  isActive = false,
  renameFileTooltipText = 'Rename File',
  deleteFileTooltipText = isDirectory ? 'Delete Directory' : 'Delete File',
}: {
  name: string;
  children: React.ReactNode;
  handleClick: (event: React.MouseEvent) => void;
  handleDoubleClick?: (event: React.MouseEvent) => void;
  handleRenameClick: (newName: string) => void;
  handleDeleteClick: () => void;
  isDirectory?: boolean;
  isActive?: boolean;
  renameFileTooltipText?: string;
  deleteFileTooltipText?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isRenameToolTipVisible, setIsRenameToolTipVisible] = useState(false);
  const [isDeleteToolTipVisible, setIsDeleteToolTipVisible] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        setIsRenaming(false);
      } else if (event.key === 'Enter') {
        renameInputRef.current.blur();
      }
    },
    [],
  );

  const onBlur = useCallback(() => {
    setIsRenaming(false);
    if (renameInputRef.current.value.trim() === '') {
      setShowModal(true);
    } else {
      handleRenameClick(renameInputRef.current.value);
    }
  }, [handleRenameClick]);

  const handleRenameIconClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      setIsRenaming(!isRenaming);
      setRenameValue(name);
    },
    [name, isRenaming],
  );

  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current.focus();
    }
  }, [isRenaming]);

  const handleModalOpen = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      setShowModal(true);
    },
    [],
  );

  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleConfirmModal = useCallback(
    (event: React.MouseEvent | undefined) => {
      event?.stopPropagation();
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

  const onChange = useCallback(() => {
    setRenameValue(renameInputRef.current.value);
  }, []);

  const [isRenameToolTipHovered, setIsRenameToolTipHovered] = useState(false);
  const [isDeleteTooltipHovered, setIsDeleteTooltipHovered] = useState(false);

  return (
    <div
      className={`file-or-directory user-select-none ${isActive ? 'active-file' : ''}`}
      onClick={isRenaming ? null : handleClick}
      onDoubleClick={isRenaming || !handleDoubleClick ? null : handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="name">
        {isRenaming ? (
          <input
            className="rename-input"
            ref={renameInputRef}
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

      {isHovered && !isRenaming && (
        <div className="utils tooltip-container">
          {isRenameToolTipHovered && (isDirectory ? enableRenameDirectory : true) && (
            <div className="tooltip">{renameFileTooltipText}</div>
          )}
          {isDeleteTooltipHovered && (
            <div className="tooltip">{deleteFileTooltipText}</div>
          )}
          {(isDirectory ? enableRenameDirectory : true) && (
            <i
              onClick={handleRenameIconClick}
              className="icon-button icon-button-dark"
              onMouseEnter={() => setIsRenameToolTipHovered(true)}
              onMouseLeave={() => setIsRenameToolTipHovered(false)}
            >
              <EditSVG />
            </i>
          )}
          <i
            onClick={handleModalOpen}
            className="icon-button icon-button-dark"
            onMouseEnter={() => setIsDeleteTooltipHovered(true)}
            onMouseLeave={() => setIsDeleteTooltipHovered(false)}
          >
            <TrashSVG />
          </i>
        </div>
      )}

      <DeleteConfirmationModal
        show={showModal}
        onClose={handleModalClose}
        onConfirm={handleConfirmModal}
        isDirectory={isDirectory}
        name={name}
      />
    </div>
  );
};
