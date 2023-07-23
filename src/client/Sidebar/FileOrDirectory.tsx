import { File } from './File';
import { Directory } from './Directory';
import { FileId, FileTree, FileTreeFile } from '../../types';

export const FileOrDirectory = ({
  entity,
  handleRenameFileClick,
  handleDeleteFileClick,
  handleFileClick,
  openDirectories,
  toggleDirectory,
}: {
  entity: FileTree | FileTreeFile;
  handleRenameFileClick: (fileId: FileId) => void;
  handleDeleteFileClick: (fileId: FileId, event: React.MouseEvent) => void;
  handleFileClick: (fileId: FileId) => void;
  openDirectories: { [path: string]: boolean };
  toggleDirectory: (path: string) => void;
}) => {
  const { name, file, fileId } = entity as FileTreeFile;
  const { path, children } = entity as FileTree;
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
