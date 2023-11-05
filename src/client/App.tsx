import { useState, useEffect, useReducer } from 'react';
import ShareDBClient from 'sharedb-client-browser/dist/sharedb-client-umd.cjs';
import { json1Presence } from '../ot';
import { randomId } from '../randomId';
import { CodeEditor } from './CodeEditor';
import { VZSettings } from './VZSettings';
import { VZSidebar } from './VZSidebar';
import {
  Files,
  ShareDBDoc,
  Username,
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
// @ts-ignore
import TypeScriptWorker from './useTypeScript/worker?worker';
import { SplitPaneResizeProvider } from './SplitPaneResizeContext';
import { Resizer } from './Resizer';
import { PresenceNotifications } from './PresenceNotifications';
import { CodeErrorOverlay } from './CodeErrorOverlay';
import { vzReducer, createInitialState } from './vzReducer';
import { useActions } from './useActions';
import { useFileCRUD } from './useFileCRUD';
import { useSubmitOperation } from './useSubmitOperation';
import {
  useInitialUsername,
  usePersistUsername,
} from './usernameLocalStorage';
import { useTypeScript } from './useTypeScript';
import './style.scss';
import { AIAssistWidget } from './AIAssistWidget';

// Instantiate the Prettier worker.
const prettierWorker = new PrettierWorker();

// Instantiate the TypeScript worker.
const typeScriptWorker = new TypeScriptWorker();

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
      const generateTimestampedId = () => {
        const timestamp = Date.now().toString(36);
        const randomPart = randomId();
        return `${timestamp}-${randomPart}`;
      };
      setLocalPresence(
        docPresence.create(generateTimestampedId()),
      );

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

  // Get the initial username from localStorage.
  const initialUsername: Username = useInitialUsername();

  const submitOperation: (
    next: (content: VZCodeContent) => VZCodeContent,
  ) => void = useSubmitOperation(shareDBDoc);

  // Auto-run Pretter after local changes.
  const {
    prettierError,
  }: {
    prettierError: string | null;
  } = usePrettier(
    shareDBDoc,
    submitOperation,
    prettierWorker,
  );

  // Set up the TypeScript worker.
  useTypeScript({
    content,
    typeScriptWorker,
  });

  // https://react.dev/reference/react/useReducer
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
    openTab,
    closeTabs,
    setTheme,
    setIsSettingsOpen,
    closeSettings,
    editorNoLongerWantsFocus,
    setUsername,
  } = useActions(dispatch);

  // The set of open directories.
  // TODO move this into reducer/useActions
  const { isDirectoryOpen, toggleDirectory } =
    useOpenDirectories();

  usePersistUsername(username);

  // Cache of CodeMirror editors by file id.
  const editorCache: EditorCache = useEditorCache();

  // Handle dynamic theme changes.
  useDynamicTheme(editorCache, theme);

  // Handle file CRUD operations.
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
            openTab={openTab}
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
            username={username}
            setUsername={setUsername}
          />
        </div>
        <div className="right">
          <TabList
            files={files}
            tabList={tabList}
            activeFileId={activeFileId}
            setActiveFileId={setActiveFileId}
            openTab={openTab}
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
              editorWantsFocus={editorWantsFocus}
              editorNoLongerWantsFocus={
                editorNoLongerWantsFocus
              }
              username={username}
              typeScriptWorker={typeScriptWorker}
            />
          ) : null}
          <CodeErrorOverlay errorMessage={prettierError} />
          <PresenceNotifications
            docPresence={docPresence}
            localPresence={localPresence}
          />
          <AIAssistWidget />
        </div>
        <Resizer />
      </div>
    </SplitPaneResizeProvider>
  );
}

export default App;
