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
  isExpanded = false,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  entity: FileTree | FileTreeFile;
  handleFileClick: (fileId: FileId) => void;
  handleFileDoubleClick: (fileId: FileId) => void;
  isExpanded?: boolean;
  onDragStart: (itemId: string) => void;
  onDragOver: (event: React.DragEvent<Element>, itemId: string) => void;
  onDrop: (event: React.DragEvent<Element>, itemId: string) => void;
}) => {
  const { activePane, sidebarPresenceIndicators } = useContext(VZCodeContext);
  const { name, file, fileId } = entity as FileTreeFile;
  const { path, children } = entity as FileTree;

  const presence = sidebarPresenceIndicators?.filter(
    (indicator) => indicator.fileId === fileId,
  ) || [];

  const itemId = fileId || path;

  return file ? (
    <div
      className="sidebar-file-item"
      draggable
      onDragStart={() => onDragStart(itemId)}
      onDragOver={(event) => onDragOver(event, itemId)}
      onDrop={(event) => onDrop(event, itemId)}
    >
      <FileListing
        fileId={fileId}
        name={name}
        handleFileClick={handleFileClick}
        handleFileDoubleClick={handleFileDoubleClick}
        isActive={fileId === activePane.activeFileId}
        presence={presence}
      />
    </div>
  ) : (
    <div
      className="sidebar-file-item"
      draggable
      onDragStart={() => onDragStart(itemId)}
      onDragOver={(event) => onDragOver(event, itemId)}
      onDrop={(event) => onDrop(event, itemId)}
    >
      <DirectoryListing
        name={name}
        path={path}
        children={children}
        handleFileClick={handleFileClick}
        handleFileDoubleClick={handleFileDoubleClick}
        isExpanded={isExpanded}
      />
    </div>
  );
};
