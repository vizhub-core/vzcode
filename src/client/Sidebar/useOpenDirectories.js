import { useState, useCallback } from 'react';

// TODO bring this feature back
// When a page is opened with an active file,
// make sure all the directories leading to that file
// are opened automatically.
//export const initialOpenDirectories = (activeFile) => {
//  const openDirectories = {};
//  if (activeFile) {
//    const path = activeFile.split('/');
//    for (let i = 1; i < path.length; i++) {
//      openDirectories[path.slice(0, i).join('/')] = true;
//    }
//  }
//  return openDirectories;
//};

// Inspired by
// https://github.com/vizhub-core/vizhub/blob/main/vizhub-v2/packages/neoFrontend/src/pages/VizPage/Body/Editor/FilesSection/useOpenDirectories.js
export const useOpenDirectories = (activeFile) => {
  //const [openDirectories, setOpenDirectories] = useState(
  //  initialOpenDirectories(activeFile)
  //);
  const [openDirectories, setOpenDirectories] = useState({});

  // TODO consider useReducer to avoid event listener churn
  const toggleDirectory = useCallback(
    (path) => {
      console.log(openDirectories[path], 'here');
      setOpenDirectories(
        Object.assign({}, openDirectories, {
          [path]: !openDirectories[path],
        })
      );
    },
    [openDirectories]
  );
  return { openDirectories, toggleDirectory };
};
