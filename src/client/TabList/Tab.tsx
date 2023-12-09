import React, { useCallback } from 'react';
import type { FileId } from '../../types';

export const Tab = ({
  fileId,
  index,
  isActive,
  setActiveFileId,
  closeTabs,
  fileName,
  onDragStart,
  onDrop,
}: {
  fileId: FileId;
  index: number;
  isActive: boolean;
  setActiveFileId: (fileId: FileId) => void;
  closeTabs: (fileIds: FileId[]) => void;
  fileName: string;
  onDragStart: () => void;
  onDrop: () => void;
}) => {
  const handleClick = useCallback(() => {
    setActiveFileId(fileId);
  }, [fileId, setActiveFileId]);

  const handleCloseClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      closeTabs([fileId]);
    },
    [closeTabs, fileId],
  );

  const tabName = fileName; // Assuming fileName is the display name of the tab

  return (
    <div
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      draggable="true"
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {tabName}
      <div
        className={'bx bx-x tab-close'}
        onClick={handleCloseClick}
      ></div>
    </div>
  );
};

export default Tab;
