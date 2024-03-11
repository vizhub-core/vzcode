import {
  createContext,
  useCallback,
  useReducer,
  useState,
} from 'react';
import {
  Files,
  ShareDBDoc,
  SubmitOperation,
  Username,
  VZCodeContent,
} from '../types';
import { usePrettier } from './usePrettier';
import { useTypeScript } from './useTypeScript';
import {
  TabState,
  createInitialState,
  vzReducer,
} from './vzReducer';
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
  localPresence: any;
  docPresence: any;

  files: Files | null;
  createFile: (fileName: string, text?: string) => void;
  renameFile: (fileId: string, fileName: string) => void;
  deleteFile: (fileId: string) => void;
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
  openTab: ({
    fileId,
    isTransient,
  }: {
    fileId: string;
    isTransient?: boolean;
  }) => void;
  closeTabs: (fileIds: string[]) => void;

  isSettingsOpen: boolean;
  setIsSettingsOpen: (isSettingsOpen: boolean) => void;
  closeSettings: () => void;

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

  isCreateFileModalOpen: boolean;
  handleOpenCreateFileModal: () => void;
  handleCloseCreateFileModal: () => void;
  handleCreateFileClick: (newFileName: string) => void;
  runPrettierRef: React.MutableRefObject<
    null | (() => void)
  >;
  runCodeRef: React.MutableRefObject<null | (() => void)>;

  connected: boolean;
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
  enableManualPretter = true,
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
  enableManualPretter?: boolean;
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
    enableManualPretter,
  });

  const runCodeRef = useRunCode(submitOperation);

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
  const {
    tabList,
    activeFileId,
    theme,
    isSettingsOpen,
    editorWantsFocus,
    username,
  } = state;

  // Functions for dispatching actions to the reducer.
  const {
    setActiveFileId,
    setActiveFileLeft,
    setActiveFileRight,
    openTab,
    closeTabs,
    setTheme,
    setIsSettingsOpen,
    closeSettings,
    editorNoLongerWantsFocus,
    setUsername,
  } = useActions(dispatch);

  // Sync tab state to the URL.
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
    runPrettierRef,
    runCodeRef,
  });

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
    renameDirectory,
    deleteDirectory,

    activeFileId,
    setActiveFileId,
    setActiveFileLeft,
    setActiveFileRight,

    tabList,
    openTab,
    closeTabs,

    isSettingsOpen,
    setIsSettingsOpen,
    closeSettings,

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
    runPrettierRef,
    runCodeRef,

    connected,
  };

  return (
    <VZCodeContext.Provider value={value}>
      {children}
    </VZCodeContext.Provider>
  );
};
