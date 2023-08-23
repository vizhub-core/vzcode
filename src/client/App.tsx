import { useState, useEffect, useCallback, useRef } from 'react';
import ShareDBClient from 'sharedb-client-browser/dist/sharedb-client-umd.cjs';
import { json1Presence } from '../ot';
import { randomId } from '../randomId';
import { CodeEditor } from './CodeEditor';
import { diff } from './diff';
import { Settings } from './Settings';
import { Sidebar } from './Sidebar';
import { FileId, Files, ShareDBDoc, VZCodeContent } from '../types';
import { TabList } from './TabList';
import { useOpenDirectories } from './useOpenDirectories';
import { useTabsState } from './useTabsState';
import { defaultTheme } from './themes';
import './style.scss';
import { usePrettier } from './usePrettier';

// Register our custom JSON1 OT type that supports presence.
// See https://github.com/vizhub-core/json1-presence
ShareDBClient.types.register(json1Presence.type);

// Establish the singleton ShareDB connection over WebSockets.
// TODO consider using reconnecting WebSocket
const { Connection } = ShareDBClient;
const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
const socket = new WebSocket(wsProtocol + window.location.host + '/ws');
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
  const [content, setContent] = useState<VZCodeContent | null>(null);

  // The id of the currently open file tab.
  const [activeFileId, setActiveFileId] = useState<FileId>(null);

  // The ordered list of tabs.
  const [tabList, setTabList] = useState<Array<FileId>>([]);

  // Logic for opening and closing tabs.
  const { closeTab, openTab } = useTabsState(
    activeFileId,
    setActiveFileId,
    tabList,
    setTabList,
  );

  // The current theme.
  const [theme, setTheme] = useState<string>(defaultTheme);

  // True to show the settings modal.
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // The set of open directories.
  const { isDirectoryOpen, toggleDirectory } = useOpenDirectories();

  // Set up the connection to ShareDB.
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
      const docPresence = connection.getDocPresence(collection, id);

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

  // A helper function to submit operations to the ShareDB document
  const submitOperation: (
    next: (content: VZCodeContent) => VZCodeContent,
  ) => void = useCallback(
    (next) => {
      const content: VZCodeContent = shareDBDoc.data;
      const op = diff(content, next(content));
      if (op && shareDBDoc) {
        shareDBDoc.submitOp(op);
      }
    },
    [shareDBDoc],
  );

  usePrettier({ submitOperation, activeFileId, content });

  // Called when a file in the sidebar is double-clicked.
  const handleRenameFileClick = useCallback(
    (fileId: FileId) => {
      // TODO better UX, maybe Bootstrap modal? Maybe edit inline?
      const newName = prompt('Enter new name');

      if (newName) {
        submitOperation((document) => ({
          ...document,
          files: {
            ...document.files,
            [fileId]: {
              ...document.files[fileId],
              name: newName,
            },
          },
        }));
      }
    },
    [submitOperation],
  );

  const deleteFile = useCallback(
    (fileId: FileId) => {
      closeTab(fileId);
      submitOperation((document) => {
        const updatedFiles = { ...document.files };
        delete updatedFiles[fileId];
        return { ...document, files: updatedFiles };
      });
    },
    [submitOperation, closeTab],
  );

  const createFile = useCallback(() => {
    const name = prompt('Enter new file name');
    if (name) {
      submitOperation((document) => ({
        ...document,
        files: { ...document.files, [randomId()]: { name, text: '' } },
      }));
    }
  }, [submitOperation]);

  // TODO prompt the user "Are you sure?"
  const handleDeleteFileClick = useCallback(
    (fileId: FileId, event: React.MouseEvent) => {
      // Stop propagation so that the outer listener doesn't fire,
      // which would try to open this file in a tab.
      event.stopPropagation();
      deleteFile(fileId);
    },
    [deleteFile],
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
      submitOperation((document) => ({ ...document, isInteracting: true }));
    } else {
      clearTimeout(interactTimeoutRef.current);
    }

    // Set `isInteracting: false` after a delay.
    interactTimeoutRef.current = setTimeout(() => {
      interactTimeoutRef.current = null;
      submitOperation((document) => ({ ...document, isInteracting: false }));
    }, 800);
  }, [submitOperation]);

  const files = content?.files;

  return (
    <div className="app">
      <div className="left">
        <Sidebar
          createFile={createFile}
          files={files}
          handleRenameFileClick={handleRenameFileClick}
          handleDeleteFileClick={handleDeleteFileClick}
          handleFileClick={openTab}
          setIsSettingsOpen={setIsSettingsOpen}
          isDirectoryOpen={isDirectoryOpen}
          toggleDirectory={toggleDirectory}
        />
        <Settings
          show={isSettingsOpen}
          onClose={handleSettingsClose}
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
          />
        ) : null}
      </div>
    </div>
  );
}

export default App;
