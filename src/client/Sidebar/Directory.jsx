import { useCallback } from 'react';
import { Item } from './Item';
import { FileOrDirectory } from './FileOrDirectory';
import { DirectoryArrowSVG } from './DirectoryArrowSVG';

export const Directory = ({
  name,
  path,
  children,
  handleRenameFileClick,
  handleDeleteFileClick,
  handleFileClick,
  openDirectories,
  toggleDirectory,
}) => {
  const handleClick = useCallback(() => {
    toggleDirectory(path);
  }, [toggleDirectory]);

  const handleDeleteClick = useCallback(() => {
    console.log('TODO handleDeleteDirectoryClick');
  }, []);

  const handleRenameClick = useCallback(() => {
    console.log('TODO handleRenameDirectoryClick');
  }, []);

  const isOpen = openDirectories[path];
  return (
    <>
      <Item
        name={name}
        handleClick={handleClick}
        handleDeleteClick={handleDeleteClick}
        handleRenameClick={handleRenameClick}
      >
        <div
          className="arrow-wrapper"
          style={{ transform: `rotate(${isOpen ? 90 : 0}deg)` }}
        >
          <DirectoryArrowSVG />
        </div>
        {name}
      </Item>
      {children && isOpen ? (
        <div className="indentation">
          {children.map((entity) => (
            <FileOrDirectory
              entity={entity}
              key={entity.fileId || entity.path}
              handleRenameFileClick={handleRenameFileClick}
              handleDeleteFileClick={handleDeleteFileClick}
              handleFileClick={handleFileClick}
              openDirectories={openDirectories}
              toggleDirectory={toggleDirectory}
            />
          ))}
        </div>
      ) : null}
    </>
  );
};
