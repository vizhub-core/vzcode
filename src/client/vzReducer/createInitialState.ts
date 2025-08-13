import { VZState } from '.';

interface CommandPalette {
  isVisible: boolean;
  query: string;
}

interface VZState {
  pane: {
    id: string;
    type: string;
    tabList: any[];
    activeFileId: string | null;
  };
  commandPalette: CommandPalette; // Add this line
  activePaneId: string;
  theme: ThemeLabel;
  search: {
    pattern: string;
    results: Record<string, any>;
    focused: boolean;
    focusedIndex: number | null;
    focusedChildIndex: number | null;
  };
  isSearchOpen: boolean;
  isSettingsOpen: boolean;
  isDocOpen: boolean;
  editorWantsFocus: boolean;
  username: Username;
  enableAutoFollow: boolean;
  sidebarPresenceIndicators: any[];
}
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
  commandPalette: {
    isVisible: false,
    query: "",
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
  isSettingsOpen: false,
  isDocOpen: false,
  editorWantsFocus: false,
  username: initialUsername,
  enableAutoFollow: true,
  sidebarPresenceIndicators: [],
  
});
