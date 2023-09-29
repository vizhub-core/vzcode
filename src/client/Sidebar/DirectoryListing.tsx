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
  handleRenameFileClick: (
    fileId: string,
    newName: string,
  ) => void;
  handleDeleteFileClick: (
    fileId: string,
    event: React.MouseEvent,
  ) => void;
  handleFileClick: (fileId: string) => void;
  isDirectoryOpen: (path: string) => boolean;
  toggleDirectory: (path: string) => void;
}) => {
  const handleClick = useCallback(() => {
    toggleDirectory(path);
  }, [toggleDirectory]);

  const handleDeleteClick = useCallback((event) => {
    // https://github.com/vizhub-core/vzcode/issues/102
    handleDeleteFileClick(path,event);
  }, [handleDeleteFileClick,path]);

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
        isDir={true}
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
