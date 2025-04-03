import { useContext } from 'react';
import { VizFileId } from '@vizhub/viz-types';
import type { FileTree, FileTreeFile } from '../../types';
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
  handleFileClick: (fileId: VizFileId) => void;
  handleFileDoubleClick: (fileId: VizFileId) => void;
}) => {
  const { activePane, sidebarPresenceIndicators } =
    useContext(VZCodeContext);
  const { name, file, fileId } = entity as FileTreeFile;
  const { path, children } = entity as FileTree;

  const presence =
    sidebarPresenceIndicators?.filter(
      (indicator) => indicator.fileId === fileId,
    ) || [];

  return file ? (
    <FileListing
      fileId={fileId}
      name={name}
      handleFileClick={handleFileClick}
      handleFileDoubleClick={handleFileDoubleClick}
      isActive={fileId === activePane.activeFileId}
      presence={presence}
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
