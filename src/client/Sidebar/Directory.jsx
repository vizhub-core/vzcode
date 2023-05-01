import { useCallback } from 'react';
import { Item } from './Item';

// TODO proper icons
const directoryClosedIcon = '>';

export const Directory = ({ name }) => {
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
    <Item
      name={name}
      handleClick={handleClick}
      handleDeleteClick={handleDeleteClick}
      handleRenameClick={handleRenameClick}
    >
      {directoryClosedIcon} {name}
    </Item>
  );
};
