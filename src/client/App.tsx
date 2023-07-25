import { useState, useEffect, useCallback } from 'react';
import ShareDBClient from 'sharedb-client-browser/dist/sharedb-client-umd.cjs';
import { json1Presence } from '../ot';
import { randomId } from '../randomId';
import { CodeEditor } from './CodeEditor';
import { diff } from './diff';
import { Settings } from './settings';
import { Sidebar } from './Sidebar';
import './style.scss';
import { oneDark } from '@codemirror/theme-one-dark';
import { FileId, Files } from '../types';
import { TabList } from './TabList';
import { useOpenDirectories } from './useOpenDirectories';
import { useTabsState } from './useTabsState';

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
  const [shareDBDoc, setShareDBDoc] = useState(null);

  // Local ShareDB presence, for broadcasting our cursor position
  // so other clients can see it.
  // See https://share.github.io/sharedb/api/local-presence
  const [localPresence, setLocalPresence] = useState(null);

  // The document-level presence object, which emits
  // changes in remote presence.
  const [docPresence, setDocPresence] = useState(null);

  // The `doc.data` part of the ShareDB document,
  // updated on each change to decouple rendering from ShareDB.
  const [data, setData] = useState<Files>(null);

  // The id of the currently open file tab.
  const [activeFileId, setActiveFileId] = useState<FileId>(null);

  const { tabList, closeTab, openTab } = useTabsState(
    activeFileId,
    setActiveFileId
  );

  // The current theme.
  const [theme, setTheme] = useState(oneDark);

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
      setData(shareDBDoc.data);

      // Listen for all changes and update `data`.
      // This decouples rendering logic from ShareDB.
      // This callback gets called on each change.
      shareDBDoc.on('op', () => {
        setData(shareDBDoc.data);
      });

      // Set up presence.
      // See https://github.com/share/sharedb/blob/master/examples/rich-text-presence/client.js#L53
      const docPresence = shareDBDoc.connection.getDocPresence(collection, id);

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

  // Called when a file in the sidebar is double-clicked.
  const handleRenameFileClick = useCallback(
    (fileId: FileId) => {
      const newName = prompt('Enter new name');
      if (newName) {
        const currentDocument = shareDBDoc.data;
        const nextDocument = {
          ...currentDocument,
          [fileId]: {
            ...currentDocument[fileId],
            name: newName,
          },
        };
        shareDBDoc.submitOp(diff(currentDocument, nextDocument));
      }
    },
    [shareDBDoc]
  );

  const deleteFile = useCallback(
    (fileId: FileId) => {
      // Close the tab in case it's open.
      // TODO consistently use either "key" or "fileId" naming
      closeTab(fileId);

      const currentDocument = shareDBDoc.data;
      const nextDocument = { ...currentDocument };
      delete nextDocument[fileId];
      shareDBDoc.submitOp(diff(currentDocument, nextDocument));
    },
    [shareDBDoc, closeTab]
  );

  // TODO prompt the user "Are you sure?"
  const handleDeleteFileClick = useCallback(
    (fileId: FileId, event: React.MouseEvent) => {
      // Stop propagation so that the outer listener doesn't fire,
      // which would try to open this file in a tab.
      event.stopPropagation();
      deleteFile(fileId);
    },
    [deleteFile]
  );

  const createFile = useCallback(() => {
    // TODO better UI, maybe Bootstrap modal? Maybe edit inline?
    const name = prompt('Enter new file name');
    if (!name) return;
    const currentDocument = shareDBDoc.data;
    const nextDocument = {
      ...currentDocument,
      [randomId()]: { name, text: '' },
    };
    shareDBDoc.submitOp(diff(currentDocument, nextDocument));
  }, [shareDBDoc]);

  const handleSettingsClose = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  return (
    <div className="app">
      <div className="left">
        <Sidebar
          createFile={createFile}
          files={data}
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
          data={data}
          tabList={tabList}
          activeFileId={activeFileId}
          setActiveFileId={setActiveFileId}
          closeTab={closeTab}
        />
        {data && activeFileId ? (
          <CodeEditor
            className="editor"
            shareDBDoc={shareDBDoc}
            localPresence={localPresence}
            docPresence={docPresence}
            activeFileId={activeFileId}
            theme={theme}
          />
        ) : null}
      </div>
    </div>
  );
}

export default App;
