import { useCallback } from 'react';
import { Item } from './Item';
import { FileId } from '../../types';

export const FileListing = ({
  name,
  fileId,
  renameFile,
  deleteFile,
  handleFileClick,
  isActive,
}: {
  name: string;
  fileId: FileId;
  renameFile: (fileId: FileId, newName: string) => void;
  deleteFile: (fileId: FileId) => void;
  handleFileClick: (fileId: FileId) => void;
  isActive: boolean;
}) => {
  const handleClick = useCallback(() => {
    handleFileClick(fileId);
  }, [fileId, handleFileClick]);

  const handleDeleteClick = useCallback(() => {
    deleteFile(fileId);
  }, [fileId, deleteFile]);

  const handleRenameClick = useCallback(
    (newName: string) => {
      renameFile(fileId, newName);
    },
    [fileId, renameFile],
  );

  return (
    <Item
      name={name}
      handleClick={handleClick}
      handleDeleteClick={handleDeleteClick}
      handleRenameClick={handleRenameClick}
      isActive={isActive}
    >
      {name}
    </Item>
  );
};
