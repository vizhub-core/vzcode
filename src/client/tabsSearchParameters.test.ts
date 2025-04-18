import { describe, expect, test } from 'vitest';
import {
  encodeTabs,
  decodeTabs,
  delimiter,
} from './tabsSearchParameters';
import { VizContent } from '@vizhub/viz-types';

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
      tabStateParams: {
        file: 'index.html',
      },

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
  ])(
    'round trip: $name',
    ({ tabStateParams, tabList, activeFileId }) => {
      // Fake Content object
      const content: VizContent = {
        id: 'test-viz-id', // Add required id property
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
    },
  );
});
