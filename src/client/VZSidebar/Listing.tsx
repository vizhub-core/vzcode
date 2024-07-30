import { useContext } from 'react';
import type {
  FileId,
  FileTree,
  FileTreeFile,
} from '../../types';
import { VZCodeContext } from '../VZCodeContext';
import { DirectoryListing } from './DirectoryListing';
import { FileListing } from './FileListing';

// A "Listing" is a "FileListing" or a "DirectoryListing"
// that appears in the Sidebar.
export const Listing = ({
  entity,
  handleFileClick,
  handleFileDoubleClick,
}: {
  entity: FileTree | FileTreeFile;
  handleFileClick: (fileId: FileId) => void;
  handleFileDoubleClick: (fileId: FileId) => void;
}) => {
  const { activeFileId, sidebarPresenceIndicators } = useContext(VZCodeContext);
  const { name, file, fileId } = entity as FileTreeFile;
  const { path, children } = entity as FileTree;

  const presence = sidebarPresenceIndicators?.filter(indicator => indicator.fileId === fileId) || [];

  return file ? (
    <FileListing
      fileId={fileId}
      name={name}
      handleFileClick={handleFileClick}
      handleFileDoubleClick={handleFileDoubleClick}
      isActive={fileId === activeFileId}
      presence={ presence }
    />
  ) : (
    <DirectoryListing
      name={name}
      path={path}
      children={children}
      handleFileClick={handleFileClick}
      handleFileDoubleClick={handleFileDoubleClick}
    />
  );
};
