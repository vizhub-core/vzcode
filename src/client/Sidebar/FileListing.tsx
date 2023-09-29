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
    (event: React.MouseEvent) => {
      handleDeleteFileClick(fileId, event);
    },
    [fileId, handleDeleteFileClick],
  );

  const handleRenameClick = useCallback(
    (newName: string) => {
      handleRenameFileClick(fileId, newName);
    },
    [fileId, handleRenameFileClick],
  );

  return (
    <Item
        name={name}
        handleClick={handleClick}
        handleDeleteClick={handleDeleteClick}
        handleRenameClick={handleRenameClick}
      isDir={false}
    >
      {name}
    </Item>
  );
};
