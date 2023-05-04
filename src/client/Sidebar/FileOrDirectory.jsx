import { File } from './File';
import { Directory } from './Directory';

export const FileOrDirectory = ({
  entity,
  handleRenameFileClick,
  handleDeleteFileClick,
  handleFileClick,
}) => {
  const { name, fileId, file, children } = entity;
  return file ? (
    <File
      fileId={fileId}
      name={name}
      handleRenameFileClick={handleRenameFileClick}
      handleDeleteFileClick={handleDeleteFileClick}
      handleFileClick={handleFileClick}
    />
  ) : (
    <Directory
      name={name}
      children={children}
      handleRenameFileClick={handleRenameFileClick}
      handleDeleteFileClick={handleDeleteFileClick}
      handleFileClick={handleFileClick}
    />
  );
};
