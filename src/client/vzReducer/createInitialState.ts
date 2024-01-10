import { TabState, VZState } from '.';
import { FileId, Username } from '../../types';
import { ThemeLabel } from '../themes';

export const createInitialState = ({
  defaultTheme,
  initialUsername = 'Anonymous',
  initialTabList = [],
  initialActiveFileId = null,
}: {
  defaultTheme: ThemeLabel;
  initialUsername?: Username;
  initialTabList?: TabState[];
  initialActiveFileId?: FileId;
}): VZState => ({
  tabList: initialTabList,
  activeFileId:
    initialActiveFileId ??
    initialTabList[0]?.fileId ??
    null,
  theme: defaultTheme,
  isSettingsOpen: false,
  editorWantsFocus: false,
  username: initialUsername,
});
