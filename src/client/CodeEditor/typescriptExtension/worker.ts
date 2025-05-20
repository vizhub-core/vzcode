import {
  createDefaultMapFromCDN,
  createSystem,
  createVirtualTypeScriptEnvironment,
} from '@typescript/vfs';
import ts from 'typescript';
import * as Comlink from 'comlink';

// When importing this module, typescript says that it "cannot find the module or its corresponding type declarations"
// However, when this file is used as a web worker, no error occurs.
// As a result, this error is suppressed to avoid future confusion.
// @ts-expect-error
import { createWorker } from '@valtown/codemirror-ts/worker';

Comlink.expose(
  createWorker(async function () {
    const fsMap = await createDefaultMapFromCDN(
      { target: ts.ScriptTarget.ES2022 },
      '3.7.3',
      false,
      ts,
    );
    const system = createSystem(fsMap);
    const compilerOpts = {};
    return createVirtualTypeScriptEnvironment(
      system,
      [],
      ts,
      compilerOpts,
    );
  }),
);
