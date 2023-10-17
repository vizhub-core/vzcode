import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useReducer,
} from 'react';
import ShareDBClient from 'sharedb-client-browser/dist/sharedb-client-umd.cjs';
import { json1Presence } from '../ot';
import { randomId } from '../randomId';
import { CodeEditor } from './CodeEditor';
import { Settings } from './Settings';
import { Sidebar } from './Sidebar';
import { FileId, Files, VZCodeContent } from '../types';
import { TabList } from './TabList';
import { useOpenDirectories } from './useOpenDirectories';
import { ThemeLabel, defaultTheme } from './themes';
import { useEditorCache } from './useEditorCache';
import { useDynamicTheme } from './useDynamicTheme';
import { usePrettier } from './usePrettier';
// @ts-ignore
import PrettierWorker from './usePrettier/worker?worker';
import { SplitPaneResizeProvider } from './SplitPaneResizeContext';
import { Resizer } from './Resizer';
import { reducer } from './reducer';
import './style.scss';

// Instantiate the Prettier worker.
const prettierWorker = new PrettierWorker();

// Register our custom JSON1 OT type that supports presence.
// See https://github.com/vizhub-core/json1-presence
ShareDBClient.types.register(json1Presence.type);

// Establish the singleton ShareDB connection over WebSockets.
// TODO consider using reconnecting WebSocket
const { Connection } = ShareDBClient;
const wsProtocol =
  window.location.protocol === 'https:'
    ? 'wss://'
    : 'ws://';
const socket = new WebSocket(
  wsProtocol + window.location.host + '/ws',
);
const connection = new Connection(socket);

