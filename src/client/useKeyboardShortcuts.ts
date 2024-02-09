import { useCallback, useEffect } from 'react';

export const useKeyboardShortcuts = ({
  closeTabs,
  activeFileId,
  handleOpenCreateFileModal,
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
        if (event.key === 'pageup') {
          // Change the active tab to the previous one
        }
        if (event.key === 'pagedown') {
          // Change the active tab to the next one
        }
      }
    },
    [handleOpenCreateFileModal, closeTabs, activeFileId],
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
