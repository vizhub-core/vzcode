import { useCallback, useMemo } from 'react';
import { FileId } from '../../types';

// Supports adding the file's containing folder to the tab name
const fileNameSplit = (fileName: string) => {
  const split = fileName.split('/');
  if (split.length === 1) return split[split.length - 1];
  return (
    split[split.length - 2] + '/' + split[split.length - 1]
  );
};

export const Tab = ({
  fileId,
  isTransient,
  isActive,
  setActiveFileId,
  closeTabs,
  fileName,
}: {
  fileId: FileId;
  isTransient: boolean;
  isActive: boolean;
  setActiveFileId: (fileId: FileId) => void;
  closeTabs: (fileIds: FileId[]) => void;
  fileName: string;
}) => {
  const handleCloseClick = useCallback(
    (event: React.MouseEvent) => {
      // Stop propagation so that the outer listener doesn't fire.
      event.stopPropagation();

      closeTabs([fileId]);
    },
    [closeTabs, fileId],
  );

  const tabName = useMemo(
    () => fileNameSplit(fileName),
    [fileName],
  );

  return (
    <div
      className={`tab ${isActive ? 'active' : ''} ${
        isTransient ? 'transient' : ''
      }`}
      onClick={() => {
        setActiveFileId(fileId);
      }}
    >
      {tabName}
      <div
        // className={isActive ? 'bx bx-x tab-close' : ''}
        className={'bx bx-x tab-close'}
        onClick={handleCloseClick}
      ></div>
    </div>
  );
};