function App() {
  // The ShareDB document.

  //UseReducer declaration and dispatch calls.
  // TODO phase this out as we complete the refactoring
  // It's here now for backwards compatibility
  const submitOperation = (
    next: (content: VZCodeContent) => VZCodeContent,
  ) => {
    dispatch({
      type: 'submit_Operation',
      next: next,
    });
  };

  const closeTab = (fileIdToRemove: FileId) => {
    dispatch({
      type: 'close_tab',
      fileIdToRemove,
    });
  };

  const multiCloseTab = (idsToDelete: Array<FileId>) => {
    dispatch({
      type: 'multi_close_tab',
      idsToDelete,
    });
  };

  // https://react.dev/reference/react/useReducer
  const [state, dispatch] = useReducer(reducer, {
    ShareDBDoc: null,
    tabList: [],
    activeFileId: null,
    submitOperation,
    closeTab,
    multiCloseTab,
    theme: defaultTheme,
    isSettingsOpen: false,
  });

  const setShareDBDoc = (shareDBDoc) => {
    dispatch({
      type: 'set_Share_DB_Doc',
      shareDBDoc: shareDBDoc,
    });
  };

  //Reducer states. Used globally within App.tsx
  const tabList = state.tabList;
  const activeFileId = state.activeFileId;
  const theme = state.theme;
  const isSettingsOpen = state.isSettingsOpen;
  const shareDBDoc = state.ShareDBDoc;
  const setTabList = (tabList) => {
    dispatch({
      type: 'set_tab_list',
      tabList,
    });
  };

  const setActiveFileId = (activeFileId) => {
    dispatch({
      type: 'set_active_fileId',
      activeFileId,
    });
  };
  const openTab = (fileId: FileId) => {
    dispatch({
      type: 'open_tab',
      fileId,
    });
  };

  const deleteFile = (fileId) => {
    dispatch({
      type: 'delete_File',
      fileId: fileId,
    });
  };

  const deleteDirectory = (path) => {
    dispatch({
      type: 'delete_Directory',
      path: path,
    });
  };

  const createFile = () => {
    dispatch({
      type: 'create_File',
    });
  };

  const handleRenameFileClick = (
    fileId: FileId,
    newName: string,
  ) => {
    dispatch({
      type: 'rename_File',
      fileId: fileId,
      newName: newName,
    });
  };

  const setTheme = (themeLabel: ThemeLabel) => {
    dispatch({
      type: 'set_Theme',
      themeLabel: themeLabel,
    });
  };

  const setIsSettingsOpen = (isSettingsOpen: boolean) => {
    dispatch({
      type: 'is_Settings_Open',
      isSettingsOpen: isSettingsOpen,
    });
  };

  // Auto-run Pretter after local changes.
  usePrettier(
    state.shareDBDoc,
    submitOperation,
    prettierWorker,
  );

  // Local ShareDB presence, for broadcasting our cursor position
  // so other clients can see it.
  // See https://share.github.io/sharedb/api/local-presence
  const [localPresence, setLocalPresence] = useState(null);

  // The document-level presence object, which emits
  // changes in remote presence.
  const [docPresence, setDocPresence] = useState(null);

  // The `doc.data` part of the ShareDB document,
  // updated on each change to decouple rendering from ShareDB.
  // Starts out as `null` until the document is loaded.
  const [content, setContent] =
    useState<VZCodeContent | null>(null);

  // Set up the connection to ShareDB.
  // TODO move this logic to a hook called `useShareDB`
  useEffect(() => {
    // Since there is only ever a single document,
    // these things are pretty arbitrary.
    //  * `collection` - the ShareDB collection to use
    //  * `id` - the id of the ShareDB document to use
    const collection = 'documents';
    const id = '1';

    // Initialize the ShareDB document.
    const shareDBDoc = connection.get(collection, id);

    // Subscribe to the document to get updates.
    // This callback gets called once only.
    shareDBDoc.subscribe(() => {
      // Expose ShareDB doc to downstream logic.
      setShareDBDoc(shareDBDoc);

      // Set initial data.
      setContent(shareDBDoc.data);

      // Listen for all changes and update `data`.
      // This decouples rendering logic from ShareDB.
      // This callback gets called on each change.
      shareDBDoc.on('op', () => {
        setContent(shareDBDoc.data);
      });

      // Set up presence.
      // See https://github.com/share/sharedb/blob/master/examples/rich-text-presence/client.js#L53
      const docPresence = connection.getDocPresence(
        collection,
        id,
      );

      // Subscribe to receive remote presence updates.
      docPresence.subscribe(function (error) {
        if (error) throw error;
      });

      // Set up our local presence for broadcasting this client's presence.
      setLocalPresence(docPresence.create(randomId()));

      // Store docPresence so child components can listen for changes.
      setDocPresence(docPresence);
    });

    // TODO unsubscribe from presence
    // TODO unsubscribe from doc
    return () => {
      // shareDBDoc.destroy();
      // docPresence.destroy();
    };
  }, []);

  // Cache of CodeMirror editors by file id.
  const editorCache = useEditorCache();

  // Handle dynamic theme changes.
  useDynamicTheme(editorCache, theme);

  // The set of open directories.
  const { isDirectoryOpen, toggleDirectory } =
    useOpenDirectories();

  // TODO move this logic to a hook called `useFileCRUD`
  // Include
  //  - `createFile`
  //  - `handleRenameFileClick`
  //  - `deleteFile`
  //  - `handleDeleteFileClick`

  const handleDeleteClick = useCallback(
    (key: string) => {
      //Regex to identify if the key is a file path or a file id.
      if (/^[0-9]*$/.test(key)) {
        if (key.length == 8) {
          deleteFile(key);
        } else {
          deleteDirectory(key);
        }
      } else {
        deleteDirectory(key);
      }
    },
    [deleteFile, deleteDirectory],
  );

  const handleSettingsClose = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  // Set `doc.data.isInteracting` to `true` when the user is interacting
  // via interactive code widgets (e.g. Alt+drag), and `false` when they are not.
  const interactTimeoutRef = useRef(null);
  const handleInteract = useCallback(() => {
    // Set `isInteracting: true` if not already set.
    if (!interactTimeoutRef.current) {
      submitOperation((document) => ({
        ...document,
        isInteracting: true,
      }));
    } else {
      clearTimeout(interactTimeoutRef.current);
    }

    // Set `isInteracting: false` after a delay.
    interactTimeoutRef.current = setTimeout(() => {
      interactTimeoutRef.current = null;
      submitOperation((document) => ({
        ...document,
        isInteracting: false,
      }));
    }, 800);
  }, [submitOperation]);

  // Isolate the files object from the document.
  const files: Files | null = content
    ? content.files
    : null;

  return (
    <SplitPaneResizeProvider>
      <div className="app">
        <div className="left">
          <Sidebar
            createFile={createFile}
            files={files}
            handleRenameFileClick={handleRenameFileClick}
            handleDeleteFileClick={handleDeleteClick}
            handleFileClick={openTab}
            setIsSettingsOpen={setIsSettingsOpen}
            isDirectoryOpen={isDirectoryOpen}
            toggleDirectory={toggleDirectory}
          />
          <Settings
            show={isSettingsOpen}
            onClose={handleSettingsClose}
            theme={theme}
            setTheme={setTheme}
          />
        </div>
        <div className="right">
          <TabList
            files={files}
            tabList={tabList}
            activeFileId={activeFileId}
            setActiveFileId={setActiveFileId}
            closeTab={closeTab}
          />
          {content && activeFileId ? (
            <CodeEditor
              shareDBDoc={shareDBDoc}
              localPresence={localPresence}
              docPresence={docPresence}
              activeFileId={activeFileId}
              theme={theme}
              onInteract={handleInteract}
              editorCache={editorCache}
            />
          ) : null}
        </div>
        <Resizer />
      </div>
    </SplitPaneResizeProvider>
  );
}

export default App;
