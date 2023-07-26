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
export const useOpenDirectories = () => {
  // The set of open directories by path/
  const [openDirectories, setOpenDirectories] = useState<Set<string>>(
    new Set(),
  );

  // Whether a directory is open.
  const isDirectoryOpen: (path: string) => boolean = useCallback(
    (path) => openDirectories.has(path),
    [openDirectories],
  );

  // Toggle whether a directory is open.
  const toggleDirectory = useCallback(
    (path) => {
      const newOpenDirectories = new Set(openDirectories);
      newOpenDirectories[isDirectoryOpen(path) ? 'delete' : 'add'](path);
      setOpenDirectories(newOpenDirectories);
    },
    [openDirectories, isDirectoryOpen],
  );

  return { isDirectoryOpen, toggleDirectory };
};
