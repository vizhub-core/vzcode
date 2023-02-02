import { useState, useEffect, useMemo } from "react";
import "./App.css";
import "./style.css";
import ShareDBClient from "sharedb-client-browser/sharedb-client-json1-browser.js";

const { Connection } = ShareDBClient;
const socket = new WebSocket("ws://" + window.location.host);
const connection = new Connection(socket);

function App() {
  const [data, setData] = useState(null);

  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);

  useEffect(() => {
    const doc = connection.get("documents", "1");

    doc.subscribe(() => {
      setData(doc.data);
    });
  }, []);

  // const parsedData = useMemo(() => {
  //   if (!data) return null;
  //   return Object.keys(data).map((key) => data[key]);
  // }, [data]);

  // console.log(parsedData);

  // let parsedData = {};
  // // // Gets the files from the ShareDB structure and fills them into the sidebar
  // function fillData() {
  //   let fileList = document.querySelector(".sub-menu");
  //   let i = 0;
  //   for (var key in data) {
  //     let file = JSON.stringify(data[key].name);
  //     let content = JSON.stringify(data[key].text);
  //     file = file.replace(/['"]+/g, "");
  //     fileList.innerHTML += "<li><a>" + file + "</a></li>";
  //     parsedData[i] = {
  //       name: file,
  //       content: content,
  //     };
  //     i++;
  //   }
  // }

  // // Lets you click on a file.
  // function showContent() {
  //   let file = document.querySelectorAll(".sub-menu li");
  //   for (var i = 0; i < file.length; i++) {
  //     file[i].addEventListener("click", (e) => {
  //       let fileName = e.target.innerHTML;
  //       let text = document.getElementById("edit");
  //       for (var key in parsedData) {
  //         if (parsedData[key].name === fileName) {
  //           var content = parsedData[key].content.replace('\n', '<br />');
  //           text.value = content;
  //         }
  //       }
  //     });
  //   }
  // }

  //fillData();
  // showContent();

  return (
    <>
      <div className="tabList"></div>
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
                onClick={(e) => {
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
                    <li>
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
      </div>
      <textarea className="TextEdit" name="editor" id="edit">
        Hello
      </textarea>
    </>
  );
}

export default App;
