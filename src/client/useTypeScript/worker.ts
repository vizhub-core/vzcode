import * as tsvfs from '@typescript/vfs';
import ts from 'typescript';
import { File, Files, VZCodeContent } from '../../types';

let ifFileSystemInitialized = false;
let fileSystem: ts.System = null;
let env: tsvfs.VirtualTypeScriptEnvironment = null;

// This is a place for things we only do _once_.
const initializeFileSystem = async () => {
  const compilerOptions = {};
  const fsMap = await tsvfs.createDefaultMapFromCDN(
    compilerOptions,
    ts.version,
    false,
    ts,
  );
  fileSystem = tsvfs.createSystem(fsMap);
};

onmessage = async ({ data }) => {
  // Initialize the file system.
  if (!ifFileSystemInitialized) {
    await initializeFileSystem();
  }

  // Sanity check.
  if (fileSystem === null) {
    throw new Error('File system not initialized');
  }

  //   console.log('Received message in TypeScript worker');

  // Example of `data`:
  //   {
  //     "event": "update-content",
  //     "details": {
  //       "files": {
  //         "11313733": {
  //           "text": "<!doctype html>\n<html>\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta namde=\"viewport\" content=\"width=device-width\" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n",
  //           "name": "fullDir/index.html"
  //         },
  //       },
  //       "isInteracting": false
  //     }
  //   }

  // Handle the update-content event, which
  // updates the files as they change.
  if (data.event === 'update-content') {
    // Unpack the files
    const content: VZCodeContent = data.details;
    const files: Files = content.files;

    //   console.log(JSON.stringify(files, null, 2));

    // Iterate over the files
    const root = [];
    for (const fileId of Object.keys(files)) {
      const file: File = files[fileId];

      // Ignore non-TypeScript files.
      // TODO rename .js to .tsx
      if (!file.name.endsWith('.ts')) {
        continue;
      }

      fileSystem.writeFile(file.name, file.text);
      root.push(file.name);

      // TODO - Handle renaming files.
      // TODO - Handle deleting files.
      // TODO - Handle directories.
    }

    env = tsvfs.createVirtualTypeScriptEnvironment(
      fileSystem,
      root,
      ts,
      {},
    );
  }

  if (data.event === 'autocomplete-request') {
    // Should not happen.
    if (env === null) {
      console.log('env is null');
      return;
    }

    const completions =
      env.languageService.getCompletionsAtPosition(
        data.location,
        data.pos,
        {},
      );

    postMessage({
      event: 'post-completions',
      detail: {
        completions,
        requestId: data.requestId,
      },
    });
  }
};
