import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useContext,
} from 'react';
import { ItemId } from '../../types';
import { EditSVG, TrashSVG } from '../Icons';
import { Tooltip, OverlayTrigger } from '../bootstrap';
import { VZCodeContext } from '../VZCodeContext';
import { FileTypeIcon } from './FileTypeIcon';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

const enableRenameDirectory = true;

export const Item = ({
  id,
  name,
  children,
  handleClick,
  handleDoubleClick,
  handleRenameClick,
  handleDeleteClick,
  isDirectory = false,
  isActive = false,
  renameFileTooltipText = isDirectory ? 'Rename Directory' : 'Rename File',
  deleteFileTooltipText = isDirectory ? 'Delete Directory' : 'Delete File',
}: {
  id: ItemId;
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
  const { hoveredItemId, setHoveredItemId } = useContext(VZCodeContext);

  // State Management
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const isHovered = hoveredItemId === id;

  // Ref for renaming input
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Hover Handlers
  const setIsHovered = useCallback(
    (hovered: boolean) => setHoveredItemId(hovered ? id : null),
    [id, setHoveredItemId],
  );

  // Rename Handlers
  const startRenaming = useCallback(() => {
    setIsRenaming(true);
    setRenameValue(name);
  }, [name]);

  const stopRenaming = useCallback(() => setIsRenaming(false), []);

  const handleRenameConfirm = useCallback(() => {
    if (renameInputRef.current?.value.trim()) {
      handleRenameClick(renameInputRef.current.value);
    } else {
      setShowModal(true);
    }
    stopRenaming();
  }, [handleRenameClick, stopRenaming]);

  // Delete Handlers
  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);
  const confirmDelete = useCallback(() => {
    handleDeleteClick();
    closeModal();
  }, [handleDeleteClick, closeModal]);

  // Input Handlers
  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        stopRenaming();
      } else if (event.key === 'Enter') {
        handleRenameConfirm();
      }
    },
    [handleRenameConfirm, stopRenaming],
  );

  const handleInputBlur = useCallback(() => {
    handleRenameConfirm();
  }, [handleRenameConfirm]);

  // Focus on the input field when renaming starts
  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current?.focus();
    }
  }, [isRenaming]);

  return (
    <div
      className={`file-or-directory user-select-none ${isActive ? 'active-file' : ''}`}
      onClick={!isRenaming ? handleClick : undefined}
      onDoubleClick={!isRenaming && handleDoubleClick ? handleDoubleClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="name">
        {isRenaming ? (
          <>
            <FileTypeIcon name={renameValue} />
            <input
              ref={renameInputRef}
              className="rename-input"
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
              aria-label="Rename file or directory"
            />
          </>
        ) : (
          children
        )}
      </div>
      {isHovered && !isRenaming && (
        <div className="utils" style={{ position: 'relative' }}>
          {enableRenameDirectory || !isDirectory ? (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{renameFileTooltipText}</Tooltip>}
            >
              <i
                className="icon-button icon-button-dark"
                onClick={(e) => {
                  e.stopPropagation();
                  startRenaming();
                }}
              >
                <EditSVG />
              </i>
            </OverlayTrigger>
          ) : null}
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{deleteFileTooltipText}</Tooltip>}
          >
            <i
              className="icon-button icon-button-dark"
              onClick={(e) => {
                e.stopPropagation();
                openModal();
              }}
            >
              <TrashSVG />
            </i>
          </OverlayTrigger>
        </div>
      )}
      {showModal && (
        <DeleteConfirmationModal
          show={showModal}
          onClose={closeModal}
          onConfirm={confirmDelete}
          isDirectory={isDirectory}
          name={name}
        />
      )}
    </div>
  );
};
