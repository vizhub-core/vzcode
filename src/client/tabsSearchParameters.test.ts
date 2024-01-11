import { describe, expect, it, test } from 'vitest';
import {
  encodeTabs,
  decodeTabs,
  type EditorTabsState,
} from './tabsSearchParameters';

describe('tabsSearchParameters', () => {
  test.each([
    {
      name: 'empty',
      search: '',
      state: { tabList: [], activeFileId: null },
    },
    {
      name: 'persistent tab',
      search: '123=pa',
      state: {
        tabList: [{ fileId: '123', isTransient: false }],
        activeFileId: '123',
      },
    },
    {
      name: 'transient tab',
      search: '456=ta',
      state: {
        tabList: [{ fileId: '456', isTransient: true }],
        activeFileId: '456',
      },
    },
    {
      name: 'no active file',
      search: '678=p',
      state: {
        tabList: [{ fileId: '678', isTransient: false }],
        activeFileId: null,
      },
    },
    {
      name: 'three tabs',
      search: '111=p&222=ta&333=p',
      state: {
        tabList: [
          { fileId: '111', isTransient: false },
          { fileId: '222', isTransient: true },
          { fileId: '333', isTransient: false },
        ],
        activeFileId: '222',
      },
    },
  ])('round trip: $name', ({ search, state }) => {
    const decoded = decodeTabs(new URLSearchParams(search));
    expect(decoded).toStrictEqual(state);
    const encoded = encodeTabs(state).toString();
    expect(encoded).toBe(search);
  });

  test.each([
    {
      name: 'empty value',
      search: 'abc',
      correctedSearch: 'abc=p',
      state: {
        tabList: [{ fileId: 'abc', isTransient: false }],
        activeFileId: null,
      },
    },
    {
      name: 'unknown characters',
      search: '890=xytzaw',
      correctedSearch: '890=ta',
      state: {
        tabList: [{ fileId: '890', isTransient: true }],
        activeFileId: '890',
      },
    },
    {
      name: 'wrong order',
      search: '321=ap',
      correctedSearch: '321=pa',
      state: {
        tabList: [{ fileId: '321', isTransient: false }],
        activeFileId: '321',
      },
    },
  ])(
    'decode: $name',
    ({ search, correctedSearch, state }) => {
      const { tabList, activeFileId } = decodeTabs(
        new URLSearchParams(),
      );
      expect(tabList).toStrictEqual([]);
      expect(activeFileId).toBe(null);
      const decoded = decodeTabs(
        new URLSearchParams(search),
      );
      expect(decoded).toStrictEqual(state);
      const corrected = encodeTabs(decoded).toString();
      expect(corrected).toBe(correctedSearch);
    },
  );
});
