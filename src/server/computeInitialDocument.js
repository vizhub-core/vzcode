import fs from 'fs';
import path from 'path';
import { randomId } from '../randomId.js';
import { enableDirectories, debugDirectories } from './featureFlags.js';

const isDirectory = (file) => file.endsWith('/');

// Lists files from the file system,
// converts them into the VZCode internal
// ShareDB-compatible data structure.
export const computeInitialDocument = ({ fullPath }) => {
  // Isolate files, not directories.
  // Inspired by https://stackoverflow.com/questions/41472161/fs-readdir-ignore-directories

  const unsearchedDirectories = [''];

  // Initialize the document using our data structure for representing files.
  const initialDocument = {
    // `files`
    //  * Keys are file ids, which are random numbers.
    //  * Values are objects with properties:
    //    * text - the text content of the file
    //    * name - the file name
    files: {},

    // `isInteracting`
    //  * Whether the user is currently interacting with the document
    //    using an interactive code widget such as number dragger.
    //  * When true, the auto-save to the file system is changed to be
    //    more frequent (throttled not debounced).
    isInteracting: false,
  };

  // Stack for recursively traversing directories.
  let files = [];

  while (unsearchedDirectories.length !== 0) {
    const currentDirectory = unsearchedDirectories.pop();
    const currentDirectoryPath = path.join(fullPath, currentDirectory);
    const newFiles = fs
      .readdirSync(currentDirectoryPath, { withFileTypes: true })
      .filter((dirent) => (enableDirectories ? true : dirent.isFile()))

      // Add a trailing slash for directories
      .map((dirent) => {
        const relativePath =
          currentDirectory === ''
            ? dirent.name
            : currentDirectory + '/' + dirent.name;

        if (dirent.isFile()) {
          return relativePath;
        }
        unsearchedDirectories.push(relativePath);
        return relativePath + '/';
      });
    // console.log(currentDirectory);

    files = [...files, ...newFiles];
  }

  files.forEach((file) => {
    const id = randomId();
    initialDocument.files[id] = {
      text: isDirectory(file)
        ? null
        : fs.readFileSync(path.join(fullPath, file), 'utf-8'),
      name: file,
    };
  });

  if (debugDirectories) {
    console.log('files:');
    console.log(files);
    console.log('initialDocument:');
    console.log(JSON.stringify(initialDocument, null, 2));
  }
  return initialDocument;
};
