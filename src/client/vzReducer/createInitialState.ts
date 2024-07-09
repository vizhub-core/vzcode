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
  tabList: [],
  activeFileId: null,
  theme: defaultTheme,
  search: { pattern: '', results: {} },
  isSearchOpen: false,
  isSettingsOpen: false,
  isDocOpen: false,
  editorWantsFocus: false,
  username: initialUsername,
  enableAutoFollow: false,
});
