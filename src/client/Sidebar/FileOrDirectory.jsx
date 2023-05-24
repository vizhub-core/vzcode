import { File } from './File';
import { Directory } from './Directory';

export const FileOrDirectory = ({
  entity,
  handleRenameFileClick,
  handleDeleteFileClick,
  handleFileClick,
  openDirectories,
  toggleDirectory,
}) => {
  const { name, path, fileId, file, children } = entity;
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
      path={path}
      children={children}
      handleRenameFileClick={handleRenameFileClick}
      handleDeleteFileClick={handleDeleteFileClick}
      handleFileClick={handleFileClick}
      openDirectories={openDirectories}
      toggleDirectory={toggleDirectory}
    />
  );
};
