import { VZState } from '.';
import { Username } from '../../types';
import { ThemeLabel } from '../themes';

export const createInitialState = ({
  defaultTheme,
  initialUsername = 'Anonymous',
  initialEnableAIGhostCompletions = false,
}: {
  defaultTheme: ThemeLabel;
  initialUsername?: Username;
  initialEnableAIGhostCompletions?: boolean;
}): VZState => ({
  pane: {
    id: 'root',
    type: 'leafPane',
    tabList: [],
    activeFileId: null,
  },
  activePaneId: 'root',
  theme: defaultTheme,
  search: {
    pattern: '',
    results: {},
    focused: false,
    focusedIndex: null,
    focusedChildIndex: null,
  },
  isSearchOpen: false,
  isAIChatOpen: true,
  aiChatFocused: false,
  aiChatMode: 'edit',
  isSettingsOpen: false,
  isDocOpen: false,
  editorWantsFocus: false,
  username: initialUsername,
  enableAutoFollow: true,
  enableAIGhostCompletions: initialEnableAIGhostCompletions,
  sidebarPresenceIndicators: [],
});
