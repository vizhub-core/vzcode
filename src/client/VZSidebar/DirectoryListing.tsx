import { useCallback, useMemo, useState } from 'react';
import { Item } from './Item';
import { Listing } from './Listing';
import { DirectoryArrowSVG } from './DirectoryArrowSVG';
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
  const [isRenaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(name);

  const handleClick = useCallback(() => {
    toggleDirectory(path);
  }, [toggleDirectory, path]);

  const handleDeleteClick = useCallback(() => {
    deleteDirectory(path);
  }, [deleteDirectory, path]);

  const handleRenameClick = useCallback(() => {
    if (isRenaming) {
      // Renames the directory and propagate changes to children
      renameFile(path, newName);
      updateChildrenPaths(children, path, newName);
      setRenaming(false);
    } else {
      setRenaming(true);
    }
  }, [isRenaming, path, newName, renameFile, children]);

  const updateChildrenPaths = (
    children: Array<FileTree | FileTreeFile>,
    parentPath: string,
    newParentName: string,
  ) => {
    children.forEach((entity) => {
      if ('path' in entity) {
        const childPath = entity.path;
        const newPath = childPath.replace(
          parentPath,
          newParentName,
        );
        renameFile(childPath, newPath);
        updateChildrenPaths(
          entity.children || [],
          childPath,
          newPath,
        );
      }
    });
  };

  const isOpen = useMemo(
    () => isDirectoryOpen(path),
    [isDirectoryOpen, path],
  );

  return (
    <>
      <Item
        name={
          isRenaming ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRenameClick();
              }}
            >
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button type="submit">Rename</button>
            </form>
          ) : (
            name
          )
        }
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
