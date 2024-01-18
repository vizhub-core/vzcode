import { describe, expect, test } from 'vitest';
import {
  encodeTabs,
  decodeTabs,
  delimiter,
} from './tabsSearchParameters';
import { VZCodeContent } from '../types';

describe('tabsSearchParameters', () => {
  test.each([
    {
      name: 'empty',
      search: '',
      tabList: [],
      activeFileId: null,
    },
    {
      name: 'single active tab',
      search: 'file=index.html',

      tabList: [{ fileId: '789' }],
      activeFileId: '789',
    },
    {
      name: 'multiple tabs, active tab first',
      search: `file=index.html&tabs=index.html${delimiter}README.md${delimiter}index.js`,

      tabList: [
        { fileId: '789' },
        { fileId: '456' },
        { fileId: '123' },
      ],
      activeFileId: '789',
    },
    {
      name: 'multiple tabs, active tab in middle',
      search: `file=README.md&tabs=index.html${delimiter}README.md${delimiter}index.js`,

      tabList: [
        { fileId: '789' },
        { fileId: '456' },
        { fileId: '123' },
      ],
      activeFileId: '456',
    },
  ])(
    'round trip: $name',
    ({ search, tabList, activeFileId }) => {
      // Fake Content object
      const fakeContent: VZCodeContent = {
        files: {
          '123': { name: 'index.js', text: 'abc' },
          '456': { name: 'README.md', text: 'def' },
          '789': { name: 'index.html', text: 'ghi' },
        },
      };

      const decoded = decodeTabs({
        searchParams: new URLSearchParams(search),
        content: fakeContent,
      });
      const expected = { tabList, activeFileId };
      expect(decoded).toStrictEqual(expected);
      const encoded = encodeTabs({
        tabList,
        activeFileId,
        content: {
          files: {
            '123': { name: 'index.js', text: 'abc' },
            '456': { name: 'README.md', text: 'def' },
            '789': { name: 'index.html', text: 'ghi' },
          },
        },
      }).toString();
      expect(decodeURIComponent(encoded)).toBe(search);
    },
  );
});
