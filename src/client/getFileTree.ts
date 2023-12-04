import { Files, File, FileTree, Directory, FileTreeFile } from '../types';

export const getFileTree = (files: Files): FileTree => {
  const tree: FileTree = { name: 'files', children: [] };

  for (const fileId of Object.keys(files)) {
    const fileOrDirectory = files[fileId];

    // Ensure that it's either a File or a Directory
    if ('text' in fileOrDirectory) {
      const file = fileOrDirectory as File;
      const path = file.name.split('/');
      addToTree(tree, path, file, fileId);
    } else {
      const directory = fileOrDirectory as Directory;
      const path = directory.name.split('/');
      addToTree(tree, path, directory, fileId);
    }
  }

  return tree;
};

// Helper function to add files or directories to the tree
const addToTree = (
  node: FileTree,
  path: string[],
  fileOrDirectory: File | Directory,
  fileId: string
) => {
  const n = path.length;

  // Walk the path.
  for (let i = 0; i < n - 1; i++) {
    // Search for an existing child.
    let child: FileTree | undefined;
    const name = path[i];
    if (node.children) {
      child = node.children.find((nodeChild) => nodeChild.name === name);
    }

    // Create a child if none with matching name exists.
    if (!child) {
      child = {
        name,
        path: path.slice(0, i + 1).join('/'),
        children: [],
      };
      (node.children || (node.children = [])).push(child);
    }

    node = child;
  }

  // Add the file or directory to the tree
  const lastPathName = path[n - 1];
  const fileTreeFile: FileTreeFile = {
    name: lastPathName,
    fileId,
    file: fileOrDirectory as File,
  };

  // Check if it's a directory or a file and add accordingly
  if ('text' in fileOrDirectory) {
    (node.children || (node.children = [])).push(fileTreeFile);
  } else {
    const directory: FileTree = {
      name: lastPathName,
      path: path.join('/'),
      children: [fileTreeFile],
    };
    (node.children || (node.children = [])).push(directory);
  }
};
