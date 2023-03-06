import { useState, useEffect, useMemo, useCallback } from 'react';
import ShareDBClient from 'sharedb-client-browser/dist/sharedb-client-umd.cjs';
import OTJSON1Presence from 'sharedb-client-browser/dist/ot-json1-presence-umd.cjs';

console.log(ShareDBClient);
console.log(OTJSON1Presence);

const { json1Presence } = OTJSON1Presence;

ShareDBClient.types.register(json1Presence.type);

import { CodeEditor } from './CodeEditor';
import { diff } from './diff';
import './style.css';

const { Connection } = ShareDBClient;
const socket = new WebSocket('ws://' + window.location.host + '/ws');
const connection = new Connection(socket);

function App() {
  const [data, setData] = useState(null);

  const [shareDBDoc, setShareDBDoc] = useState(null);

  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [activeFileId, setActiveFileId] = useState(null);

  const [tabList, setTabList] = useState([]);

  // Set up the connection to ShareDB.
  useEffect(() => {
    const shareDBDoc = connection.get('documents', '1');

    // Subscribe to the document to get updates.
    shareDBDoc.subscribe(() => {
      // Expose ShareDB doc to downstream logic.
      setShareDBDoc(shareDBDoc);

      // Set initial data.
      setData(shareDBDoc.data);

      // Listen for all changes and update `data`.
      // This decouples rendering logic from ShareDB.
      shareDBDoc.on('op', (op) => {
        setData(shareDBDoc.data);
      });
    });
  }, []);

  const close = (fileIdToRemove) => (event) => {
    // Stop propagation so that the outer listener doesn't fire.
    event.stopPropagation();
    const i = tabList.findIndex((fileId) => fileId === fileIdToRemove);
    const newTabList = [...tabList.slice(0, i), ...tabList.slice(i + 1)];
    setActiveFileId(i === 0 ? newTabList[i] : newTabList[i - 1]);
    setTabList(newTabList);
  };

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
          activeFileId={activeFileId}
        />
      ) : null}
    </>
  );
}

export default App;
