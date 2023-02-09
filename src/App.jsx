import { useState, useEffect, useMemo } from "react";
import ShareDBClient from "sharedb-client-browser/sharedb-client-json1-browser.js";
import { CodeEditor } from './CodeEditor';
import "./App.css";
import "./style.css";

const { Connection } = ShareDBClient;
const socket = new WebSocket("ws://" + window.location.host);
console.log(window.location.host);
const connection = new Connection(socket);

function App() {
  const [data, setData] = useState(null);

  const [shareDBDoc, setShareDBDoc] = useState(null);

  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [activeFileId, setActiveFileId] = useState(null)

  useEffect(() => {
    const shareDBDoc = connection.get("documents", "1");

    shareDBDoc.subscribe(() => {
      console.log('Setting ShareDB Doc and data')
      setShareDBDoc(shareDBDoc);
      // TODO update every time the data changes
      setData(shareDBDoc.data);
    });
  }, []);

  function close() {
    console.log('close')
    setActiveFileId(null)
  }
  return (
    <>
      <div className="tabList">
        <div className={data && activeFileId ? 'tab' : null}>{data && activeFileId ? data[activeFileId].name : ''}
          <div className={activeFileId ? "bx bx-x tab-close" : ''} onClick={close}></div>
        </div>
      </div>
      <div className="bottomBar"></div>
      <div className="sidebar show">
        <ul className="nav-links">
          <li className={isFileMenuOpen ? "showMenu" : ""}>
            <div className="icon-link">
              <a href="#">
                <i
                  id="folderIcon"
                  className={
                    isFileMenuOpen ? "bx bx-folder-open" : "bx bx-folder"
                  }
                ></i>
                <span className="link_name">Files</span>
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
                <a className="link_name" href="#">
                  Files
                </a>
              </li>
              {data
                ? Object.keys(data).map((key) => (
                  <li onClick={() => {
                    setActiveFileId(key)
                  }
                  }>
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
                <span className="link_name">Setting</span>
              </a>
              <ul className="sub-menu blank">
                <li>
                  <a className="link_name" href="#">
                    Setting
                  </a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div >
      {/* editor section */}


      {/* <textarea className="Editor" name="editor" id="edit" value={activeFileId && activeFileText ? data[activeFileId].text : ""}></textarea>
     */}
      {
        (data && activeFileId) ? <CodeEditor className="Editor" shareDBDoc={shareDBDoc} activeFileId={activeFileId} /> : null
      }


    </>
  );
}

export default App;
