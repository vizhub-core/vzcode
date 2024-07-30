import { useCallback, useContext, useMemo } from 'react';
import type { FileTree, FileTreeFile } from '../../types';
import { DirectoryArrowSVG } from '../Icons';
import { VZCodeContext } from '../VZCodeContext';
import { Item } from './Item';
import { Listing } from './Listing';

export const DirectoryListing = ({
  name,
  path,
  children,
  handleFileClick,
  handleFileDoubleClick,
}: {
  name: string;
  path: string;
  children: Array<FileTree | FileTreeFile>;
  handleFileClick: (fileId: string) => void;
  handleFileDoubleClick: (fileId: string) => void;
}) => {
  const {
    renameDirectory,
    deleteDirectory,
    isDirectoryOpen,
    toggleDirectory,
    sidebarPresenceIndicators,
  } = useContext(VZCodeContext);

  const handleClick = useCallback(() => {
    toggleDirectory(path);
  }, [toggleDirectory, path]);

  const handleDeleteClick = useCallback(() => {
    deleteDirectory(path);
  }, [deleteDirectory, path]);

  const handleRenameClick = useCallback(
    (newName: string) => {
      renameDirectory(path, name, newName);
    },
    [renameDirectory, path, name],
  );

  const isOpen = useMemo(
    () => isDirectoryOpen(path),
    [isDirectoryOpen, path],
  );

  return (
    <>
      <Item
        id={path}
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
        <div className="name">{name}</div>
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
                handleFileClick={handleFileClick}
                handleFileDoubleClick={
                  handleFileDoubleClick
                }
              />
            );
          })}
        </div>
      ) : null}
    </>
  );
};
