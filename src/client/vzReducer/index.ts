import {
  FileId,
  Pane,
  PaneId,
  SearchFileVisibility,
  SearchResults,
  ShareDBDoc,
  Username,
  VZCodeContent,
} from '../../types';
import { ThemeLabel } from '../themes';
import { closeTabsReducer } from './closeTabsReducer';
import { openTabReducer } from './openTabReducer';
import { setActiveFileIdReducer } from './setActiveFileIdReducer';
import {
  setActiveFileLeftReducer,
  setActiveFileRightReducer,
} from './setActiveFileLeftRightReducer';
import { setIsSettingsOpenReducer } from './setIsSettingsOpenReducer';
import { setIsDocOpenReducer } from './setIsDocOpenReducer';
import { setThemeReducer } from './setThemeReducer';
import { editorNoLongerWantsFocusReducer } from './editorNoLongerWantsFocusReducer';
import { setUsernameReducer } from './setUsernameReducer';
import {
  setIsSearchOpenReducer,
  setSearchReducer,
  setSearchResultsReducer,
  setSearchFileVisibilityReducer,
  toggleSearchFocusedReducer,
} from './searchReducer';
import { toggleAutoFollowReducer } from './toggleAutoFollowReducer';
export { createInitialState } from './createInitialState';

// The shape of the state managed by the reducer.
export type VZState = {
  // The state of the split pane (tree data structure).
  pane: Pane;

  // The id of the currently active pane.
  activePaneId: PaneId;

  // The theme that is currently active.
  theme: ThemeLabel;

  // Search pattern and most recent results based on the current pattern
  search: SearchResults;

  // True to show the search instead of files
  isSearchOpen: boolean;

  // True to show the settings modal.
  isSettingsOpen: boolean;

  isDocOpen: boolean;

  // True if the editor should focus on the next render.
  editorWantsFocus: boolean;

  // The username of the current user.
  username: Username;

  // True if "auto-follow" is enabled.
  // This is a feature that automatically scrolls the editor to the
  // currently active remote user's cursor position.
  enableAutoFollow: boolean;
};

// The shape of the actions that can be dispatched to the reducer.
export type VZAction =
  // `set_active_file_id`
  //  * Sets the active file ID.
  | { type: 'set_active_file_id'; activeFileId: FileId }

  // `set_active_file_left' 'set_active_file_right`
  //  * Sets the active file ID to be the tab directly to the left or right
  //  * of the currently active tab.
  | { type: 'set_active_file_left' }
  | { type: 'set_active_file_right' }

  // `open_tab`
  //  * Opens a tab.
  //  * Also serves to change an already open transient tab to persistent.
  | {
      type: 'open_tab';
      fileId: FileId;
      isTransient?: boolean;
    }

  // `close_tabs`
  //  * Closes a set of tabs.
  | {
      type: 'close_tabs';
      fileIdsToClose: Array<FileId>;
      // The pane id to close tabs from.
    }

  // `set_theme`
  //  * Sets the theme.
  | { type: 'set_theme'; themeLabel: ThemeLabel }

  // `set_is_settings_open`
  //  * Sets whether the settings modal is open.
  | { type: 'set_is_settings_open'; value: boolean }
  | { type: 'set_is_doc_open'; value: boolean }

  // `set_is_search_open`
  //  * Sets whether the search tab is open.
  | { type: 'set_is_search_open'; value: boolean }

  // `set_search`
  //  * Sets the current search pattern
  | { type: 'set_search'; value: string }

  // `set_search_results`
  //  * Sets the current search pattern
  | {
      type: 'set_search_results';
      files: ShareDBDoc<VZCodeContent>;
    }

  // `set_search_results_visibility`
  //  * Sets the visibility of a current search pattern file
  | {
      type: 'set_search_file_visibility';
      files: ShareDBDoc<VZCodeContent>;
      id: string;
      visibility: SearchFileVisibility;
    }

  // `toggle_search_focused`
  // * Toggles focused variable to trigger search input focus
  | { type: 'toggle_search_focused' }

  // `editor_no_longer_wants_focus`
  //  * Sets `editorWantsFocus` to `false`.
  | { type: 'editor_no_longer_wants_focus' }

  // `set_username`
  //  * Sets the username.
  | { type: 'set_username'; username: Username }

  // `toggle_auto_follow
  //  * Toggles the auto-follow feature.
  | { type: 'toggle_auto_follow' };

const reducers = [
  setActiveFileIdReducer,
  setActiveFileLeftReducer,
  setActiveFileRightReducer,
  openTabReducer,
  closeTabsReducer,
  setThemeReducer,
  setSearchReducer,
  setSearchResultsReducer,
  setSearchFileVisibilityReducer,
  toggleSearchFocusedReducer,
  setIsSearchOpenReducer,
  setIsSettingsOpenReducer,
  setIsDocOpenReducer,
  editorNoLongerWantsFocusReducer,
  setUsernameReducer,
  toggleAutoFollowReducer,
];

export const vzReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  reducers.reduce(
    (currentState, currentReducer) =>
      currentReducer(currentState, action),
    state,
  );
