import { assert, describe, expect, it } from 'vitest';
import { ascending } from 'd3-array';
import path from 'path';
import { fileURLToPath } from 'url';
import { computeInitialDocument } from '../src/server/computeInitialDocument';

const getSampleFiles = (sampleDirectory) => {
  const filename = fileURLToPath(import.meta.url);
  const dirname = path.dirname(filename);
  const fullPath = path.join(dirname, 'sampleDirectories', sampleDirectory);
  const initialDocument = computeInitialDocument({ fullPath });

  // Sort files for stability of tests, as ordering of fs listing
  // is not guaranteed.
  const files = Object.values(initialDocument).sort((a, b) =>
    ascending(a.name, b.name)
  );

  return files;
};

describe('Listing files', () => {
  it('should list files, no directories', () => {
    expect(getSampleFiles('listFiles')).toEqual([
      {
        text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
        name: 'index.html',
      },
      {
        text: "console.log('This is a test file to edit');\n",
        name: 'index.js',
      },
      {
        text: 'body {\n    background-color: red;\n}',
        name: 'styles.css',
      },
    ]);
  });

  it('should list files, empty directory', () => {
    expect(getSampleFiles('listFilesEmptyDirectory')).toEqual([
      {
        name: 'emptyDirectory/',
      },
      {
        text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
        name: 'index.html',
      },
      {
        text: "console.log('This is a test file to edit');\n",
        name: 'index.js',
      },
      {
        text: 'body {\n    background-color: red;\n}',
        name: 'styles.css',
      },
    ]);
  });

  it('should list files, full directory', () => {
    expect(getSampleFiles('listFilesEmptyDirectory')).toEqual([
      {
        text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
        name: 'emptyDirectory/index.html',
      },
      {
        text: "console.log('This is a test file to edit');\n",
        name: 'emptyDirectory/index.js',
      },
      {
        text: 'body {\n    background-color: red;\n}',
        name: 'emptyDirectory/styles.css',
      },
      {
        text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
        name: 'index.html',
      },
      {
        text: "console.log('This is a test file to edit');\n",
        name: 'index.js',
      },
      {
        text: 'body {\n    background-color: red;\n}',
        name: 'styles.css',
      },
    ]);
  });

  it('should list files, recursive directories', () => {
    expect(getSampleFiles('listFilesRecursive')).toEqual([
      {
        text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
        name: 'index.html',
      },
      {
        text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
        name: 'outerDirectory/index.html',
      },
      {
        text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
        name: 'outerDirectory/innerDirectory/index.html',
      },
    ]);
  });
});
