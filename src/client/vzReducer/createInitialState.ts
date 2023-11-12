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
  isSettingsOpen: false,
  editorWantsFocus: false,
  username: initialUsername,
});
