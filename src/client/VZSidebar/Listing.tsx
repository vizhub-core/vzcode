import { DirectoryListing } from './DirectoryListing';
import {
  FileId,
  FileTree,
  FileTreeFile,
  FileTreePath,
} from '../../types';
import { FileListing } from './FileListing';

// A "Listing" is a "FileListing" or a "DirectoryListing"
// that appears in the Sidebar.
export const Listing = ({
  entity,
  renameFile,
  deleteFile,
  deleteDirectory,
  handleFileClick,
  isDirectoryOpen,
  toggleDirectory,
  activeFileId,
}: {
  entity: FileTree | FileTreeFile;
  renameFile: (fileId: FileId, newName: string) => void;
  deleteFile: (fileId: FileId) => void;
  deleteDirectory: (path: FileTreePath) => void;
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
      renameFile={renameFile}
      deleteFile={deleteFile}
      handleFileClick={handleFileClick}
      isActive={fileId === activeFileId}
    />
  ) : (
    <DirectoryListing
      name={name}
      path={path}
      children={children}
      renameFile={renameFile}
      deleteFile={deleteFile}
      deleteDirectory={deleteDirectory}
      handleFileClick={handleFileClick}
      isDirectoryOpen={isDirectoryOpen}
      toggleDirectory={toggleDirectory}
      activeFileId={activeFileId}
    />
  );
};
