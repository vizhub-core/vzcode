import * as tsvfs from '@typescript/vfs';
import ts from 'typescript';
import { File, Files, VZCodeContent } from '../../types';
import {
  AutocompleteRequest,
  AutocompleteResponse,
} from './requestTypes';

let isFileSystemInitialized = false;

let env: tsvfs.VirtualTypeScriptEnvironment = null;

const debug = false;

// replace .js or .jsx with .ts or .tsx,
// to support TypeScript completions on non-TS files.
const getTSFileName = (fileName: string) => {
  if (fileName.endsWith('.js')) {
    return fileName.replace('.js', '.ts');
  }
  if (fileName.endsWith('.jsx')) {
    return fileName.replace('.jsx', '.tsx');
  }
  return fileName;
};

// Returns true if the file name ends with `.ts` or `.tsx`.
const isTS = (fileName: string) => {
  return (
    fileName.endsWith('.ts') || fileName.endsWith('.tsx')
  );
};

// This is a place for things we only do _once_.
const initializeFileSystem = async () => {
  if (debug) {
    console.log('initializeFileSystem');
  }
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

  if (debug) {
    console.log('initializeFileSystem done');
  }
};

onmessage = async ({ data }) => {
  if (debug) {
    console.log('message received');
  }
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
  // This handles the cases where:
  //  * The file system is populated for the first time.
  //  * Files are edited by remote users.
  if (data.event === 'update-content') {
    if (debug) {
      console.log('update-content message received');
    }
    // Unpack the files
    const content: VZCodeContent = data.details;
    const files: Files = content.files;

    // Iterate over the files

    for (const fileId of Object.keys(files)) {
      const file: File = files[fileId];
      const { name, text } = file;

      const tsFileName = getTSFileName(name);

      if (!isTS(tsFileName)) {
        continue;
      }

      const existingFile = env.getSourceFile(tsFileName);
      if (existingFile === undefined) {
        env.createFile(tsFileName, text);
      } else {
        env.updateFile(tsFileName, text);
      }
      // TODO - Handle renaming files.
      // TODO - Handle deleting files.
      // TODO - Handle directories.
    }
  }

  if (data.event === 'autocomplete-request') {
    if (debug) {
      console.log('autocomplete-request message received');
    }
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

    const autocompleteRequest: AutocompleteRequest = data;
    const { fileName, fileContent, position, requestId } =
      autocompleteRequest;

    const tsFileName = getTSFileName(fileName);

    let completions = null;
    if (isTS(tsFileName)) {
      // Update the file in the file system to the
      // absolute latest version. This is critical
      // for correct completions.
      env.updateFile(tsFileName, fileContent);

      completions =
        env.languageService.getCompletionsAtPosition(
          tsFileName,
          position,
          {},
        );
    }

    const autocompleteResponse: AutocompleteResponse = {
      event: 'post-completions',
      completions,
      requestId,
    };

    postMessage(autocompleteResponse);
  }

  // Handle the transpile-request event, which
  // transpiles TypeScript to JavaScript.
  if (data.event === 'transpile-request') {
    const tsCode = data.tsCode;

    const compilerOptions = {
      jsx: ts.JsxEmit.React,
    };

    const jsCode = ts.transpileModule(tsCode, {
      compilerOptions,
    }).outputText;

    postMessage({
      event: 'transpile-response',
      jsCode,
      fileId: data.fileId,
    });
  }
};
