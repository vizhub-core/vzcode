import { DirectoryListing } from './DirectoryListing';
import { FileId, FileTree, FileTreeFile } from '../../types';
import { FileListing } from './FileListing';

// A "Listing" is a "FileListing" or a "DirectoryListing"
// that appears in the Sidebar.
export const Listing = ({
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
    <FileListing
      fileId={fileId}
      name={name}
      handleRenameFileClick={handleRenameFileClick}
      handleDeleteFileClick={handleDeleteFileClick}
      handleFileClick={handleFileClick}
    />
  ) : (
    <DirectoryListing
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
