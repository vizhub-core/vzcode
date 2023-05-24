import { useCallback } from 'react';
import { Item } from './Item';
import { FileOrDirectory } from './FileOrDirectory';
import { DirectoryArrowSVG } from './DirectoryArrowSVG';

// TODO dynamically open and close
const isOpen = true;

export const Directory = ({
  name,
  children,
  handleRenameFileClick,
  handleDeleteFileClick,
  handleFileClick,
}) => {
  const handleClick = useCallback(() => {
    console.log('TODO handleDirectoryClick');
  }, []);

  const handleDeleteClick = useCallback(() => {
    console.log('TODO handleDeleteDirectoryClick');
  }, []);

  const handleRenameClick = useCallback(() => {
    console.log('TODO handleRenameDirectoryClick');
  }, []);

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
          style={{ rotate: `rotate(${isOpen ? 90 : 0}deg)` }}
        >
          <DirectoryArrowSVG />
        </div>
        {name}
      </Item>
      {children ? (
        <div className="indentation">
          {children.map((entity) => (
            <FileOrDirectory
              entity={entity}
              key={entity.fileId || entity.path}
              handleRenameFileClick={handleRenameFileClick}
              handleDeleteFileClick={handleDeleteFileClick}
              handleFileClick={handleFileClick}
            />
          ))}
        </div>
      ) : null}
    </>
  );
};
