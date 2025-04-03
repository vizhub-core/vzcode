import { useCallback } from 'react';
import { ThemeLabel } from './themes';
import {
  VizFileId,
  PresenceIndicator,
  SearchFileVisibility,
  ShareDBDoc,
  TabState,
  Username,
  VizContent,
} from '../types';
import { VZAction } from './vzReducer';

// This is a custom hook that returns a set of functions
// that can be used to dispatch actions to the reducer.
export const useActions = (
  dispatch: (action: VZAction) => void,
) => {
  const setActiveFileId = useCallback(
    (activeFileId: VizFileId) => {
      dispatch({
        type: 'set_active_file_id',
        activeFileId,
      });
    },
    [dispatch],
  );

  const setActiveFileLeft = useCallback(() => {
    dispatch({ type: 'set_active_file_left' });
  }, [dispatch]);

  const setActiveFileRight = useCallback(() => {
    dispatch({ type: 'set_active_file_right' });
  }, [dispatch]);

  const openTab = useCallback(
    (tabState: TabState): void => {
      dispatch({
        type: 'open_tab',
        fileId: tabState.fileId,
        isTransient: tabState.isTransient,
      });
    },
    [dispatch],
  );

  const closeTabs = useCallback(
    (fileIdsToClose: Array<VizFileId>) => {
      dispatch({
        type: 'close_tabs',
        fileIdsToClose,
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
  const setIsSearchOpen = useCallback(
    (value: boolean) => {
      dispatch({
        type: 'set_is_search_open',
        value: value,
      });
    },
    [dispatch],
  );

  // Update search pattern
  const setSearch = useCallback(
    (pattern: string) => {
      dispatch({
        type: 'set_search',
        value: pattern,
      });
    },
    [dispatch],
  );

  // Update search results based on current pattern
  const setSearchResults = useCallback(
    (files: ShareDBDoc<VizContent>) => {
      dispatch({
        type: 'set_search_results',
        files: files,
      });
    },
    [dispatch],
  );

  // Update search results file visibility based on current pattern
  const setSearchFileVisibility = useCallback(
    (
      files: ShareDBDoc<VizContent>,
      id: string,
      visibility: SearchFileVisibility,
    ) => {
      dispatch({
        type: 'set_search_file_visibility',
        files: files,
        id: id,
        visibility: visibility,
      });
    },
    [dispatch],
  );

  // Update search results file matching line visibility to be
  const setSearchLineVisibility = useCallback(
    (
      files: ShareDBDoc<VizContent>,
      id: string,
      line: number,
    ) => {
      dispatch({
        type: 'hide_search_results_line',
        files: files,
        id: id,
        line: line,
      });
    },
    [dispatch],
  );

  // Update search results active element
  const setSearchFocusedIndex = useCallback(
    (focusedIndex: number, childIndex: number) => {
      dispatch({
        type: 'set_active_search_index',
        focusedIndex: focusedIndex,
        childIndex: childIndex,
      });
    },
    [dispatch],
  );

  // Toggle the focused variable, which should focus the search input
  const toggleSearchFocused = useCallback(() => {
    dispatch({
      type: 'toggle_search_focused',
    });
  }, [dispatch]);

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

  const setIsDocOpen = useCallback(
    (value: boolean) => {
      dispatch({
        type: 'set_is_doc_open',
        value: value,
      });
    },
    [dispatch],
  );

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, [setIsSettingsOpen]);

  const closeDoc = useCallback(() => {
    setIsDocOpen(false);
  }, [setIsDocOpen]);

  const editorNoLongerWantsFocus = useCallback(() => {
    dispatch({
      type: 'editor_no_longer_wants_focus',
    });
  }, [dispatch]);

  const setUsername = useCallback(
    (username: Username) => {
      dispatch({
        type: 'set_username',
        username,
      });
    },
    [dispatch],
  );

  const toggleAutoFollow = useCallback(() => {
    dispatch({
      type: 'toggle_auto_follow',
    });
  }, [dispatch]);

  const updatePresenceIndicator = useCallback(
    (presenceIndicator: PresenceIndicator) => {
      dispatch({
        type: 'update_presence_indicator',
        presenceIndicator,
      });
    },
    [dispatch],
  );

  const splitCurrentPane = useCallback(() => {
    dispatch({
      type: 'split_current_pane',
    });
  }, [dispatch]);

  return {
    setActiveFileId,
    setActiveFileLeft,
    setActiveFileRight,
    openTab,
    closeTabs,
    setTheme,
    setIsSearchOpen,
    setSearch,
    setSearchResults,
    setSearchFileVisibility,
    setSearchLineVisibility,
    setSearchFocusedIndex,
    toggleSearchFocused,
    setIsSettingsOpen,
    setIsDocOpen,
    closeSettings,
    closeDoc,
    editorNoLongerWantsFocus,
    setUsername,
    toggleAutoFollow,
    updatePresenceIndicator,
    splitCurrentPane,
  };
};
