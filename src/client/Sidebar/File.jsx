import { useCallback } from 'react';
import { Item } from './Item';

export const File = ({
  name,
  fileId,
  renameFile,
  handleDeleteFileClick,
  handleFileClick,
}) => {
  const handleClick = useCallback(() => {
    handleFileClick(fileId);
  }, [fileId, handleFileClick]);

  const handleDeleteClick = useCallback(() => {
    handleDeleteFileClick(fileId);
  }, [fileId]);

  const handleRenameClick = useCallback(() => {
    renameFile(fileId);
  }, [fileId]);

  return (
    <Item
      handleClick={handleClick}
      handleDeleteClick={handleDeleteClick}
      handleRenameClick={handleRenameClick}
    >
      {name}
    </Item>
  );
};
