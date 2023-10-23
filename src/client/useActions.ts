import { useCallback } from 'react';
import { ThemeLabel } from './themes';
import { FileId } from '../types';
import { VZAction } from './reducer';

// This is a custom hook that returns a set of functions
// that can be used to dispatch actions to the reducer.
export const useActions = (
  dispatch: (action: VZAction) => void,
) => {
  const setActiveFileId = useCallback(
    (activeFileId: FileId) => {
      dispatch({
        type: 'set_active_file_id',
        activeFileId,
      });
    },
    [dispatch],
  );

  const openTab = useCallback(
    (fileId: FileId) => {
      dispatch({
        type: 'open_tab',
        fileId,
      });
    },
    [dispatch],
  );

  const closeTabs = useCallback(
    (idsToDelete: Array<FileId>) => {
      dispatch({
        type: 'close_tabs',
        idsToDelete,
      });
    },
    [dispatch],
  );

  const setTheme = useCallback(
    (themeLabel: ThemeLabel) => {
      dispatch({
        type: 'set_theme',
        themeLabel: themeLabel,
      });
    },
    [dispatch],
  );

  // True to show the settings modal.
  const setIsSettingsOpen = useCallback(
    (value: boolean) => {
      dispatch({
        type: 'set_is_settings_open',
        value: value,
      });
    },
    [dispatch],
  );

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, [setIsSettingsOpen]);

  return {
    setActiveFileId,
    openTab,
    closeTabs,
    setTheme,
    setIsSettingsOpen,
    closeSettings,
  };
};
