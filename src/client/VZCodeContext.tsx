import {
  createContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import {
  Files,
  ShareDBDoc,
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
  createFile: (fileName: string) => void;
  renameFile: (fileId: string, fileName: string) => void;
  deleteFile: (fileId: string) => void;
  deleteDirectory: (directoryId: string) => void;

  activeFileId: string | null;
  setActiveFileId: (fileId: string | null) => void;

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
  enableManualPretter = false,
}: {
  content: VZCodeContent;
  shareDBDoc: ShareDBDoc<VZCodeContent>;
  submitOperation: (
    next: (content: VZCodeContent) => VZCodeContent,
  ) => void;
  localPresence: any;
  docPresence: any;
  prettierWorker: Worker;
  typeScriptWorker: Worker;
  initialUsername: Username;
  children: React.ReactNode;
  codeError?: string | null;
  enableManualPretter?: boolean;
}) => {
  // Auto-run Pretter after local changes.
  const {
    prettierError,
  }: {
    prettierError: string | null;
  } = usePrettier({
    shareDBDoc,
    submitOperation,
    prettierWorker,
    enableManualPretter,
  });

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
    initializeTabs,
    setActiveFileId,
    openTab,
    closeTabs,
    setTheme,
    setIsSettingsOpen,
    closeSettings,
    editorNoLongerWantsFocus,
    setUsername,
  } = useActions(dispatch);

  // initialize open tabs from the url search parameters
  useEffect(() => {
    const search = new URLSearchParams(
      document.location.search,
    );
    if (search.size === 0) {
      return;
    }
    const tabList: TabState[] = [];
    let activeFileId = null;
    for (const [fileId, tabState] of Array.from(
      search.entries(),
    )) {
      const isTransient = tabState.includes('t');
      const isActive = tabState.includes('a');
      if (isActive) {
        activeFileId = fileId;
      }
      tabList.push({ fileId, isTransient });
    }
    initializeTabs(tabList, activeFileId);
  }, []);

  // save the opem tabs to the url search parameters
  const tabListTimeoutId = useRef<number>(null);
  useEffect(() => {
    // debounce: only update the url when the tabList stops changing
    clearTimeout(tabListTimeoutId.current);
    setTimeout(() => {
      const query = new URLSearchParams();
      for (const tab of tabList) {
        let tabState = tab.isTransient ? 't' : 'p';
        // mark the active file
        if (tab.fileId === activeFileId) {
          tabState += 'a';
        }
        query.set(tab.fileId, tabState);
      }
      history.replaceState(
        null,
        '',
        '?' + query.toString(),
      );
    }, 100);
  }, [tabList]);

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
    deleteDirectory,
  } = useFileCRUD({
    submitOperation,
    closeTabs,
    openTab,
  });

  // Isolate the files object from the document.
  const files: Files | null = content
    ? content.files
    : null;

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
    deleteDirectory,

    activeFileId,
    setActiveFileId,

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
  };

  return (
    <VZCodeContext.Provider value={value}>
      {children}
    </VZCodeContext.Provider>
  );
};
