import {
  useCallback,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { VizContent } from '@vizhub/viz-types';
import { defaultTheme, useDynamicTheme } from '../themes';
import { useActions } from '../useActions';
import { useEditorCache } from '../useEditorCache';
import { useFileCRUD } from '../useFileCRUD';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import { useOpenDirectories } from '../useOpenDirectories';
import { usePrettier } from '../usePrettier';
import { useRunCode } from '../useRunCode';
import { useRuntimeError } from '../useRuntimeError';
import { useURLSync } from '../useURLSync';
import {
  createInitialState,
  vzReducer,
} from '../vzReducer';
import { findPane } from '../vzReducer/findPane';
import { usePresenceAutoFollow } from '../usePresenceAutoFollow';
import { v4 as uuidv4 } from 'uuid';
import {
  VZCodeContextValue,
  VZCodeProviderProps,
} from './types';

export const useVZCodeState = ({
  content,
  shareDBDoc,
  submitOperation,
  localPresence,
  docPresence,
  prettierWorker,
  initialUsername,
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
  aiChatOptions,
  autoForkAndRetryAI,
  clearStoredAIPrompt,
  getStoredAIPrompt,
  additionalWidgets,
  iframeRef: externalIframeRef,
  handleChatError,
}: Omit<
  VZCodeProviderProps,
  'children'
>): VZCodeContextValue => {
  // Auto-run Prettier after local changes.
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

  // Use external iframeRef if provided, otherwise create our own
  const iframeRef = externalIframeRef || useRef(null);

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
  const {
    pane,
    activePaneId,
    theme,
    search,
    isSearchOpen,
    isVisualEditorOpen,
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

  const activePane = findPane(pane, activePaneId);
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
    setIsVisualEditorOpen,
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
  const { isDirectoryOpen, toggleDirectory } =
    useOpenDirectories({ activePane, content });

  // Cache of CodeMirror editors by file id.
  const editorCache = useEditorCache();

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
    deleteAllFiles,
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
  const files = content ? content.files : null;

  useKeyboardShortcuts({
    closeTabs,
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
  const [hoveredItemId, setHoveredItemId] = useState(null);

  // Handle presence-based auto-following
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

  // Compute isLoading based on the current chat's aiStatus
  const [currentChatId] = useState(() => uuidv4());
  const [selectedChatId, setSelectedChatId] = useState<
    string | null
  >(null);

  // Use selectedChatId if available, otherwise use currentChatId for backward compatibility
  const activeChatId = selectedChatId || currentChatId;
  const currentChat = content?.chats?.[activeChatId];
  const isLoading = currentChat?.aiStatus === 'generating';

  // Message history for up/down arrow navigation - using ShareDB document data
  const messageHistory = useMemo(() => {
    if (!currentChat?.messages) return [];
    // Extract user messages in chronological order for history navigation
    return currentChat.messages
      .filter((msg) => msg.role === 'user')
      .map((msg) => msg.content);
  }, [currentChat?.messages]);

  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDraft, setCurrentDraft] = useState('');

  const [aiErrorMessage, setAIErrorMessageState] = useState<
    string | null
  >(null);

  // Create the combined setAIErrorMessage function that calls both state setter and external callback
  const setAIErrorMessage = useCallback(
    (error: string | null) => {
      setAIErrorMessageState(error);
      if (error && handleChatError) {
        handleChatError(error);
      }
    },
    [handleChatError],
  );

  // Message history navigation functions
  const navigateMessageHistoryUp = useCallback(() => {
    if (messageHistory.length === 0) return;

    // If we're not navigating history, save current draft
    if (historyIndex === -1) {
      setCurrentDraft(aiChatMessage);
    }

    const newIndex =
      historyIndex < messageHistory.length - 1
        ? historyIndex + 1
        : historyIndex;
    setHistoryIndex(newIndex);
    setAIChatMessage(
      messageHistory[messageHistory.length - 1 - newIndex],
    );
  }, [messageHistory, historyIndex, aiChatMessage]);

  const navigateMessageHistoryDown = useCallback(() => {
    if (historyIndex === -1) return;

    const newIndex = historyIndex - 1;
    if (newIndex === -1) {
      // Return to draft
      setHistoryIndex(-1);
      setAIChatMessage(currentDraft);
      setCurrentDraft('');
    } else {
      setHistoryIndex(newIndex);
      setAIChatMessage(
        messageHistory[
          messageHistory.length - 1 - newIndex
        ],
      );
    }
  }, [messageHistory, historyIndex, currentDraft]);

  const resetMessageHistoryNavigation = useCallback(() => {
    if (historyIndex !== -1) {
      setHistoryIndex(-1);
      setCurrentDraft('');
    }
  }, [historyIndex]);

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

      // Reset history navigation when sending a message
      setHistoryIndex(-1);
      setCurrentDraft('');

      setAIErrorMessage(null); // Clear any previous errors

      // Call backend endpoint for AI response
      try {
        const response = await fetch(aiChatEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...aiChatOptions,
            content: messageContent.trim(),
            chatId: activeChatId,
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
            errorMessage ===
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
          setAIErrorMessage(errorMessage);
          return;
        }

        // The backend handles all ShareDB operations for successful responses
        // The loading state is now managed via ShareDB aiStatus
      } catch (error) {
        console.error('Error getting AI response:', error);
        setAIErrorMessage(
          'Failed to send message. Please try again.',
        );
      }
    },
    [
      aiChatMessage,
      isLoading,
      aiChatEndpoint,
      aiChatOptions,
      activeChatId,
      aiChatMode,
      autoForkAndRetryAI,
    ],
  );

  // Return the context value
  return {
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
    deleteAllFiles,

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

    isVisualEditorOpen,
    setIsVisualEditorOpen,

    isAIChatOpen,
    setIsAIChatOpen,
    aiChatFocused,
    toggleAIChatFocused,
    aiChatMode: state.aiChatMode,
    setAIChatMode,
    aiChatEndpoint,
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
    iframeRef,

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
    currentChatId,
    selectedChatId,
    setSelectedChatId,
    aiErrorMessage,
    setAIErrorMessage,
    handleSendMessage,

    // Message history navigation
    navigateMessageHistoryUp,
    navigateMessageHistoryDown,
    resetMessageHistoryNavigation,

    // Auto-fork functions for VizHub integration
    autoForkAndRetryAI,
    clearStoredAIPrompt,
    getStoredAIPrompt,

    // Additional widgets that can be rendered in AI chat messages
    additionalWidgets,
  };
};
