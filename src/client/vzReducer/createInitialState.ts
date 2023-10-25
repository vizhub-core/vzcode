import { VZState } from '.';
import { ThemeLabel } from '../themes';

export const createInitialState = (
  defaultTheme: ThemeLabel,
): VZState => ({
  tabList: [],
  activeFileId: null,
  theme: defaultTheme,
  isSettingsOpen: false,
});
