import { useState, useEffect, useMemo, useCallback } from 'react';
import ShareDBClient from 'sharedb-client-browser/dist/sharedb-client-umd.cjs';
import { json1Presence } from './ot';
import { CodeEditor } from './CodeEditor';
import { diff } from './diff';
import { randomId } from './randomId';
import './style.css';

// Register our custom JSON1 OT type that supports presence.
// See https://github.com/vizhub-core/json1-presence
ShareDBClient.types.register(json1Presence.type);

// Establish the singleton ShareDB connection over WebSockets.
// TODO consider using reconnecting WebSocket
const { Connection } = ShareDBClient;
const socket = new WebSocket('ws://' + window.location.host + '/ws');
const connection = new Connection(socket);

function App() {
  // The ShareDB document.
  const [shareDBDoc, setShareDBDoc] = useState(null);

  // The ShareDB presence, for broadcasting our cursor position
  // so other clients can see it.
  // See https://share.github.io/sharedb/api/local-presence
  const [localPresence, setLocalPresence] = useState(null);

  // The `doc.data` part of the ShareDB document,
  // updated on each change to decouple rendering from ShareDB.
  const [data, setData] = useState(null);

  // True if the file menu is open.
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);

  // The id of the currently open file tab.
  const [activeFileId, setActiveFileId] = useState(null);

  // The ordered list of tabs.
  const [tabList, setTabList] = useState([]);

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
      shareDBDoc.on('op', (op) => {
        setData(shareDBDoc.data);
      });

      // Set up presence.
      // See https://github.com/share/sharedb/blob/master/examples/rich-text-presence/client.js#L53
      const presence = shareDBDoc.connection.getDocPresence(collection, id);

      // Subscribe to receive remote presence updates.
      presence.subscribe(function (error) {
        if (error) throw error;
      });

      // Set up our local presence for broadcasting this client's presence.
      setLocalPresence(presence.create(randomId()));
    });

    // TODO unsubscribe from presence
    // TODO unsubscribe from doc
  }, []);

  // Called when a tab is closed.
  const close = (fileIdToRemove) => (event) => {
    // Stop propagation so that the outer listener doesn't fire.
    event.stopPropagation();
    const i = tabList.findIndex((fileId) => fileId === fileIdToRemove);
    const newTabList = [...tabList.slice(0, i), ...tabList.slice(i + 1)];
    setActiveFileId(i === 0 ? newTabList[i] : newTabList[i - 1]);
    setTabList(newTabList);
  };

  // Called when a file in the sidebar is double-clicked.
  const renameFile = useCallback(
    (key) => {
      const newName = prompt('Enter new name');
      if (newName) {
        const currentDocument = shareDBDoc.data;
        const nextDocument = {
          ...currentDocument,
          [key]: {
            ...currentDocument[key],
            name: newName,
          },
        };
        shareDBDoc.submitOp(diff(currentDocument, nextDocument));
      }
    },
    [shareDBDoc]
  );

  // True if we are ready to actually render the active tab.
  const tabValid = data && activeFileId;

  return (
    <>
      <div className="tab-list">
        {tabList.map((fileId) => (
          <div
            key={fileId}
            className={
              tabValid ? `tab${fileId === activeFileId ? ' active' : ''}` : null
            }
            onClick={() => {
              setActiveFileId(fileId);
            }}
          >
            {tabValid ? data[fileId].name : ''}
            <div
              className={activeFileId ? 'bx bx-x tab-close' : ''}
              onClick={close(fileId)}
            ></div>
          </div>
        ))}
      </div>
      <div className="bottom-bar"></div>
      <div className="sidebar show">
        <ul className="nav-links">
          <li className={isFileMenuOpen ? 'show-menu' : ''}>
            <div className="icon-link">
              <a href="#">
                <i
                  id="folderIcon"
                  className={
                    isFileMenuOpen ? 'bx bx-folder-open' : 'bx bx-folder'
                  }
                ></i>
                <span className="link-name">Files</span>
              </a>
              <i
                className="bx bxs-chevron-down arrow"
                onClick={() => {
                  setIsFileMenuOpen(!isFileMenuOpen);
                }}
              ></i>
            </div>
            <ul className="sub-menu">
              <li>
                <a className="link-name" href="#">
                  Files
                </a>
              </li>
              {data
                ? Object.keys(data).map((key) => (
                    <li
                      key={key}
                      onClick={() => {
                        setActiveFileId(key);
                        if (!tabList.includes(key)) {
                          setTabList([...tabList, key]);
                        }
                      }}
                      onDoubleClick={() => {
                        renameFile(key);
                      }}
                    >
                      <a>{data[key].name}</a>
                    </li>
                  ))
                : null}
            </ul>
          </li>
          <li>
            <div className="profile-details">
              <a href="#">
                <i className="bx bx-cog"></i>
                <span className="link-name">Setting</span>
              </a>
              <ul className="sub-menu blank">
                <li>
                  <a className="link-name" href="#">
                    Setting
                  </a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
      {data && activeFileId ? (
        <CodeEditor
          className="editor"
          shareDBDoc={shareDBDoc}
          localPresence={localPresence}
          activeFileId={activeFileId}
        />
      ) : null}
    </>
  );
}

export default App;
