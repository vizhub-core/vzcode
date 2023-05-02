import { useCallback } from 'react';
import { Item } from './Item';
import { File } from './File';

// TODO proper icons
const directoryClosedIcon = '>';

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
        {directoryClosedIcon} {name}
      </Item>
      {children ? (
        <div className="indentation">
          {children.map(({ name, path, fileId, file, children }) => {
            // console.log(file ? fileId : path);
            // TODO remove this duplication
            return file ? (
              <File
                key={fileId}
                fileId={fileId}
                name={name}
                handleRenameFileClick={handleRenameFileClick}
                handleDeleteFileClick={handleDeleteFileClick}
                handleFileClick={handleFileClick}
              />
            ) : (
              <Directory
                key={path}
                name={name}
                children={children}
                handleRenameFileClick={handleRenameFileClick}
                handleDeleteFileClick={handleDeleteFileClick}
                handleFileClick={handleFileClick}
              />
            );
          })}
        </div>
      ) : null}
    </>
  );
};
