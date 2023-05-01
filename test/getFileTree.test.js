import { describe, expect, it } from 'vitest';

// Inspired by
// https://github.com/vizhub-core/vizhub/blob/main/vizhub-v2/packages/neoFrontend/src/pages/VizPage/Body/Editor/FilesSection/FileTree/getFileTree.test.js
import { getFileTree } from '../src/client/getFileTree';

describe('getFileTree', () => {
  it('Parses a single file', () => {
    const file = { name: 'name', text: 'text' };

    // Note: the API expects an object where keys are file ids.
    // These tests pass arrays, which are a convenient shorthand.
    const tree = getFileTree([file]);
    expect(tree.children.length).toBe(1);
    expect(tree.children[0].name).toBe('name');
    expect(tree.children[0].file).toBe(file);
  });

  it('Parses two files', () => {
    const file1 = { name: 'name1', text: 'text1' };
    const file2 = { name: 'name2', text: 'text2' };
    const tree = getFileTree([file1, file2]);
    expect(tree.children.length).toBe(2);
    expect(tree.children[0].name).toBe('name1');
    expect(tree.children[0].file).toBe(file1);
    expect(tree.children[1].name).toBe('name2');
    expect(tree.children[1].file).toBe(file2);
  });

  it('Parses one files in a directory', () => {
    const file = { name: 'dir/name', text: 'text' };
    const tree = getFileTree([file]);
    expect(tree.children.length).toBe(1);
    expect(tree.children[0].name).toBe('dir');
    expect(tree.children[0].path).toBe('dir');
    expect(tree.children[0].children.length).toBe(1);
    expect(tree.children[0].children[0].name).toBe('name');
    expect(tree.children[0].children[0].file).toBe(file);
  });

  it('Parses two files in a directory', () => {
    const file1 = { name: 'dir/name1', text: 'text1' };
    const file2 = { name: 'dir/name2', text: 'text2' };
    const tree = getFileTree([file1, file2]);
    expect(tree.children.length).toBe(1);
    expect(tree.children[0].name).toBe('dir');
    expect(tree.children[0].children.length).toBe(2);
    expect(tree.children[0].children[0].name).toBe('name1');
    expect(tree.children[0].children[0].file).toBe(file1);
    expect(tree.children[0].children[1].name).toBe('name2');
    expect(tree.children[0].children[1].file).toBe(file2);
  });

  it('Parses a complex directory structure', () => {
    const file1 = { name: 'name1', text: 'text1' };
    const file2 = { name: 'dir1/name2', text: 'text2' };
    const file3 = { name: 'dir1/deep/name1deep', text: 'text1deep' };
    const file4 = { name: 'dir1/dar/name2dar', text: 'text2dar' };
    const file5 = { name: 'dir1/dar/name3dar', text: 'text3dar' };
    const file6 = { name: 'dir2/name2dor', text: 'text2dor' };
    const tree = getFileTree([file1, file2, file3, file4, file5, file6]);
    expect(tree.children.length).toBe(3);

    expect(tree.children[0].name).toBe('name1');
    expect(tree.children[0].file).toBe(file1);

    expect(tree.children[1].name).toBe('dir1');
    expect(tree.children[1].children.length).toBe(3);

    expect(tree.children[1].children[0].name).toBe('name2');
    expect(tree.children[1].children[0].file).toBe(file2);

    expect(tree.children[1].children[1].name).toBe('deep');
    expect(tree.children[1].children[1].path).toBe('dir1/deep');
    expect(tree.children[1].children[1].children.length).toBe(1);
    expect(tree.children[1].children[1].children[0].name).toBe('name1deep');
    expect(tree.children[1].children[1].children[0].file).toBe(file3);

    expect(tree.children[1].children[2].name).toBe('dar');
    expect(tree.children[1].children[2].path).toBe('dir1/dar');
    expect(tree.children[1].children[2].children.length).toBe(2);
    expect(tree.children[1].children[2].children[0].name).toBe('name2dar');
    expect(tree.children[1].children[2].children[0].file).toBe(file4);
    expect(tree.children[1].children[2].children[1].name).toBe('name3dar');
    expect(tree.children[1].children[2].children[1].file).toBe(file5);

    expect(tree.children[2].name).toBe('dir2');
    expect(tree.children[2].children.length).toBe(1);

    expect(tree.children[2].children[0].name).toBe('name2dor');
    expect(tree.children[2].children[0].file).toBe(file6);
  });

  it('Handles an empty directory, top level', () => {
    const file1 = { name: 'dir1/', text: null };
    const tree = getFileTree([file1]);

    expect(tree).toEqual({
      name: 'files',
      children: [
        {
          name: 'dir1',
          path: 'dir1',
        },
      ],
    });
  });

  it('Handles an empty directory, level 2', () => {
    const file1 = { name: 'dir1/deep/', text: null };
    const tree = getFileTree([file1]);

    expect(tree).toEqual({
      name: 'files',
      children: [
        {
          name: 'dir1',
          path: 'dir1',
          children: [
            {
              name: 'deep',
              path: 'dir1/deep',
            },
          ],
        },
      ],
    });
  });
});
