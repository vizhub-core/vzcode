import * as tsvfs from '@typescript/vfs';
import ts from 'typescript';
import { File, Files, VZCodeContent } from '../../types';

let isFileSystemInitialized = false;

let env: tsvfs.VirtualTypeScriptEnvironment = null;

// This is a place for things we only do _once_.
const initializeFileSystem = async () => {
  const compilerOptions: ts.CompilerOptions = {};

  // `true` breaks in a Web Worker because
  // this uses `localStorage` under the hood,
  // which is not available in a Web Worker.
  const cache = false;

  const fsMap = await tsvfs.createDefaultMapFromCDN(
    compilerOptions,
    ts.version,
    cache,
    ts,
  );
  const sys: ts.System = tsvfs.createSystem(fsMap);

  // We'll add files to this later.
  const rootFiles = [];

  env = tsvfs.createVirtualTypeScriptEnvironment(
    sys,
    rootFiles,
    ts,
    compilerOptions,
  );
};

onmessage = async ({ data }) => {
  // Initialize the file system.
  if (!isFileSystemInitialized) {
    isFileSystemInitialized = true;
    await initializeFileSystem();
  }

  // Sanity check.
  if (env === null) {
    throw new Error('File system not initialized');
  }

  // Handle the update-content event, which
  // updates the files as they change.
  if (data.event === 'update-content') {
    // Unpack the files
    const content: VZCodeContent = data.details;
    const files: Files = content.files;

    // Iterate over the files

    for (const fileId of Object.keys(files)) {
      const file: File = files[fileId];

      if (
        // !file.name.endsWith('.js') &&
        // !file.name.endsWith('.jsx') &&
        !file.name.endsWith('.ts') &&
        !file.name.endsWith('.tsx')
      ) {
        continue;
      }

      const existingFile = env.getSourceFile(file.name);

      console.log('existingFile', existingFile);
      if (existingFile === undefined) {
        env.createFile(file.name, file.text);
      } else {
        env.updateFile(file.name, file.text);
      }
      // TODO - Handle renaming files.
      // TODO - Handle deleting files.
      // TODO - Handle directories.
    }
  }

  if (data.event === 'autocomplete-request') {
    // Should not happen.
    if (env === null) {
      console.log('env is null');
      return;
    }

    // Example of `data`:
    // {
    //   "event": "autocomplete-request",
    //   "pos": 8,
    //   "location": "index.js",
    //   "requestId": "0.9090605799171392"
    // }

    const { fileName, position, requestId } = data;

    const completions =
      env.languageService.getCompletionsAtPosition(
        fileName,
        position,
        {},
      );

    postMessage({
      event: 'post-completions',
      detail: {
        completions,
        requestId,
      },
    });
  }
};
