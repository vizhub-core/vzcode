import { useCallback, useContext } from 'react';
import { Item } from './Item';
import { FileId, PresenceIndicator } from '../../types';
import { VZCodeContext } from '../VZCodeContext';
import { FileTypeIcon } from './FileTypeIcon';
import { assignUserColor } from '../presenceColor';


const PresenceIndicators = ({
  presence,
}: {
  presence: PresenceIndicator[];
}) => {
  return (
    <div className="presence-indicators">
      {presence.map((indicator, index) => (
        <div key={index} className="presence-indicator"
          //style={{ backgroundColor: 'blue' }} // Hardcoded color for testing
          style={{ backgroundColor: assignUserColor(indicator.username) }}
          >
          {indicator.username[0]}{' '}
          {/* Display the first letter of the username */}
        </div>
      ))}
    </div>
  );
};

export const FileListing = ({
  name,
  fileId,
  handleFileClick,
  handleFileDoubleClick,
  isActive,
  presence,
}: {
  name: string;
  fileId: FileId;
  handleFileClick: (fileId: FileId) => void;
  handleFileDoubleClick: (fileId: FileId) => void;
  isActive: boolean;
  presence: PresenceIndicator[];
}) => {
  const { renameFile, deleteFile } =
    useContext(VZCodeContext);

  const handleClick = useCallback(() => {
    handleFileClick(fileId);
  }, [fileId, handleFileClick]);

  const handleDoubleClick = useCallback(() => {
    handleFileDoubleClick(fileId);
  }, [fileId, handleFileDoubleClick]);

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
      id={fileId}
      name={name}
      handleClick={handleClick}
      handleDoubleClick={handleDoubleClick}
      handleDeleteClick={handleDeleteClick}
      handleRenameClick={handleRenameClick}
      isActive={isActive}
    >
      <PresenceIndicators presence={presence} />
      <FileTypeIcon name={name} />
      {name}
    </Item>
  );
};
