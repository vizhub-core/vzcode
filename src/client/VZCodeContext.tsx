import {
  Context,
  createContext,
  useCallback,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  ItemId,
  LeafPane,
  Pane,
  PaneId,
  PresenceIndicator,
  SearchFileVisibility,
  SearchResults,
  ShareDBDoc,
  SubmitOperation,
  TabState,
  Username,
} from '../types';
import { VizFiles, VizContent } from '@vizhub/viz-types';
import {
  ThemeLabel,
  defaultTheme,
  useDynamicTheme,
} from './themes';
import { useActions } from './useActions';
import {
  EditorCache,
  useEditorCache,
} from './useEditorCache';
import { useFileCRUD } from './useFileCRUD';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useOpenDirectories } from './useOpenDirectories';
import { usePrettier } from './usePrettier';
import { useRunCode } from './useRunCode';
import { useRuntimeError } from './useRuntimeError';
import { useURLSync } from './useURLSync';
import { createInitialState, vzReducer } from './vzReducer';
import { findPane } from './vzReducer/findPane';
import { usePresenceAutoFollow } from './usePresenceAutoFollow';
import { v4 as uuidv4 } from 'uuid';

// This context centralizes all the "smart" logic
// to do with the application state. This includes
//  * Accessing and manipulating ShareDB data
//  * Centralized application state
export const VZCodeContext =
  createContext<VZCodeContextValue>(null);

