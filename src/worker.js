import * as tsvfs from '@typescript/vfs';
import ts from 'typescript';

let previousDocument = null;
let currentDocument = null;

const compilerOptions = {};
const fsMap = await tsvfs.createDefaultMapFromCDN(
  compilerOptions,
  ts.version,
  false,
  ts,
);

let system = tsvfs.createSystem(fsMap);

self.onconnect = (e) => {
  const port = e.ports[0];

  port.onmessage = (e) => {
    if (e.data.event === 'update-content') {
      //Shared Workers do not have access to DOM. To see these logs go to:
      //chrome://inspect/#workers
      console.log('Content has been updated');
      //Handle initial render
      if (previousDocument === null) {
        previousDocument = e.data.details;
        init();
      } else {
        //Else perform comparison
        currentDocument = e.data.details;
        save();
      }
    }
    if (e.data.event === 'autocomplete-request') {
      console.log('Autocomplete request');
      let root = [];
      //Get all the files in shareDB and add them to rootFiles for env
      for (const key in currentDocument.files) {
        const file = previousDocument.files[key];
        //TODO: Adapt for all file types
        if (file.name.includes('.ts')) {
          root.push(file.name);
        }
      }
      const env = tsvfs.createVirtualTypeScriptEnvironment(
        system,
        root,
        ts,
        {},
      );
      fsMap.set(e.data.location, e.data.text);
      let completions =
        env.languageService.getCompletionsAtPosition(
          e.data.location,
          e.data.pos,
          {},
        );
      port.postMessage({
        event: 'Post-completions',
        detail: completions,
      });
    }
  };
};

//Taken from our nodeJS code. Does the same comparison except changes our ts system
const save = () => {
  // Take a look at each file (key) previously and currently.
  const allKeys = Object.keys({
    ...currentDocument.files,
    ...previousDocument.files,
  });
  for (const key of allKeys) {
    const previous = previousDocument.files[key];
    const current = currentDocument.files[key];

    // If this file was neither created nor deleted...
    if (previous && current) {
      // Handle changing of text content.
      if (previous.text !== current.text) {
        system.writeFile(current.name, current.text);
      }

      // Handle renaming files.
      if (previous.name !== current.name) {
        const content = system.readFile(previous.name);
        if (content) {
          system.deleteFile(previous.name);
          system.writeFile(current.name, content);
        }
      }
    }

    // Handle deleting files and directories.
    // Note: The TypeScript VFS does not differentiate between directories and files.
    // So, we'll simply remove the file using the system.
    if (previous && !current) {
      system.deleteFile(previous.name);
    }

    // Handle creating files.
    if (!previous && current) {
      system.writeFile(current.name, current.text);
    }
  }

  previousDocument = currentDocument;
};

//Initializes the typescript file system. Done on initial render
const init = () => {
  for (const key in previousDocument.files) {
    const file = previousDocument.files[key];
    system.writeFile(file.name, file.text);
  }
};
