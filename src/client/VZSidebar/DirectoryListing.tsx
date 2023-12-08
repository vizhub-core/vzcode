import { useCallback, useMemo, useState } from 'react';
import { Item } from './Item';
import { Listing } from './Listing';
import { DirectoryArrowSVG } from './DirectoryArrowSVG';

export const DirectoryListing = ({
  name,
  path,
  children,
  isDirectoryOpen,
  toggleDirectory,
  renameFile, // Assuming this function renames files/directories and updates the state
  deleteDirectory,
  activeFileId,
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
      // Renames the directory
      const newPath = path.replace(name, newName);
      renameFile(path, newPath);
      // Update paths for all children
      updateChildrenPaths(children, path, newPath);
      setRenaming(false);
    } else {
      setRenaming(true);
    }
  }, [
    isRenaming,
    path,
    name,
    newName,
    renameFile,
    children,
  ]);

  const updateChildrenPaths = useCallback(
    (children, parentPath, newParentPath) => {
      children.forEach((entity) => {
        if ('path' in entity) {
          const childPath = entity.path;
          const newPath = childPath.replace(
            parentPath,
            newParentPath,
          );
          renameFile(childPath, newPath);
          if (entity.children) {
            updateChildrenPaths(
              entity.children,
              childPath,
              newPath,
            );
          }
        }
      });
    },
    [renameFile],
  );

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
        // ... other props
      />
      {/* Render children if the directory is open */}
      {isOpen && <Listing items={children} />}
    </>
  );
};
