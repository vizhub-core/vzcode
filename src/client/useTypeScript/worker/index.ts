import * as tsvfs from '@typescript/vfs';
import ts from 'typescript';
import { compilerOptions } from './constants';
import { handleMessageUpdateContent } from './handleMessageUpdateContent';
import { handleMessageAutocompleteRequest } from './handleMessageAutocompleteRequest';
import { handleMessageLintRequest } from './handleMessageLintRequest';
import { handleMessageTranspileRequest } from './handleMessageTranspileRequest';

let env: tsvfs.VirtualTypeScriptEnvironment = null;

const debug = false;

// This is a place for things we only do _once_.
const initializeFileSystem = async () => {
  if (debug) {
    console.log('initializeFileSystem');
  }

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

const setFile = (tsFileName: string, text: string) => {
  const existingFile = env.getSourceFile(tsFileName);
  if (existingFile === undefined) {
    env.createFile(tsFileName, text);
  } else {
    env.updateFile(tsFileName, text);
  }
};

// This is a promise that resolves when the file system is initialized.
let fileSystemInitializationPromise = null;
async function ensureFileSystemInitialized() {
  if (!fileSystemInitializationPromise) {
    fileSystemInitializationPromise =
      initializeFileSystem();
  }
  await fileSystemInitializationPromise;
}

onmessage = async ({ data }) => {
  if (debug) {
    console.log('message received');
  }

  // Ensure the file system is initialized.
  await ensureFileSystemInitialized();

  // Sanity check - should never happen.
  if (env === null) {
    throw new Error('File system not initialized');
  }

  switch (data.event) {
    case 'update-content':
      await handleMessageUpdateContent({
        debug,
        data,
        setFile,
      });
      break;

    case 'autocomplete-request':
      await handleMessageAutocompleteRequest({
        debug,
        data,
        env,
        setFile,
      });
      break;

    case 'lint-request':
      await handleMessageLintRequest({
        debug,
        data,
        env,
        setFile,
      });
      break;

    case 'transpile-request':
      await handleMessageTranspileRequest({ data });
      break;
  }
};
