import { describe, expect, it } from 'vitest';

import { sortFileTree } from '../src/client/sortFileTree';

const complexTreeUnsorted = {
  name: 'files',
  children: [
    {
      name: 'recursiveDir',
      path: 'recursiveDir',
      children: [
        {
          name: 'outerDirectory',
          path: 'recursiveDir/outerDirectory',
          children: [
            {
              name: 'innerDirectory',
              path: 'recursiveDir/outerDirectory/innerDirectory',
              children: [
                {
                  name: 'index.html',
                  file: {
                    text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
                    name: 'recursiveDir/outerDirectory/innerDirectory/index.html',
                  },
                  fileId: '1690419792',
                },
              ],
            },
            {
              name: 'index.html',
              file: {
                text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
                name: 'recursiveDir/outerDirectory/index.html',
              },
              fileId: '4695002323',
            },
          ],
        },
        {
          name: 'index.html',
          file: {
            text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
            name: 'recursiveDir/index.html',
          },
          fileId: '9335928780',
        },
      ],
    },
    {
      name: 'index.html',
      file: {
        text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
        name: 'index.html',
      },
      fileId: '584034190',
    },
    {
      name: 'index.js',
      file: {
        text: "console.log('This is a d file to edit');\n",
        name: 'index.js',
      },
      fileId: '1939270405',
    },
    {
      name: 'fullDir',
      path: 'fullDir',
      children: [
        {
          name: 'index.html',
          file: {
            text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
            name: 'fullDir/index.html',
          },
          fileId: '2733286449',
        },
        {
          name: 'index.js',
          file: {
            text: "console.log('This is a test file to edit');\n",
            name: 'fullDir/index.js',
          },
          fileId: '9197840121',
        },
        {
          name: 'styles.css',
          file: {
            text: 'body {\n  background-color: red;\n}\n',
            name: 'fullDir/styles.css',
          },
          fileId: '5823577920',
        },
      ],
    },
    {
      name: 'TestFile3.txt',
      file: {
        text: 'h\nh\nh\nhh\nh\nh\nh\nh\nh\nhh\nh\nhh\nhh\nh\nh\nhh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nhh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nhh\nh\nh\nh\nh\nh\nh\n\n',
        name: 'TestFile3.txt',
      },
      fileId: '4828054182',
    },
    {
      name: 'app.jsx',
      file: {
        text: 'const foo = <div></div>;\nconst foo2 = hi;\n',
        name: 'app.jsx',
      },
      fileId: '5881122190',
    },
    { name: 'emptyDir', path: 'emptyDir' },
    {
      name: 'longFileNameTest.txt',
      file: { text: '', name: 'longFileNameTest.txt' },
      fileId: '7816328961',
    },
    {
      name: 'script.ts',
      file: {
        text: "const testing = 'Hello World!';\n",
        name: 'script.ts',
      },
      fileId: '9422527787',
    },
    {
      name: 'styles.css',
      file: {
        text: 'body {\n  background-color: red;\n}\n',
        name: 'styles.css',
      },
      fileId: '6888704649',
    },
  ],
};

const complexTreeSorted = {
  name: 'files',
  children: [
    { name: 'emptyDir', path: 'emptyDir' },
    {
      name: 'fullDir',
      path: 'fullDir',
      children: [
        {
          name: 'index.html',
          file: {
            text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
            name: 'fullDir/index.html',
          },
          fileId: '2733286449',
        },
        {
          name: 'index.js',
          file: {
            text: "console.log('This is a test file to edit');\n",
            name: 'fullDir/index.js',
          },
          fileId: '9197840121',
        },
        {
          name: 'styles.css',
          file: {
            text: 'body {\n  background-color: red;\n}\n',
            name: 'fullDir/styles.css',
          },
          fileId: '5823577920',
        },
      ],
    },
    {
      name: 'recursiveDir',
      path: 'recursiveDir',
      children: [
        {
          name: 'outerDirectory',
          path: 'recursiveDir/outerDirectory',
          children: [
            {
              name: 'innerDirectory',
              path: 'recursiveDir/outerDirectory/innerDirectory',
              children: [
                {
                  name: 'index.html',
                  file: {
                    text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
                    name: 'recursiveDir/outerDirectory/innerDirectory/index.html',
                  },
                  fileId: '1690419792',
                },
              ],
            },
            {
              name: 'index.html',
              file: {
                text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
                name: 'recursiveDir/outerDirectory/index.html',
              },
              fileId: '4695002323',
            },
          ],
        },
        {
          name: 'index.html',
          file: {
            text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
            name: 'recursiveDir/index.html',
          },
          fileId: '9335928780',
        },
      ],
    },
    {
      name: 'app.jsx',
      file: {
        text: 'const foo = <div></div>;\nconst foo2 = hi;\n',
        name: 'app.jsx',
      },
      fileId: '5881122190',
    },
    {
      name: 'index.html',
      file: {
        text: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta namde="viewport" content="width=device-width" />\n    <title>Test Page</title>\n  </head>\n  <body></body>\n</html>\n',
        name: 'index.html',
      },
      fileId: '584034190',
    },
    {
      name: 'index.js',
      file: {
        text: "console.log('This is a d file to edit');\n",
        name: 'index.js',
      },
      fileId: '1939270405',
    },
    {
      name: 'longFileNameTest.txt',
      file: { text: '', name: 'longFileNameTest.txt' },
      fileId: '7816328961',
    },
    {
      name: 'script.ts',
      file: {
        text: "const testing = 'Hello World!';\n",
        name: 'script.ts',
      },
      fileId: '9422527787',
    },
    {
      name: 'styles.css',
      file: {
        text: 'body {\n  background-color: red;\n}\n',
        name: 'styles.css',
      },
      fileId: '6888704649',
    },
    {
      name: 'TestFile3.txt',
      file: {
        text: 'h\nh\nh\nhh\nh\nh\nh\nh\nh\nhh\nh\nhh\nhh\nh\nh\nhh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nhh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nh\nhh\nh\nh\nh\nh\nh\nh\n\n',
        name: 'TestFile3.txt',
      },
      fileId: '4828054182',
    },
  ],
};

const clone = (thing) => JSON.parse(JSON.stringify(thing));

describe('sortFileTree', () => {
  it('Sorts a complex tree', () => {
    // Clone to guard mutation.
    const tree = clone(complexTreeUnsorted);

    expect(tree).toEqual(complexTreeUnsorted);
    sortFileTree(tree);
    expect(tree).toEqual(complexTreeSorted);
  });
});
