import { FileId } from '../../types';
import { ThemeLabel } from '../themes';
import { closeTabsReducer } from './closeTabsReducer';
import { openTabReducer } from './openTabReducer';
import { setActiveFileIdReducer } from './setActiveFileIdReducer';
import { setIsSettingsOpenReducer } from './setIsSettingsOpenReducer';
import { setThemeReducer } from './setThemeReducer';

export { createInitialState } from './createInitialState';

export type VZState = {
  tabList: Array<TabState>;
  activeFileId: FileId | null;
  theme: ThemeLabel;
  isSettingsOpen: boolean;
};

export type VZAction =
  | { type: 'set_active_file_id'; activeFileId: FileId }
  | {
      type: 'open_tab';
      fileId: FileId;
      isTransient: boolean;
    }
  | { type: 'close_tabs'; fileIdsToClose: Array<FileId> }
  | { type: 'set_theme'; themeLabel: ThemeLabel }
  | { type: 'set_is_settings_open'; value: boolean };

// Representation of a tab.
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
