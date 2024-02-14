import { useCallback, useEffect } from 'react';

export const useKeyboardShortcuts = ({
  closeTabs,
  activeFileId,
  handleOpenCreateFileModal,
  setActiveFileLeft,
  setActiveFileRight,
}) => {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.altKey === true) {
        if (event.key === 'w') {
          closeTabs([activeFileId]);
        }
        if (event.key === 'n') {
          handleOpenCreateFileModal();
        }
        if (event.key === 'PageUp') {
          // Change the active tab to the previous one
          setActiveFileLeft();
        }
        if (event.key === 'PageDown') {
          // Change the active tab to the next one
          setActiveFileRight();
        }
      }
    },
    [
      handleOpenCreateFileModal,
      closeTabs,
      activeFileId,
      setActiveFileLeft,
      setActiveFileRight,
    ],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyPress,
      );
    };
  }, [handleKeyPress]);
};
