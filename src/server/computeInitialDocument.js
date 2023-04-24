import dotenv from 'dotenv';
import fs from 'fs';
import { randomId } from '../randomId.js';

// Lists files from the file system,
// converts them into the VZCode internal
// ShareDB-compatible data structure.
export const computeInitialDocument = () => {
  // Use the current working directory to look for files.
  const fullPath = process.cwd();
  dotenv.config({ path: '../../.env' });

  console.log(fullPath);

  // Isolate files, not directories.
  // Inspired by https://stackoverflow.com/questions/41472161/fs-readdir-ignore-directories
  const files = fs
    .readdirSync(fullPath, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name);

  // Initialize the document using our data structure for representing files.
  //  * Keys are file ids, which are random numbers.
  //  * Values are objects with properties:
  //    * text - the text content of the file
  //    * name - the file name
  const initialDocument = {};
  files.forEach((file) => {
    const id = randomId();
    initialDocument[id] = {
      text: fs.readFileSync(file, 'utf-8'),
      name: file,
    };
  });
  return initialDocument;
};
