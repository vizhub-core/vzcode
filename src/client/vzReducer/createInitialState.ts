import { VZState } from '.';
import { ThemeLabel } from '../themes';

export const createInitialState = ({
  defaultTheme,
  initialUsername,
}: {
  defaultTheme: ThemeLabel;
  initialUsername?: string;
}): VZState => ({
  tabList: [],
  activeFileId: null,
  theme: defaultTheme,
  isSettingsOpen: false,
  editorWantsFocus: false,
  username: initialUsername || '',
});
