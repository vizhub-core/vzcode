import fs from 'fs';
import path from 'path';
import { randomId } from '../randomId.js';

// Feature flag for directories.
const directories = true;

const isDirectory = (file) => file.endsWith('/');

// Lists files from the file system,
// converts them into the VZCode internal
// ShareDB-compatible data structure.
export const computeInitialDocument = ({ fullPath }) => {
  // Isolate files, not directories.
  // Inspired by https://stackoverflow.com/questions/41472161/fs-readdir-ignore-directories

  // TODO recursively list out directories
  // while (unlistedDirectories.length !== 0){
  //   ...
  // }
  const unlistedDirectories = [];

  const files = fs
    .readdirSync(fullPath, { withFileTypes: true })
    .filter((dirent) => (directories ? true : dirent.isFile()))

    // Add a trailing slash for directories
    .map((dirent) => {
      if (dirent.isFile()) {
        return dirent.name;
      }
      unlistedDirectories.push(dirent.name);
      return dirent.name + '/';
    });

  // console.log(files);

  // Initialize the document using our data structure for representing files.
  //  * Keys are file ids, which are random numbers.
  //  * Values are objects with properties:
  //    * text - the text content of the file
  //    * name - the file name
  const initialDocument = {};
  files.forEach((file) => {
    const id = randomId();
    initialDocument[id] = {
      text: isDirectory(file)
        ? null
        : fs.readFileSync(path.join(fullPath, file), 'utf-8'),
      name: file,
    };
  });
  return initialDocument;
};
