// Inspired by

import { VizFiles, FileTree } from '../types';

// https://github.com/vizhub-core/vizhub/blob/main/vizhub-v2/packages/neoFrontend/src/pages/VizPage/Body/Editor/FilesSection/FileTree/getFileTree.js
export const getFileTree = (files: VizFiles): FileTree => {
  const tree: FileTree = { name: 'files' };
  for (const fileId of Object.keys(files)) {
    const file = files[fileId];
    const path = file.name.split('/');
    const n = path.length;
    let node = tree;

    // Walk the path.
    for (let i = 0; i < n - 1; i++) {
      // Search for an existing child.
      let child: FileTree | undefined;
      const name = path[i];
      if (node.children) {
        for (let j = 0; j < node.children.length; j++) {
          const nodeChild = node.children[j];
          if (nodeChild.name === name) {
            child = nodeChild;
            break;
          }
        }
      }

      // Create a child if none with matching name exists.
      if (!child) {
        child = {
          name: path[i],
          path: path.slice(0, i + 1).join('/'),
        };
        (node.children || (node.children = [])).push(child);
      }

      node = child;
    }

    // file.text being `null` signifies
    // that this is a directory.
    if (file.text !== null) {
      (node.children || (node.children = [])).push({
        name: path[n - 1],
        file,
        fileId,
      });
    }
  }
  return tree;
};
