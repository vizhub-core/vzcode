import { useCallback } from 'react';
import { Item } from './Item';

export const File = ({
  name,
  fileId,
  handleRenameFileClick,
  handleDeleteFileClick,
  handleFileClick,
}) => {
  const handleClick = useCallback(() => {
    handleFileClick(fileId);
  }, [fileId, handleFileClick]);

  const handleDeleteClick = useCallback(
    (event) => {
      handleDeleteFileClick(fileId, event);
    },
    [fileId]
  );

  const handleRenameClick = useCallback(() => {
    handleRenameFileClick(fileId);
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
