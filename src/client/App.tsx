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
import { VZSettings } from './VZSettings';
import { VZSidebar } from './VZSidebar';
import {
  FileId,
  Files,
  ShareDBDoc,
  VZCodeContent,
} from '../types';
import { TabList } from './TabList';
import { useOpenDirectories } from './useOpenDirectories';
import { defaultTheme, useDynamicTheme } from './themes';
import {
  EditorCache,
  useEditorCache,
} from './useEditorCache';
import { usePrettier } from './usePrettier';
// @ts-ignore
import PrettierWorker from './usePrettier/worker?worker';
import { SplitPaneResizeProvider } from './SplitPaneResizeContext';
import { Resizer } from './Resizer';
import { PresenceNotifications } from './PresenceNotifications';
import { PrettierErrorOverlay } from './PrettierErrorOverlay';
import { vzReducer } from './vzReducer';
import { useActions } from './useActions';
import { useFileCRUD } from './useFileCRUD';
import './style.scss';
import { useSubmitOperation } from './useSubmitOperation';

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
  const [shareDBDoc, setShareDBDoc] =
    useState<ShareDBDoc<VZCodeContent> | null>(null);

  const submitOperation: (
    next: (content: VZCodeContent) => VZCodeContent,
  ) => void = useSubmitOperation(shareDBDoc);

  // Auto-run Pretter after local changes.
  const { prettierError } = usePrettier(
    shareDBDoc,
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
        // TODO consider excluding file contents from this,
        // because currently we are re-rendering the entire
        // document on each file change (each keystroke while editing).
        // This is not required, because no part of the app outside
        // of the CodeMirror integration uses those file contents.
        // The Sidebar only needs to know file names, not contents.
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

  // https://react.dev/reference/react/useReducer
  const [state, dispatch] = useReducer(vzReducer, {
    tabList: [],
    activeFileId: null,
    theme: defaultTheme,
    isSettingsOpen: false,
  });

  // Unpack state.
  const { tabList, activeFileId, theme, isSettingsOpen } =
    state;

  // Functions for dispatching actions to the reducer.
  const {
    setActiveFileId,
    openTab,
    closeTabs,
    setTheme,
    setIsSettingsOpen,
    closeSettings,
  } = useActions(dispatch);

  // The set of open directories.
  // TODO move this into reducer/useActions
  const { isDirectoryOpen, toggleDirectory } =
    useOpenDirectories();

  // Cache of CodeMirror editors by file id.
  const editorCache: EditorCache = useEditorCache();

  // A function that will focus the editor.
  const focusEditor = useCallback(
    (fileId: FileId) => {
      // TODO figure out a way to do this without the timeout
      setTimeout(() => {
        const editorCacheValue = editorCache.get(fileId);
        if (editorCacheValue) {
          editorCacheValue.editor.focus();
        }
      }, 100);
    },
    [editorCache],
  );

  // Handle dynamic theme changes.
  useDynamicTheme(editorCache, theme);

  // Handle file CRUD operations.
  const {
    createFile,
    renameFile,
    deleteFile,
    deleteDirectory,
  } = useFileCRUD({ submitOperation, closeTabs, focusEditor });

  // Isolate the files object from the document.
  const files: Files | null = content
    ? content.files
    : null;

  return (
    <SplitPaneResizeProvider>
      <div className="app">
        <div className="left">
          <VZSidebar
            files={files}
            createFile={createFile}
            renameFile={renameFile}
            deleteFile={deleteFile}
            deleteDirectory={deleteDirectory}
            handleFileClick={openTab}
            setIsSettingsOpen={setIsSettingsOpen}
            isDirectoryOpen={isDirectoryOpen}
            toggleDirectory={toggleDirectory}
            activeFileId={activeFileId}
          />
          <VZSettings
            show={isSettingsOpen}
            onClose={closeSettings}
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
            closeTabs={closeTabs}
            createFile={createFile}
          />
          {content && activeFileId ? (
            <CodeEditor
              shareDBDoc={shareDBDoc}
              submitOperation={submitOperation}
              localPresence={localPresence}
              docPresence={docPresence}
              activeFileId={activeFileId}
              theme={theme}
              editorCache={editorCache}
            />
          ) : null}
          <PrettierErrorOverlay
            prettierError={prettierError}
          />
          <PresenceNotifications
            docPresence={docPresence}
          />
        </div>
        <Resizer />
      </div>
    </SplitPaneResizeProvider>
  );
}

export default App;