// The type of the object provided by this context.
export type VZCodeContextValue = {
  content: VizContent | null;
  shareDBDoc: ShareDBDoc<VizContent> | null;
  submitOperation: (
    next: (content: VizContent) => VizContent,
  ) => void;
  // TODO pull in this type from ShareDB if possible
  localPresence: any;
  // TODO pull in this type from ShareDB if possible
  docPresence: any;

  files: VizFiles | null;
  createFile: (fileName: string, text?: string) => void;
  renameFile: (fileId: string, fileName: string) => void;
  deleteFile: (fileId: string) => void;
  createDirectory: (
    fileName: string,
    text?: string,
  ) => void;
  renameDirectory: (
    directoryId: string,
    directoryOldName: string,
    directoryName: string,
  ) => void;
  deleteDirectory: (directoryId: string) => void;

  setActiveFileId: (fileId: string | null) => void;
  setActiveFileLeft: () => void;
  setActiveFileRight: () => void;

  activePaneId: PaneId;
  pane: Pane;
  activePane: LeafPane;

  openTab: (tabState: TabState) => void;
  closeTabs: (fileIds: string[]) => void;

  isSettingsOpen: boolean;
  setIsSettingsOpen: (isSettingsOpen: boolean) => void;
  closeSettings: () => void;

  isDocOpen: boolean;
  setIsDocOpen: (isDocOpen: boolean) => void;
  closeDoc: () => void;

  theme: ThemeLabel;
  setTheme: (theme: ThemeLabel) => void;

  username: Username;
  setUsername: (username: Username) => void;

  isDirectoryOpen: (path: string) => boolean;
  toggleDirectory: (path: string) => void;

  editorCache: EditorCache;

  // Whether the editor should be focused.
  editorWantsFocus: boolean;
  // Signals that the editor no longer wants focus.
  editorNoLongerWantsFocus: () => void;

  errorMessage: string | null;

  // Runtime error handling
  handleRuntimeError: (
    formattedErrorMessage: string,
  ) => void;
  clearRuntimeError: () => void;

  search: SearchResults;
  isSearchOpen: boolean;
  setIsSearchOpen: (isSearchOpen: boolean) => void;
  setSearch: (pattern: string) => void;

  isAIChatOpen: boolean;
  setIsAIChatOpen: (isAIChatOpen: boolean) => void;
  aiChatFocused: boolean;
  toggleAIChatFocused: () => void;
  aiChatMode: 'ask' | 'edit';
  setAIChatMode: (mode: 'ask' | 'edit') => void;
  aiChatEndpoint?: string;
  aiChatUndoEndpoint?: string;
  aiChatOptions?: { [key: string]: any };
  setSearchResults: (files: ShareDBDoc<VizContent>) => void;
  setSearchFileVisibility: (
    files: ShareDBDoc<VizContent>,
    id: string,
    visibility: SearchFileVisibility,
  ) => void;
  setSearchLineVisibility: (
    files: ShareDBDoc<VizContent>,
    id: string,
    line: number,
  ) => void;
  setSearchFocusedIndex: (
    focusedIndex: number,
    childIndex: number,
  ) => void;
  toggleSearchFocused: () => void;

  isCreateFileModalOpen: boolean;
  handleOpenCreateFileModal: () => void;
  handleCloseCreateFileModal: () => void;
  handleCreateFileClick: (newFileName: string) => void;

  isCreateDirModalOpen: boolean;
  handleOpenCreateDirModal: () => void;
  handleCloseCreateDirModal: () => void;
  handleCreateDirClick: (newFileName: string) => void;

  runPrettierRef: React.MutableRefObject<
    null | (() => void)
  >;
  runCodeRef: React.MutableRefObject<
    null | ((hardRerun?: boolean) => void)
  >;

  sidebarRef: React.RefObject<HTMLDivElement>;

  codeEditorRef: React.RefObject<HTMLDivElement>;

  connected: boolean;
  pending: boolean;

  hoveredItemId: ItemId | null;
  setHoveredItemId: (itemId: ItemId | null) => void;

  enableAutoFollow: boolean;
  toggleAutoFollow: () => void;

  updatePresenceIndicator: (
    presenceIndicator: PresenceIndicator,
  ) => void;

  sidebarPresenceIndicators: Array<PresenceIndicator>;
  splitCurrentPane: () => void;

  liveKitToken: string;
  setLiveKitToken: (state: string) => void;
  liveKitRoomName: string;
  setLiveKitRoom: (state: string) => void;
  liveKitConnection: boolean;
  setLiveKitConnection: (state: boolean) => void;
  voiceChatModalOpen: boolean;
  setVoiceChatModalOpen: (state: boolean) => void;
  aiChatMessage: string;
  setAIChatMessage: (message: string) => void;
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  currentChatId: string;
  aiErrorMessage: string | null;
  setAIErrorMessage: (state: string | null) => void;
  handleSendMessage: (
    messageToSend?: string,
    options?: Record<string, string>,
  ) => void;

  // Auto-fork functions for VizHub integration
  autoForkAndRetryAI?: (
    prompt: string,
    modelName: string,
    commitId?: string,
  ) => Promise<void>;
  clearStoredAIPrompt?: () => void;
  getStoredAIPrompt?: () => {
    prompt: string;
    modelName: string;
  } | null;

  // Additional widgets that can be rendered in AI chat messages
  additionalWidgets?: React.ComponentType<{
    messageId: string;
    chatId: string;
    canUndo: boolean;
    handleSendMessage?: (
      messageToSend?: string,
      options?: Record<string, string>,
    ) => void;
  }>;
};

