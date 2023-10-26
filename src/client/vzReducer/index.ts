import { FileId } from '../../types';
import { ThemeLabel } from '../themes';
import { closeTabsReducer } from './closeTabsReducer';
import { openTabReducer } from './openTabReducer';
import { setActiveFileIdReducer } from './setActiveFileIdReducer';
import { setIsSettingsOpenReducer } from './setIsSettingsOpenReducer';
import { setThemeReducer } from './setThemeReducer';
import { editorNoLongerWantsFocusReducer } from './editorNoLongerWantsFocusReducer';

export { createInitialState } from './createInitialState';

// The shape of the state managed by the reducer.
export type VZState = {
  // The list of open tabs.
  tabList: Array<TabState>;

  // The ID of the file that is currently active.
  // Invariant: `activeFileId` is always in `tabList`.
  activeFileId: FileId | null;

  // The theme that is currently active.
  theme: ThemeLabel;

  // True to show the settings modal.
  isSettingsOpen: boolean;

  // True if the editor should focus on the next render.
  editorWantsFocus: boolean;
};

// The shape of the actions that can be dispatched to the reducer.
export type VZAction =
  // `set_active_file_id`
  //  * Sets the active file ID.
  | { type: 'set_active_file_id'; activeFileId: FileId }

  // `open_tab`
  //  * Opens a tab.
  //  * Also serves to change an already open transient tab to persistent.
  | {
      type: 'open_tab';
      fileId: FileId;
      isTransient: boolean;
    }

  // `close_tabs`
  //  * Closes a set of tabs.
  | { type: 'close_tabs'; fileIdsToClose: Array<FileId> }

  // `set_theme`
  //  * Sets the theme.
  | { type: 'set_theme'; themeLabel: ThemeLabel }

  // `set_is_settings_open`
  //  * Sets whether the settings modal is open.
  | { type: 'set_is_settings_open'; value: boolean }

  // `editor_no_longer_wants_focus`
  //  * Sets `editorWantsFocus` to `false`.
  | { type: 'editor_no_longer_wants_focus' };

// Representation of an open tab.
export type TabState = {
  // `fileId`
  // The ID of the file that the tab represents.
  fileId: FileId;

  // `isTransient`
  // Represents whether the tab is temporary or persistent.
  //  * `true` if the tab is temporary, meaning its text
  //    appears as italic, and it will be automatically
  //    closed when the user switches to another file.
  //    If `true` and the tab is opened, the editor will not focus.
  //  * `false` if the tab is persistent, meaning its text
  //    appears as normal, and it will not be automatically
  //    closed when the user switches to another file.
  //    If `false` and the tab is opened, the editor will focus.
  isTransient: boolean;
};

const reducers = [
  setActiveFileIdReducer,
  openTabReducer,
  closeTabsReducer,
  setThemeReducer,
  setIsSettingsOpenReducer,
  editorNoLongerWantsFocusReducer,
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
