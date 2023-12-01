import * as tsvfs from '@typescript/vfs';
import ts from 'typescript';
import { File, Files, VZCodeContent } from '../../types';
import {
  AutocompleteRequest,
  AutocompleteResponse,
  LinterRequest,
  LinterResponse,
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

const setFile = (tsFileName: string, text: string) => {
  const existingFile = env.getSourceFile(tsFileName);
  if (existingFile === undefined) {
    env.createFile(tsFileName, text);
  } else {
    env.updateFile(tsFileName, text);
  }
};

// Inspired by: https://stackblitz.com/edit/codemirror-6-typescript?file=client%2Findex.ts%3AL44-L44
const convertToCodeMirrorDiagnostic = (
  tsErrors: ts.Diagnostic[],
) => {
  return tsErrors.map((tsError: ts.Diagnostic) => ({
    from: tsError.start,
    to: tsError.start + tsError.length,
    severity: 'error',
    message:
      typeof tsError.messageText === 'string'
        ? tsError.messageText
        : tsError.messageText.messageText,
  }));
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

      setFile(tsFileName, text);
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
    if (isTS(tsFileName) && fileContent != "") {
      // Update the file in the file system to the
      // absolute latest version. This is critical
      // for correct completions.
      setFile(tsFileName, fileContent);

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

  if (data.event === 'lint-request') {
    if (debug) {
      console.log('Lint Request');
    }
    const linterRequest: LinterRequest = data;
    const { fileName, fileContent, requestId } =
      linterRequest;

    const tsFileName = getTSFileName(fileName);
    let tsErrors = [];
    // Since we are also updating the server when we autocomplete we do not need to update
    if (isTS(tsFileName) && fileContent != "") {
      setFile(tsFileName, fileContent);
      // Creates an array of diagnostic objects containing
      // both semantic and syntactic diagnostics.
      tsErrors = env.languageService
        .getSemanticDiagnostics(tsFileName)
        .concat(
          env.languageService.getSyntacticDiagnostics(
            tsFileName,
          ),
        );

      // Be less aggressive for non-TS files,
      // e.g. files that end in .js or .jsx.
      if (!isTS(fileName)) {
        // This code is for errors like:
        // "Binding element 'data' implicitly has an 'any' type."
        const LINT_ERROR_CODE_ANY = 7031;

        // This code is for errors like:
        // "Parameter 'selection' implicitly has an 'any' type.""
        const LINT_ERROR_CODE_ANY_PARAM = 7006;

        // This code is for errors like:
        // "Cannot find module 'd3' or its corresponding type declarations."
        const LINT_ERROR_CODE_IMPORT = 2307;

        if (debug) {
          console.log(tsErrors);
        }
        tsErrors = tsErrors.filter(
          (error: { code: number }) =>
            error.code !== LINT_ERROR_CODE_ANY &&
            error.code !== LINT_ERROR_CODE_IMPORT &&
            error.code !== LINT_ERROR_CODE_ANY_PARAM,
        );
      }
      tsErrors = convertToCodeMirrorDiagnostic(tsErrors);
    }

    const linterResponse: LinterResponse = {
      event: 'post-error-linter',
      tsErrors,
      requestId,
    };
    postMessage(linterResponse);
  }
};
