import { useState, useEffect } from 'react';
import './App.css';
import './style.css';
import ShareDBClient from 'sharedb-client-browser/sharedb-client-json1-browser.js';

const { Connection } = ShareDBClient;
const socket = new WebSocket('ws://' + window.location.host);
const connection = new Connection(socket);

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const doc = connection.get('documents', '1');

    doc.subscribe(() => {
      setData(doc.data);
    });
  }, []);


  function showFiles() {
    let arrow = document.querySelectorAll(".arrow");
    for (var i = 0; i < arrow.length; i++) {
      arrow[i].addEventListener("click", (e) => {
        let arrowParent = e.target.parentElement.parentElement;//selecting main parent of arrow
        arrowParent.classList.toggle("showMenu");
        let folder = document.getElementById("folderIcon");
        if (folder.className === "bx bx-folder-open") {
          folder.className = "bx bx-folder";
        } else {
          folder.className = "bx bx-folder-open";
        }
      });
    }
  }

  let parsedData = {};

  function fillData() {
    let fileList = document.querySelector(".sub-menu");
    let i = 0;
    for (var key in data) {
      let file = JSON.stringify(data[key].name);
      let content = JSON.stringify(data[key].text);
      file = file.replace(/['"]+/g, '');
      fileList.innerHTML += '<li><a>' + file + '</a></li>'
      parsedData[i] = {
        name: file,
        content: content,
      }
      i++;
    }
  }

  function showContent() {
    let file = document.querySelectorAll(".sub-menu li");
    for (var i = 0; i < file.length; i++) {
      file[i].addEventListener("click", (e) => {
        let fileName = e.target.innerHTML;
        let text = document.getElementById("edit");
        for (var key in parsedData) {
          if (parsedData[key].name === fileName) {
            var content = parsedData[key].content.replace('\n', '<br />');
            text.value = content;
            console.log(content);
          }
        }
      });
    }
  }


  fillData();
  showContent();


  return (
    <>
      <link href='https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css' rel='stylesheet'></link>
      <div className="tabList"></div><div className="bottomBar"></div><div className="sidebar show">

        <ul className="nav-links">
          <li>
            <div className="iocn-link">
              <a href="#">
                <i id="folderIcon" className='bx bx-folder'></i>
                <span className="link_name">Files</span>
              </a>
              <i className='bx bxs-chevron-down arrow' onClick={showFiles()}></i>
            </div>
            <ul className="sub-menu">
              <li><a className="link_name" href="#">Files</a></li>
            </ul>
          </li>
          <li>
            <div className="profile-details">
              <a href="#">
                <i className='bx bx-cog'></i>
                <span className="link_name">Setting</span>
              </a>
              <ul className="sub-menu blank">
                <li><a className="link_name" href="#">Setting</a></li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
      <textarea className="TextEdit" name="editor" id="edit">Hello</textarea>
    </>
  );
}

export default App;
