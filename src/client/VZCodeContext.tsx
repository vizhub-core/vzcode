import {
  createContext,
  useCallback,
  useReducer,
  useState,
  useRef,
} from 'react';
import {
  Files,
  ItemId,
  ShareDBDoc,
  SubmitOperation,
  Username,
  VZCodeContent,
  SearchResults,
  SearchFileVisibility,
  TabState,
  PresenceIndicator,
  Pane,
  PaneId,
  LeafPane,
} from '../types';
import { usePrettier } from './usePrettier';
import { useTypeScript } from './useTypeScript';
import { createInitialState, vzReducer } from './vzReducer';
import {
  ThemeLabel,
  defaultTheme,
  useDynamicTheme,
} from './themes';
import { useActions } from './useActions';
import { useOpenDirectories } from './useOpenDirectories';
import { useFileCRUD } from './useFileCRUD';
import {
  EditorCache,
  useEditorCache,
} from './useEditorCache';
import { useURLSync } from './useURLSync';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useRunCode } from './useRunCode';
import { findPane } from './vzReducer/findPane';

// This context centralizes all the "smart" logic
// related to the application state. This includes
// accessing and manipulating ShareDB data and centralized state.
export const VZCodeContext =
  createContext<VZCodeContextValue>(null);

// The type of the object provided by this context.
export type VZCodeContextValue = {
  content: VZCodeContent | null;
  shareDBDoc: ShareDBDoc<VZCodeContent> | null;
  submitOperation: (
    next: (content: VZCodeContent) => VZCodeContent,
  ) => void;
  localPresence: any;
  docPresence: any;

  files: Files | null;
  createFile: (fileName: string, text?: string) => void;
  renameFile: (fileId: string, fileName: string) => void;
  deleteFile: (fileId: string) => void;
  createDirectory: (fileName: string, text?: string) => void;
  renameDirectory: (directoryId: string, directoryName: string) => void;
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

  editorWantsFocus: boolean;
  editorNoLongerWantsFocus: () => void;

  errorMessage: string | null;

  typeScriptWorker: Worker | null;

  search: SearchResults;
  isSearchOpen: boolean;
  setIsSearchOpen: (isSearchOpen: boolean) => void;
  setSearch: (pattern: string) => void;
  setSearchResults: (files: ShareDBDoc<VZCodeContent>) => void;
  setSearchFileVisibility: (
    files: ShareDBDoc<VZCodeContent>,
    id: string,
    visibility: SearchFileVisibility,
  ) => void;
  setSearchLineVisibility: (
    files: ShareDBDoc<VZCodeContent>,
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

  runPrettierRef: React.MutableRefObject<null | (() => void)>;
  runCodeRef: React.MutableRefObject<null | (() => void)>;

  sidebarRef: React.RefObject<HTMLDivElement>;

  codeEditorRef: React.RefObject<HTMLDivElement>;

  connected: boolean;
  isSaving: boolean;
  isSaved: boolean;

  hoveredItemId: ItemId | null;
  setHoveredItemId: (itemId: ItemId | null) => void;

  enableAutoFollow: boolean;
  toggleAutoFollow: () => void;

  updatePresenceIndicator: (presenceIndicator: PresenceIndicator) => void;

  sidebarPresenceIndicators: Array<PresenceIndicator>;
  splitCurrentPane: () => void;
};

export const VZCodeProvider = ({
  content,
  shareDBDoc,
  submitOperation,
  localPresence,
  docPresence,
  prettierWorker,
  typeScriptWorker,
  initialUsername,
  children,
  codeError = null,
  connected,
  isSaved,
  isSaving,
}: {
  content: VZCodeContent;
  shareDBDoc: ShareDBDoc<VZCodeContent>;
  submitOperation: SubmitOperation;
  localPresence: any;
  docPresence: any;
  prettierWorker: Worker;
  typeScriptWorker: Worker;
  initialUsername: Username;
  children: React.ReactNode;
  codeError?: string | null;
  connected: boolean;
  isSaving: boolean;
  isSaved: boolean;
}) => {
  const {
    prettierError,
    runPrettierRef,
  }: {
    prettierError: string | null;
    runPrettierRef: React.MutableRefObject<null | (() => void)>;
  } = usePrettier({ shareDBDoc, submitOperation, prettierWorker });

  const runCodeRef = useRunCode(submitOperation);

  const sidebarRef = useRef(null);
  const codeEditorRef = useRef(null);

  const errorMessage: string | null = prettierError
    ? prettierError
    : codeError;

  useTypeScript({ content, typeScriptWorker });

  const [state, dispatch] = useReducer(
    vzReducer,
    { defaultTheme, initialUsername },
    createInitialState,
  );

  const {
    pane,
    activePaneId,
    theme,
    search,
    isSearchOpen,
    isSettingsOpen,
    isDocOpen,
    editorWantsFocus,
    username,
    enableAutoFollow,
    sidebarPresenceIndicators,
  } = state;

  const activePane = findPane(pane, activePaneId);
  if (activePane.type !== 'leafPane') {
    throw new Error('Expected leafPane');
  }

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

  useURLSync({
    content,
    openTab,
    setActiveFileId,
    tabList: activePane.tabList,
    activeFileId: activePane.activeFileId,
  });

  const { isDirectoryOpen, toggleDirectory } = useOpenDirectories();
  const editorCache: EditorCache = useEditorCache();
  useDynamicTheme(editorCache, theme);

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
  });

  const [isCreateFileModalOpen, setIsCreateFileModalOpen] = useState(false);
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

  const [isCreateDirModalOpen, setIsCreateDirModalOpen] = useState(false);
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

  return (
    <VZCodeContext.Provider
      value={{
        content,
        shareDBDoc,
        submitOperation,
        localPresence,
        docPresence,
        files: content?.files || null,
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
        pane,
        activePane,
        openTab,
        closeTabs,
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
        typeScriptWorker,
        search,
        isSearchOpen,
        setIsSearchOpen,
        setSearch,
        setSearchResults,
        setSearchFileVisibility,
        setSearchLineVisibility,
        setSearchFocusedIndex,
        toggleSearchFocused,
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
        isSaving,
        isSaved,
        hoveredItemId: state.hoveredItemId,
        setHoveredItemId: dispatch.bind(null, { type: 'SET_HOVERED_ITEM_ID' }),
        enableAutoFollow,
        toggleAutoFollow,
        updatePresenceIndicator,
        sidebarPresenceIndicators,
        splitCurrentPane,
      }}>
      {children}
    </VZCodeContext.Provider>
  );
};
