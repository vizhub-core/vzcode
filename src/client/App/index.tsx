import { useReducer } from 'react';
import ShareDBClient from 'sharedb-client-browser/dist/sharedb-client-umd.cjs';
import { json1Presence } from '../../ot';
import {
  Files,
  Username,
  VZCodeContent,
} from '../../types';
import { useOpenDirectories } from '../useOpenDirectories';
import { defaultTheme, useDynamicTheme } from '../themes';
import {
  EditorCache,
  useEditorCache,
} from '../useEditorCache';
import { usePrettier } from '../usePrettier';
// @ts-ignore
import PrettierWorker from '../usePrettier/worker?worker';
// @ts-ignore
import TypeScriptWorker from '../useTypeScript/worker?worker';
import { SplitPaneResizeProvider } from '../SplitPaneResizeContext';
import { Resizer } from '../Resizer';
import {
  vzReducer,
  createInitialState,
} from '../vzReducer';
import { useActions } from '../useActions';
import { useFileCRUD } from '../useFileCRUD';
import { useSubmitOperation } from '../useSubmitOperation';
import {
  useInitialUsername,
  usePersistUsername,
} from '../usernameLocalStorage';
import { useTypeScript } from '../useTypeScript';
import { useShareDB } from './useShareDB';
import { Left } from './Left';
import { Middle } from './Middle';
import './style.scss';
import { Right } from './Right';

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
  const {
    shareDBDoc,
    content,
    localPresence,
    docPresence,
  } = useShareDB({
    connection,
  });

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

  // Stores the username to local storage.
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
        <Left
          files={files}
          createFile={createFile}
          renameFile={renameFile}
          deleteFile={deleteFile}
          deleteDirectory={deleteDirectory}
          openTab={openTab}
          closeTabs={closeTabs}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          closeSettings={closeSettings}
          theme={theme}
          setTheme={setTheme}
          username={username}
          setUsername={setUsername}
          isDirectoryOpen={isDirectoryOpen}
          toggleDirectory={toggleDirectory}
          activeFileId={activeFileId}
        />
        <Middle
          files={files}
          tabList={tabList}
          activeFileId={activeFileId}
          setActiveFileId={setActiveFileId}
          openTab={openTab}
          closeTabs={closeTabs}
          createFile={createFile}
          content={content}
          shareDBDoc={shareDBDoc}
          submitOperation={submitOperation}
          localPresence={localPresence}
          docPresence={docPresence}
          theme={theme}
          editorCache={editorCache}
          editorWantsFocus={editorWantsFocus}
          editorNoLongerWantsFocus={
            editorNoLongerWantsFocus
          }
          username={username}
          prettierError={prettierError}
          typeScriptWorker={typeScriptWorker}
        />
        <Right />
        <Resizer side="left" />
        <Resizer side="right" />
      </div>
    </SplitPaneResizeProvider>
  );
}

export default App;
