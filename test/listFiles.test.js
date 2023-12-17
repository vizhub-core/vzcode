import { describe, expect, it } from 'vitest';
import { ascending } from 'd3-array';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { computeInitialDocument } from '../src/server/computeInitialDocument';
import { getRequiredHeader } from 'openai/core';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const getSampleFiles = (sampleDirectory) => {
  const fullPath = path.join(
    dirname,
    'sampleDirectories',
    sampleDirectory,
  );
  const initialDocument = computeInitialDocument({
    fullPath,
  });

  // Sort files for stability of tests, as ordering of fs listing
  // is not guaranteed.
  const files = Object.values(initialDocument.files).sort(
    (a, b) => ascending(a.name, b.name),
  );

  // console.log(JSON.stringify(files, null, 2));

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
        text: 'body {\n  background-color: red;\n}\n',
        name: 'styles.css',
      },
    ]);
  });

  it('should list files, empty directory', () => {
    // Git does not track empty directories,
    // so we need to create the empty directory
    // if it doesn't exist (e.g. in a fresh clone).
    // Inspired by https://stackoverflow.com/questions/21194934/how-to-create-a-directory-if-it-doesnt-exist-using-node-js
    const emptyDir = path.join(
      dirname,
      'sampleDirectories',
      'listFilesEmptyDirectory',
      'emptyDirectory',
    );
    if (!fs.existsSync(emptyDir)) {
      fs.mkdirSync(emptyDir);
    }

    expect(
      getSampleFiles('listFilesEmptyDirectory'),
    ).toEqual([
      {
        text: null,
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
        text: 'body {\n  background-color: red;\n}\n',
        name: 'styles.css',
      },
    ]);
  });

  it('should list files, full directory', () => {
    expect(
      getSampleFiles('listFilesFullDirectory'),
    ).toEqual([
      { text: null, name: 'fullDirectory/' },
      {
        text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
        name: 'fullDirectory/index.html',
      },
      {
        text: "console.log('This is a test file to edit');\n",
        name: 'fullDirectory/index.js',
      },
      {
        text: 'body {\n  background-color: red;\n}\n',
        name: 'fullDirectory/styles.css',
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
        text: 'body {\n  background-color: red;\n}\n',
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
      { text: null, name: 'outerDirectory/' },
      {
        text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
        name: 'outerDirectory/index.html',
      },
      {
        text: null,
        name: 'outerDirectory/innerDirectory/',
      },
      {
        text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
        name: 'outerDirectory/innerDirectory/index.html',
      },
    ]);
  });
});

it('should list files, respecting .ignore files', () => {
  expect(getSampleFiles('listFilesIgnore')).toEqual([
    {
      text: 'ignoredFile\nignoredDirectory/*\n!ignoredDirectory/keptFile\n',
      name: '.ignore',
    },
    {
      text: '',
      name: 'file',
    },
    {
      text: null,
      name: 'ignoredDirectory/',
    },
    {
      text: '',
      name: 'ignoredDirectory/keptFile',
    },
    {
      text: null,
      name: 'subdirectory/',
    },
    {
      text: 'ignoredSubdirectoryFile\n',
      name: 'subdirectory/.ignore',
    },
    {
      text: '',
      name: 'subdirectory/file',
    },
    {
      text: '',
      name: 'subdirectory/subdirectoryFile',
    },
  ]);
});
