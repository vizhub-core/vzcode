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
      tabStateParams: {},
      tabList: [],
      activeFileId: null,
    },
    {
      name: 'single active tab',
      tabStateParams: { file: 'index.html' },
      tabList: [{ fileId: '789' }],
      activeFileId: '789',
    },
    {
      name: 'multiple tabs, active tab first',
      tabStateParams: {
        file: 'index.html',
        tabs: `index.html${delimiter}README.md${delimiter}index.js`,
      },
      tabList: [
        { fileId: '789' },
        { fileId: '456' },
        { fileId: '123' },
      ],
      activeFileId: '789',
    },
    {
      name: 'multiple tabs, active tab in middle',
      tabStateParams: {
        file: 'README.md',
        tabs: `index.html${delimiter}README.md${delimiter}index.js`,
      },
      tabList: [
        { fileId: '789' },
        { fileId: '456' },
        { fileId: '123' },
      ],
      activeFileId: '456',
    },
    {
      name: 'empty tab list and null active file',
      tabStateParams: { file: null, tabs: '' },
      tabList: [],
      activeFileId: null,
    },
    {
      name: 'invalid tab state params',
      tabStateParams: { file: 'unknown.html', tabs: 'unknown.html' },
      tabList: [],
      activeFileId: null,
    },
  ])(
    'round trip: $name',
    ({ tabStateParams, tabList, activeFileId }) => {
      const content: VZCodeContent = {
        files: {
          '123': { name: 'index.js', text: 'abc' },
          '456': { name: 'README.md', text: 'def' },
          '789': { name: 'index.html', text: 'ghi' },
        },
      };

      const decoded = decodeTabs({
        tabStateParams,
        content,
      });
      const expected = { tabList, activeFileId };
      expect(decoded).toStrictEqual(expected);

      const encoded = encodeTabs({
        tabList,
        activeFileId,
        content,
      });
      expect(encoded).toEqual(tabStateParams);

      // Consistency check
      const redecoded = decodeTabs({
        tabStateParams: encoded,
        content,
      });
      expect(redecoded).toStrictEqual(expected);
    },
  );
});