export const VZCodeProvider = ({
  content,
  shareDBDoc,
  submitOperation,
  localPresence,
  docPresence,
  prettierWorker,
  initialUsername,
  children,
  codeError = null,
  connected,
  pending,
  liveKitToken,
  setLiveKitToken,
  liveKitRoomName,
  setLiveKitRoom,
  liveKitConnection,
  setLiveKitConnection,
  aiChatEndpoint,
  aiChatUndoEndpoint,
  aiChatOptions,
  autoForkAndRetryAI,
  clearStoredAIPrompt,
  getStoredAIPrompt,
  additionalWidgets,
}: {
  content: VizContent;
  shareDBDoc: ShareDBDoc<VizContent>;
  submitOperation: SubmitOperation;
  localPresence: any;
  docPresence: any;
  prettierWorker: Worker;
  initialUsername: Username;
  children: React.ReactNode;
  codeError?: string | null;
  connected?: boolean;
  pending?: boolean;
  liveKitToken?: string | undefined;
  setLiveKitToken?: (state: string) => void;
  liveKitRoomName?: string | undefined;
  setLiveKitRoom?: (state: string) => void;
  liveKitConnection?: boolean;
  setLiveKitConnection?: (state: boolean) => void;
  aiChatEndpoint?: string;
  aiChatUndoEndpoint?: string;
  aiChatOptions?: { [key: string]: any };
  autoForkAndRetryAI?: (
    prompt: string,
    modelName: string,
    commitId?: string,
  ) => Promise<void>;
  clearStoredAIPrompt?: () => void;
  getStoredAIPrompt?: () => {
    prompt: string;
    modelName: string;
  } | null;
  additionalWidgets?: React.ComponentType<{
    messageId: string;
    chatId: string;
    canUndo: boolean;
  }>;
}) => {
  // Auto-run Pretter after local changes.
  const { prettierError, runPrettierRef } = usePrettier({
    shareDBDoc,
    submitOperation,
    prettierWorker,
  });

  // Handle runtime errors from the iframe
  const {
    runtimeError,
    handleRuntimeError,
    clearRuntimeError,
  } = useRuntimeError();

  const runCodeRef = useRunCode(submitOperation);

  const sidebarRef = useRef(null);

  const codeEditorRef = useRef(null);

  // The error message shows errors in order of priority:
  // * `runtimeError` - errors from runtime execution, highest priority
  // * `prettierError` - errors from Prettier, client-side only
  // * `codeError` - errors from an external source, such as
  //   build-time errors or intercepted runtime errors.
  // Runtime errors are prioritized since they indicate immediate execution issues.
  // Prettier errors are next since they surface syntax errors that are likely
  // to be useful to the user.
  const errorMessage: string | null = runtimeError
    ? runtimeError
    : prettierError
      ? prettierError
      : codeError;

  // Set up the reducer that manages much of the application state.
  // See https://react.dev/reference/react/useReducer
  const [state, dispatch] = useReducer(
    vzReducer,
    { defaultTheme, initialUsername },
    createInitialState,
  );

  // Unpack state.
  // print the state object to see what it contains
  // console.log('state: ', state);
  const {
    pane,
    activePaneId,
    theme,
    search,
    isSearchOpen,
    isAIChatOpen,
    aiChatFocused,
    isSettingsOpen,
    isDocOpen,
    editorWantsFocus,
    username,
    enableAutoFollow,
    sidebarPresenceIndicators,
    aiChatMode,
  } = state;

  const activePane: Pane = findPane(pane, activePaneId);
  if (activePane.type !== 'leafPane') {
    // Should never happen
    throw new Error('Expected leafPane');
  }

  // Functions for dispatching actions to the reducer.
  const {
    setActiveFileId,
    setActiveFileLeft,
    setActiveFileRight,
    openTab,
    closeTabs,
    setTheme,
    setIsSearchOpen,
    setSearch,
    setSearchResults,
    setSearchFileVisibility,
    setSearchLineVisibility,
    setSearchFocusedIndex,
    toggleSearchFocused,
    setIsAIChatOpen,
    toggleAIChatFocused,
    setAIChatMode,
    setIsSettingsOpen,
    setIsDocOpen,
    closeSettings,
    closeDoc,
    editorNoLongerWantsFocus,
    setUsername,
    toggleAutoFollow,
    updatePresenceIndicator,
    splitCurrentPane,
  } = useActions(dispatch);

  // Sync tab state to the URL.
  useURLSync({
    content,
    openTab,
    setActiveFileId,
    tabList: activePane.tabList,
    activeFileId: activePane.activeFileId,
  });

  // The set of open directories.
  // TODO move this into reducer/useActions
  const { isDirectoryOpen, toggleDirectory } =
    useOpenDirectories({ activePane, content });

  // Cache of CodeMirror editors by file id.
  const editorCache: EditorCache = useEditorCache();

  // Handle dynamic theme changes.
  useDynamicTheme(editorCache, theme);

  // Handle file CRUD operations (Create, Read, Update, Delete)
  const {
    createFile,
    renameFile,
    deleteFile,
    createDirectory,
    renameDirectory,
    deleteDirectory,
  } = useFileCRUD({
    submitOperation,
    closeTabs,
    openTab,
    editorCache,
    content,
  });

  // State to control the create file modal's visibility
  const [isCreateFileModalOpen, setIsCreateFileModalOpen] =
    useState(false);

  const handleOpenCreateFileModal = useCallback(() => {
    setIsCreateFileModalOpen(true);
  }, []);

  const handleCloseCreateFileModal = useCallback(() => {
    setIsCreateFileModalOpen(false);
  }, []);

  const handleCreateFileClick = useCallback(
    (newFileName: string) => {
      createFile(newFileName);
      setIsCreateFileModalOpen(false);
    },
    [createFile, setIsCreateFileModalOpen],
  );

  // State to control the create directory modal's visibility
  const [isCreateDirModalOpen, setIsCreateDirModalOpen] =
    useState(false);

  const handleOpenCreateDirModal = useCallback(() => {
    setIsCreateDirModalOpen(true);
  }, []);

  const handleCloseCreateDirModal = useCallback(() => {
    setIsCreateDirModalOpen(false);
  }, []);

  const handleCreateDirClick = useCallback(
    (newDirName: string) => {
      createDirectory(newDirName);
      setIsCreateDirModalOpen(false);
    },
    [createDirectory, setIsCreateDirModalOpen],
  );

  // Isolate the files object from the document.
  const files: VizFiles | null = content
    ? content.files
    : null;

  useKeyboardShortcuts({
    closeTabs,
    // TODO verify that this makes sense
    activeFileId: activePane.activeFileId,
    activePaneId,
    handleOpenCreateFileModal,
    setActiveFileLeft,
    setActiveFileRight,
    toggleSearchFocused,
    runPrettierRef,
    runCodeRef,
    sidebarRef,
    editorCache,
    codeEditorRef,
  });

  // Track the currently hovered file id.
  const [hoveredItemId, setHoveredItemId] =
    useState<ItemId | null>(null);

  // Handle presence-based auto-following
  // This hook manages opening tabs when presence is received on files
  // that are not currently open, independent of CodeMirror extensions
  usePresenceAutoFollow({
    docPresence,
    enableAutoFollow,
    openTab,
    activePane,
  });

  // Livekit Voice Chat Modal

  const [voiceChatModalOpen, setVoiceChatModalOpen] =
    useState(false);

  const [aiChatMessage, setAIChatMessage] = useState('');

  const DEBUG = false;

  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId] = useState(() => uuidv4());
  const [aiErrorMessage, setAIErrorMessage] = useState<
    string | null
  >(null);

  const handleSendMessage = useCallback(
    async (
      messageToSend?: string,
      options?: Record<string, string>,
    ) => {
      DEBUG &&
        console.log(
          'AIChat: handleSendMessage called with:',
          messageToSend,
          'aiChatMessage:',
          aiChatMessage,
        );
      const messageContent = messageToSend || aiChatMessage;

      if (
        !messageContent ||
        typeof messageContent !== 'string' ||
        !messageContent.trim() ||
        isLoading
      ) {
        return;
      }

      const currentPrompt = aiChatMessage.trim();
      setAIChatMessage('');
      setIsLoading(true);
      setAIErrorMessage(null); // Clear any previous errors

      // Call backend endpoint for AI response
      // The server will handle all ShareDB operations including adding the user message
      try {
        const response = await fetch(aiChatEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...aiChatOptions,
            content: messageContent.trim(),
            chatId: currentChatId,
            mode: aiChatMode,
            ...options,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status}`,
          );
        }

        // Parse the response to check for errors
        const responseData = await response.json();

        // Check if the response contains a VizHub error
        if (
          responseData.outcome === 'failure' &&
          responseData.error
        ) {
          const errorMessage = responseData.error.message;

          // Check if this is the specific permission error that should trigger auto-fork
          if (
            aiErrorMessage ===
            'You do not have permission to use AI chat on this visualization. Only users with edit access can use this feature. Fork the viz to edit it.'
          ) {
            // Trigger auto-fork instead of showing error
            try {
              await autoForkAndRetryAI?.(
                currentPrompt,
                aiChatMode,
              );
              // If we reach here, the fork was successful and redirect should happen
              return;
            } catch (forkError) {
              console.error('Auto-fork failed:', forkError);
              setAIErrorMessage(
                'Failed to fork visualization. Please try forking manually.',
              );
              return;
            }
          }

          // For other errors, show the error message
          setAIErrorMessage(aiErrorMessage);
          return;
        }

        // The backend handles all ShareDB operations for successful responses
      } catch (error) {
        console.error('Error getting AI response:', error);
        setAIErrorMessage(
          'Failed to send message. Please try again.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      aiChatMessage,
      isLoading,
      aiChatEndpoint,
      aiChatOptions,
      currentChatId,
      aiChatMode,
      autoForkAndRetryAI,
    ],
  );

  // The value provided by this context.
  const value: VZCodeContextValue = {
    content,
    shareDBDoc,
    submitOperation,
    localPresence,
    docPresence,

    files,
    createFile,
    renameFile,
    deleteFile,
    createDirectory,
    renameDirectory,
    deleteDirectory,

    setActiveFileId,
    setActiveFileLeft,
    setActiveFileRight,

    activePaneId,
    // Root pane
    pane,
    // Active leaf pane
    activePane,

    openTab,
    closeTabs,

    search,
    isSearchOpen,
    setIsSearchOpen,
    setSearch,
    setSearchResults,
    setSearchFileVisibility,
    setSearchLineVisibility,
    setSearchFocusedIndex,
    toggleSearchFocused,

    isAIChatOpen,
    setIsAIChatOpen,
    aiChatFocused,
    toggleAIChatFocused,
    aiChatMode: state.aiChatMode,
    setAIChatMode,
    aiChatEndpoint,
    aiChatUndoEndpoint,
    aiChatOptions,

    isSettingsOpen,
    setIsSettingsOpen,
    closeSettings,

    isDocOpen,
    setIsDocOpen,
    closeDoc,

    theme,
    setTheme,

    username,
    setUsername,

    isDirectoryOpen,
    toggleDirectory,

    editorCache,
    editorWantsFocus,
    editorNoLongerWantsFocus,

    errorMessage,

    handleRuntimeError,
    clearRuntimeError,

    isCreateFileModalOpen,
    handleOpenCreateFileModal,
    handleCloseCreateFileModal,
    handleCreateFileClick,
    isCreateDirModalOpen,
    handleOpenCreateDirModal,
    handleCloseCreateDirModal,
    handleCreateDirClick,
    runPrettierRef,
    runCodeRef,
    sidebarRef,
    codeEditorRef,

    connected,
    pending,

    hoveredItemId,
    setHoveredItemId,

    enableAutoFollow,
    toggleAutoFollow,
    updatePresenceIndicator,
    sidebarPresenceIndicators,
    splitCurrentPane,
    liveKitRoomName,
    setLiveKitRoom,
    liveKitToken,
    setLiveKitToken,
    liveKitConnection,
    setLiveKitConnection,
    voiceChatModalOpen,
    setVoiceChatModalOpen,

    aiChatMessage,
    setAIChatMessage,
    isLoading,
    setIsLoading,
    currentChatId,
    aiErrorMessage,
    setAIErrorMessage,
    handleSendMessage,

    // Auto-fork functions for VizHub integration
    autoForkAndRetryAI,
    clearStoredAIPrompt,
    getStoredAIPrompt,

    // Additional widgets that can be rendered in AI chat messages
    additionalWidgets,
  };

  return (
    <VZCodeContext.Provider value={value}>
      {children}
    </VZCodeContext.Provider>
  );
};
