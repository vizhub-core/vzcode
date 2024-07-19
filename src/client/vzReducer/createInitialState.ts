import { VZState } from '.';
import { Username } from '../../types';
import { ThemeLabel } from '../themes';

export const createInitialState = ({
  defaultTheme,
  initialUsername = 'Anonymous',
}: {
  defaultTheme: ThemeLabel;
  initialUsername?: Username;
}): VZState => ({
  pane: {
    id: 'root',
    type: 'leafPane',
    tabList: [],
    activeFileId: null,
  },
  activePaneId: 'root',
  theme: defaultTheme,
  search: { pattern: '', results: {}, focused: false },
  isSearchOpen: false,
  isSettingsOpen: false,
  isDocOpen: false,
  editorWantsFocus: false,
  username: initialUsername,
  enableAutoFollow: false,
});
