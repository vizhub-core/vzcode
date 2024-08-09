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
// to do with the application state. This includes
//  * Accessing and manipulating ShareDB data
//  * Centralized application state
export const VZCodeContext =
  createContext<VZCodeContextValue>(null);

// The type of the object provided by this context.
export type VZCodeContextValue = {
  content: VZCodeContent | null;
  shareDBDoc: ShareDBDoc<VZCodeContent> | null;
  submitOperation: (
    next: (content: VZCodeContent) => VZCodeContent,
  ) => void;
  // TODO pull in this type from ShareDB if possible
  localPresence: any;
  // TODO pull in this type from ShareDB if possible
  docPresence: any;

  files: Files | null;
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

  activeFileId: string | null;
  setActiveFileId: (fileId: string | null) => void;
  setActiveFileLeft: () => void;
  setActiveFileRight: () => void;

  tabList: Array<TabState>;
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

  typeScriptWorker: Worker | null;

  search: SearchResults;
  isSearchOpen: boolean;
  setIsSearchOpen: (isSearchOpen: boolean) => void;
  setSearch: (pattern: string) => void;
  setSearchResults: (
    files: ShareDBDoc<VZCodeContent>,
  ) => void;
  setSearchFileVisibility: (
    files: ShareDBDoc<VZCodeContent>,
    id: string,
    visibility: SearchFileVisibility,
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
  runCodeRef: React.MutableRefObject<null | (() => void)>;

  sidebarRef: React.RefObject<HTMLDivElement>;

  codeEditorRef: React.RefObject<HTMLDivElement>;

  connected: boolean;

  hoveredItemId: ItemId | null;
  setHoveredItemId: (itemId: ItemId | null) => void;

  enableAutoFollow: boolean;
  toggleAutoFollow: () => void;

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
}) => {
  // Auto-run Pretter after local changes.
  const {
    prettierError,
    runPrettierRef,
  }: {
    prettierError: string | null;
    runPrettierRef: React.MutableRefObject<
      null | (() => void)
    >;
  } = usePrettier({
    shareDBDoc,
    submitOperation,
    prettierWorker,
  });

  const runCodeRef = useRunCode(submitOperation);

  const sidebarRef = useRef(null);

  const codeEditorRef = useRef(null);

  // The error message shows either:
  // * `prettierError` - errors from Prettier, client-side only
  // * `codeError` - errors from an external source, such as
  //   build-time errors or intercepted runtime errors.
  // Since `prettierError` surfaces syntax errors, it's more likely to be
  // useful to the user, so we prioritize it.
  const errorMessage: string | null = prettierError
    ? prettierError
    : codeError;

  // Set up the TypeScript Language Server worker.
  // This acts as a central "brain" for features powered
  // by the TypeScript Language Server including:
  //  * Completions
  //  * Linting
  useTypeScript({
    content,
    typeScriptWorker,
  });

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
    theme,
    search,
    isSearchOpen,
    isSettingsOpen,
    isDocOpen,
    editorWantsFocus,
    username,
    enableAutoFollow,
  } = state;

  // TODO support splitPane type
  // Determine the active pane and handle both leaf and non-leaf panes
  let activePaneId = state.activePaneId;
  let activePane = findPane(pane, activePaneId);

  let tabList = [];
  let activeFileId = null;

  if (activePane.type === 'leafPane') {
    tabList = activePane.tabList;
    activeFileId = activePane.activeFileId;
  } else {
    // Handle non-leaf pane logic if needed
    // For now, just log the active pane for debugging purposes
    console.log('Active Pane is not a leafPane:', activePane);
    // check if any children are leaf panes
    // if so, set the active pane to the first leaf pane
    // if no children are leaf panes check if any childrens children are leaf panes
    // if so, set the active pane to the first leaf pane
    while (activePane.type !== 'leafPane') {
      // check if any children are leaf panes
      for (const child of activePane.children) {
        if (child.type === 'leafPane') {
          activePaneId = child.id;
          activePane = child;
          break;
        }
      }
      // if no children are leaf panes check if any childrens children are leaf panes
      if (activePane.type !== 'leafPane') {
        // set the active pane to the first child
        activePaneId = activePane.children[0].id;
        activePane = activePane.children[0];
      }
    }
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
    toggleSearchFocused,
    setIsSettingsOpen,
    setIsDocOpen,
    closeSettings,
    closeDoc,
    editorNoLongerWantsFocus,
    setUsername,
    toggleAutoFollow,
    splitCurrentPane,
  } = useActions(dispatch);

  // Sync tab state to the URL.
  // TODO make the URL sync to the active pane only
  // const activePaneId = state.activePaneId;
  // // find the active pane
  // const activePane = findPane(pane, activePaneId);
  useURLSync({
    content,
    openTab,
    setActiveFileId,
    tabList,
    activeFileId,
  });

  // The set of open directories.
  // TODO move this into reducer/useActions
  const { isDirectoryOpen, toggleDirectory } =
    useOpenDirectories();

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
  const files: Files | null = content
    ? content.files
    : null;

  useKeyboardShortcuts({
    closeTabs,
    activeFileId,
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

    activeFileId,
    setActiveFileId,
    setActiveFileLeft,
    setActiveFileRight,

    tabList,
    openTab,
    closeTabs,

    search,
    isSearchOpen,
    setIsSearchOpen,
    setSearch,
    setSearchResults,
    setSearchFileVisibility,
    toggleSearchFocused,

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

    hoveredItemId,
    setHoveredItemId,

    enableAutoFollow,
    toggleAutoFollow,
    splitCurrentPane,
  };

  return (
    <VZCodeContext.Provider value={value}>
      {children}
    </VZCodeContext.Provider>
  );
};
