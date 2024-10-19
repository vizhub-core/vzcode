// Recursively sorts the file tree in-place.
// Sorts first to group directories before files.
// Sorts second alphabetically.

import { FileTree, FileTreeFile } from '../types';

// From https://github.com/vizhub-core/vizhub/blob/main/vizhub-v2/packages/neoFrontend/src/pages/VizPage/Body/Editor/FilesSection/FileTree/sortFileTree.js
export const sortFileTree = (fileTree: FileTree) => {
  if (fileTree.children) {
    fileTree.children.sort((a, b) => {
      const aIsFile = (a as FileTreeFile).file ? 1 : 0;
      const bIsFile = (b as FileTreeFile).file ? 1 : 0;
      // Directories before files.
      return (
        aIsFile - bIsFile || a.name.localeCompare(b.name)
      );
    });
    fileTree.children.forEach(sortFileTree);
  }
  return fileTree;
};
