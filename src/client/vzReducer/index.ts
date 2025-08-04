import {
  Pane,
  PaneId,
  PresenceIndicator,
  SearchFileVisibility,
  SearchResults,
  ShareDBDoc,
  Username,
} from '../../types';
import { VizFileId, VizContent } from '@vizhub/viz-types';
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
  setSearchLineVisibilityReducer,
  setSearchFocusedIndexReducer,
  toggleSearchFocusedReducer,
} from './searchReducer';
import {
  setIsAIChatOpenReducer,
  toggleAIChatFocusedReducer,
  setAIChatModeReducer,
} from './aiChatReducer';
import { toggleAutoFollowReducer } from './toggleAutoFollowReducer';
import { toggleAIGhostCompletionsReducer } from './toggleAIGhostCompletionsReducer';
import { updatePresenceIndicatorReducer } from './updatePresenceIndicatorReducer';
import { splitCurrentPaneReducer } from './splitCurrentPaneReducer';
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

  // True to show the AI chat instead of files
  isAIChatOpen: boolean;

  // True if the AI chat input should focus on the next render.
  aiChatFocused: boolean;

  // The current AI chat mode: 'ask' or 'edit'
  aiChatMode: 'ask' | 'edit';

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

  // True if AI ghost completions are enabled.
  enableAIGhostCompletions: boolean;

  // The list of remote users and which file they have open,
  // for presence display in the sidebar.
  sidebarPresenceIndicators: Array<PresenceIndicator>;
};

// The shape of the actions that can be dispatched to the reducer.
export type VZAction =
  // `set_active_file_id`
  //  * Sets the active file ID.
  | { type: 'set_active_file_id'; activeFileId: VizFileId }

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
      fileId: VizFileId;
      isTransient?: boolean;
    }

  // `close_tabs`
  //  * Closes a set of tabs.
  | {
      type: 'close_tabs';
      fileIdsToClose: Array<VizFileId>;
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

  // `set_is_ai_chat_open`
  //  * Sets whether the AI chat tab is open.
  | { type: 'set_is_ai_chat_open'; value: boolean }

  // `toggle_ai_chat_focused`
  // * Toggles focused variable to trigger AI chat input focus
  | { type: 'toggle_ai_chat_focused' }

  // `set_ai_chat_mode`
  // * Sets the AI chat mode (ask or edit)
  | { type: 'set_ai_chat_mode'; mode: 'ask' | 'edit' }

  // `set_search`
  //  * Sets the current search pattern
  | { type: 'set_search'; value: string }

  // `set_search_results`
  //  * Sets the current search pattern
  | {
      type: 'set_search_results';
      files: ShareDBDoc<VizContent>;
    }

  // `set_search_results_visibility`
  //  * Sets the visibility of a current search pattern file
  | {
      type: 'set_search_file_visibility';
      files: ShareDBDoc<VizContent>;
      id: string;
      visibility: SearchFileVisibility;
    }

  // `hide_search_results_line`
  //  * Hides a current search pattern file's specific matching line
  | {
      type: 'hide_search_results_line';
      files: ShareDBDoc<VizContent>;
      id: string;
      line: number;
    }

  // `set_active_search_index`
  //  * Sets focused (file) index and child focused (line) index for search results
  | {
      type: 'set_active_search_index';
      focusedIndex: number;
      childIndex: number;
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

  // `toggle_auto_follow`
  //  * Toggles the auto-follow feature.
  | { type: 'toggle_auto_follow' }

  // `toggle_ai_ghost_completions`
  //  * Toggles the AI ghost completions feature.
  | { type: 'toggle_ai_ghost_completions' }

  // `update_presence_indicator
  //  * Updates a single presence indicator
  | {
      type: 'update_presence_indicator';
      presenceIndicator: PresenceIndicator;
    }

  // `split_current_pane`
  | { type: 'split_current_pane' };

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
  setSearchLineVisibilityReducer,
  setSearchFocusedIndexReducer,
  toggleSearchFocusedReducer,
  setIsSearchOpenReducer,
  setIsAIChatOpenReducer,
  toggleAIChatFocusedReducer,
  setAIChatModeReducer,
  setIsSettingsOpenReducer,
  setIsDocOpenReducer,
  editorNoLongerWantsFocusReducer,
  setUsernameReducer,
  toggleAutoFollowReducer,
  toggleAIGhostCompletionsReducer,
  updatePresenceIndicatorReducer,
  splitCurrentPaneReducer,
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
