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
  handleRenameFileClick: (fileId: FileId) => void;
  handleDeleteFileClick: (fileId: FileId, event: React.MouseEvent) => void;
  handleFileClick: (fileId: FileId) => void;
}) => {
  const handleClick = useCallback(() => {
    handleFileClick(fileId);
  }, [fileId, handleFileClick]);

  const handleDeleteClick = useCallback(
    (event) => {
      handleDeleteFileClick(fileId, event);
    },
    [fileId],
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
