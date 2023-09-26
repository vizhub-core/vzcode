import { useCallback } from 'react';
import { Item } from './Item';
import { FileId } from '../../types';

export const FileListing = ({
  name,
  fileId,
  handleRenameFileClick,
  handleDeleteFileClick,
  handleFileClick,
}: {
  name: string;
  fileId: FileId;
  handleRenameFileClick: (
    fileId: FileId,
    newName: string,
  ) => void;
  handleDeleteFileClick: (
    fileId: FileId,
    event: React.MouseEvent,
  ) => void;
  handleFileClick: (fileId: FileId) => void;
}) => {
  const handleClick = useCallback(() => {
    handleFileClick(fileId);
  }, [fileId, handleFileClick]);

  const handleDeleteClick = useCallback(
    (event) => {
      handleDeleteFileClick(fileId);
    },
    [fileId, handleDeleteFileClick],
  );

  const handleRenameClick = useCallback(
    (newName) => {
      handleRenameFileClick(fileId, newName);
    },
    [fileId, handleRenameClick],
  );

  return (
    <Item
      handleClick={handleClick}
      handleDeleteClick={handleDeleteClick}
      handleRenameClick={handleRenameClick}
      isDir={false}
    >
      {name}
    </Item>
  );
};
