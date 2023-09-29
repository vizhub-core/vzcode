import { useCallback, useMemo } from 'react';
import { Item } from './Item';
import { Listing } from './Listing';
import { DirectoryArrowSVG } from './DirectoryArrowSVG';
import { FileTree, FileTreeFile } from '../../types';

export const DirectoryListing = ({
  name,
  path,
  children,
  handleRenameFileClick,
  handleDeleteFileClick,
  handleFileClick,
  isDirectoryOpen,
  toggleDirectory,
}: {
  name: string;
  path: string;
  children: Array<FileTree | FileTreeFile>;
  handleRenameFileClick: (fileId: string) => void;
  handleDeleteFileClick: (fileId: string) => void;
  handleFileClick: (fileId: string) => void;
  isDirectoryOpen: (path: string) => boolean;
  toggleDirectory: (path: string) => void;
}) => {
  const handleClick = useCallback(() => {
    toggleDirectory(path);
  }, [toggleDirectory]);

  const handleDeleteClick = useCallback(() => {
    handleDeleteFileClick(path);
  }, [path, handleDeleteFileClick]);

  const handleRenameClick = useCallback(() => {
    console.log('TODO handleRenameDirectoryClick');
  }, []);

  const isOpen = useMemo(
    () => isDirectoryOpen(path),
    [isDirectoryOpen, path],
  );

  return (
    <>
      <Item
        handleClick={handleClick}
        handleDeleteClick={handleDeleteClick}
        handleRenameClick={handleRenameClick}
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
                handleRenameFileClick={
                  handleRenameFileClick
                }
                handleDeleteFileClick={
                  handleDeleteFileClick
                }
                handleFileClick={handleFileClick}
                isDirectoryOpen={isDirectoryOpen}
                toggleDirectory={toggleDirectory}
              />
            );
          })}
        </div>
      ) : null}
    </>
  );
};
