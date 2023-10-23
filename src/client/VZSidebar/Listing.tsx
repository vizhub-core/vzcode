import { DirectoryListing } from './DirectoryListing';
import {
  FileId,
  FileTree,
  FileTreeFile,
} from '../../types';
import { FileListing } from './FileListing';

// A "Listing" is a "FileListing" or a "DirectoryListing"
// that appears in the Sidebar.
export const Listing = ({
  entity,
  handleRenameFileClick,
  handleDeleteFileClick,
  handleFileClick,
  isDirectoryOpen,
  toggleDirectory,
  activeFileId,
}: {
  entity: FileTree | FileTreeFile;
  handleRenameFileClick: (
    fileId: FileId,
    newName: string,
  ) => void;
  handleDeleteFileClick: (
    fileId: FileId,
    event: React.MouseEvent,
  ) => void;
  handleFileClick: (fileId: FileId) => void;
  isDirectoryOpen: (path: string) => boolean;
  toggleDirectory: (path: string) => void;
  activeFileId: FileId;
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
      isActive={fileId === activeFileId}
    />
  ) : (
    <DirectoryListing
      name={name}
      path={path}
      children={children}
      handleRenameFileClick={handleRenameFileClick}
      handleDeleteFileClick={handleDeleteFileClick}
      handleFileClick={handleFileClick}
      isDirectoryOpen={isDirectoryOpen}
      toggleDirectory={toggleDirectory}
    />
  );
};
