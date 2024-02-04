import { useCallback, useMemo } from 'react';
import { Item } from './Item';
import { Listing } from './Listing';
import { DirectoryArrowSVG } from '../Icons';
import type {
  FileTree,
  FileTreeFile,
  FileTreePath,
} from '../../types';

export const DirectoryListing = ({
  name,
  path,
  children,
  renameFile,
  deleteFile,
  deleteDirectory,
  handleFileClick,
  handleFileDoubleClick,
  isDirectoryOpen,
  toggleDirectory,
  activeFileId,
}: {
  name: string;
  path: string;
  children: Array<FileTree | FileTreeFile>;
  renameFile: (fileId: string, newName: string) => void;
  deleteFile: (fileId: string) => void;
  deleteDirectory: (path: FileTreePath) => void;
  handleFileClick: (fileId: string) => void;
  handleFileDoubleClick: (fileId: string) => void;
  isDirectoryOpen: (path: string) => boolean;
  toggleDirectory: (path: string) => void;
  activeFileId: string;
}) => {
  const handleClick = useCallback(() => {
    toggleDirectory(path);
  }, [toggleDirectory, path]);

  const handleDeleteClick = useCallback(() => {
    deleteDirectory(path);
  }, [deleteDirectory, path]);

  const handleRenameClick = useCallback(() => {
    // https://github.com/vizhub-core/vzcode/issues/103
    console.log('TODO handleRenameDirectoryClick');
  }, []);

  const isOpen = useMemo(
    () => isDirectoryOpen(path),
    [isDirectoryOpen, path],
  );

  return (
    <>
      <Item
        name={name}
        handleClick={handleClick}
        handleDeleteClick={handleDeleteClick}
        handleRenameClick={handleRenameClick}
        isDirectory={true}
      >
        <div
          className="arrow-wrapper"
          style={{
            transform: `rotate(${isOpen ? 90 : 0}deg)`,
          }}
        >
          <DirectoryArrowSVG />
        </div>
        {name}
      </Item>
      {children && isOpen ? (
        <div className="indentation">
          {children.map((entity) => {
            const { fileId } = entity as FileTreeFile;
            const { path } = entity as FileTree;
            return (
              <Listing
                entity={entity}
                key={fileId || path}
                renameFile={renameFile}
                deleteFile={deleteFile}
                deleteDirectory={deleteDirectory}
                handleFileClick={handleFileClick}
                handleFileDoubleClick={
                  handleFileDoubleClick
                }
                isDirectoryOpen={isDirectoryOpen}
                toggleDirectory={toggleDirectory}
                activeFileId={activeFileId}
              />
            );
          })}
        </div>
      ) : null}
    </>
  );
};
