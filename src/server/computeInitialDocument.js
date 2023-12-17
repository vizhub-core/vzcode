import fs from 'fs';
import path from 'path';
import { randomId } from '../randomId.js';
import {
  enableDirectories,
  debugDirectories,
} from './featureFlags.js';
import createIgnore from 'ignore';

const isDirectory = (file) => file.endsWith('/');

/**
 * @param {string} fullPath - absolut path of the workspace root
 * @param {string} currentDirectoryPath - path where the ignore file is found, relative to fullPath
 * @param {string} fileName - name of the ignore file
 * @returns {string[]} parsed lines
 */
const parseIgnoreFile = (
  fullPath,
  currentDirectory,
  fileName,
) => {
  const filePath = path.join(
    fullPath,
    currentDirectory,
    fileName,
  );
  const content = fs.readFileSync(filePath, 'utf8');
  const globs = content
    .split(/(?:[\n\r]\s*)+/)
    .filter(
      (line) => line.length > 0 && !line.startsWith('#'),
    )
    .map((line) => {
      const { bang, glob } = line.match(
        /^(?<bang>!?)(?<glob>.*)$/,
      ).groups;
      const relativeGlob = path.posix.join(
        currentDirectory,
        glob,
      );
      return bang + relativeGlob;
    });
  if (debugDirectories) {
    console.debug(
      'at',
      currentDirectory,
      'parsing',
      fileName,
      'obtained globs',
      globs,
    );
  }
  return globs;
};

// Lists files from the file system,
// converts them into the VZCode internal
// ShareDB-compatible data structure.
export const computeInitialDocument = ({ fullPath }) => {
  // Isolate files, not directories.
  // Inspired by https://stackoverflow.com/questions/41472161/fs-readdir-ignore-directories

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

  /**
   * Stack for recursively traversing directories.
   * @type {string[]}
   */
  let files = [];

  // default paths to ignore
  const globs = ['.git'];
  const ignoreStack = [
    { ignore: createIgnore().add('globs'), globs },
  ];

  const unsearchedDirectories = [
    { currentDirectory: '.', ignoreStack },
  ];

  while (unsearchedDirectories.length !== 0) {
    const { currentDirectory, ignoreStack } =
      unsearchedDirectories.pop();
    const currentDirectoryPath = path.join(
      fullPath,
      currentDirectory,
    );
    const dirEntries = fs
      .readdirSync(currentDirectoryPath, {
        withFileTypes: true,
      })
      .filter((dirent) =>
        enableDirectories ? true : dirent.isFile(),
      );
    // find .ignore or .gitignore files in the current directory
    const ignoreFiles = dirEntries
      .filter(
        (dirent) =>
          dirent.isFile() &&
          /^\.(?:git)?ignore$/.test(dirent.name),
      )
      .map((file) => file.name);
    const ignoreEntry = ignoreStack.at(-1);
    let { ignore } = ignoreEntry;
    let newIgnoreStack = ignoreStack;
    if (ignoreFiles.length > 0) {
      const globs = ignoreFiles.flatMap((fileName) =>
        parseIgnoreFile(
          fullPath,
          currentDirectory,
          fileName,
        ),
      );
      const newEntry = { ignore, globs };
      newIgnoreStack = ignoreStack.slice();
      newIgnoreStack.push(newEntry);
      ignore = createIgnore().add(
        newIgnoreStack.flatMap((entry) => entry.globs),
      );
      newEntry.ignore = ignore;
      if (debugDirectories) {
        console.debug(
          'at',
          currentDirectory,
          'ignoring globs',
          newIgnoreStack.map((item) => item.globs),
        );
      }
    }
    const newFiles = dirEntries
      .filter((dirent) => {
        let keep = !ignore.ignores(
          path.posix.join(currentDirectory, dirent.name),
        );
        if (debugDirectories && !keep) {
          console.debug(
            'at',
            currentDirectory,
            'ignoring',
            dirent.name,
          );
        }
        return keep;
      })
      // Add a trailing slash for directories
      .map((dirent) => {
        const relativePath = path.posix.join(
          currentDirectory,
          dirent.name,
        );

        if (!dirent.isDirectory()) {
          return relativePath;
        }
        unsearchedDirectories.push({
          currentDirectory: relativePath,
          ignoreStack: newIgnoreStack,
        });
        return relativePath + '/';
      });
    // console.log(currentDirectory);

    files.push(...newFiles);
  }

  files.forEach((file) => {
    const id = randomId();
    initialDocument.files[id] = {
      text: isDirectory(file)
        ? null
        : fs.readFileSync(
            path.join(fullPath, file),
            'utf-8',
          ),
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
