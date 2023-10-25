import { describe, expect, it } from 'vitest';
import { closeTabsReducer } from './closeTabsReducer';
import { VZAction, VZState, createInitialState } from '.';
import { defaultTheme } from '../themes';

const initialState: VZState =
  createInitialState(defaultTheme);

describe('closeTabsReducer', () => {
  it('Closes an existing tab', () => {
    const action: VZAction = {
      type: 'close_tabs',
      fileIdsToClose: ['file1'],
    };

    const stateWithTabs = {
      ...initialState,
      tabList: [{ fileId: 'file1', isTransient: false }],
      activeFileId: 'file1',
    };

    const newState = closeTabsReducer(
      stateWithTabs,
      action,
    );

    expect(newState.tabList.length).toBe(0);
    expect(newState.activeFileId).toBeNull();
  });

  it('Keeps other tabs open', () => {
    const action: VZAction = {
      type: 'close_tabs',
      fileIdsToClose: ['file2'],
    };
    const stateWithTabs = {
      ...initialState,
      tabList: [
        { fileId: 'file1', isTransient: false },
        { fileId: 'file2', isTransient: false },
      ],
      activeFileId: 'file1',
    };

    const newState = closeTabsReducer(
      stateWithTabs,
      action,
    );

    expect(newState.tabList.length).toBe(1);
    expect(newState.tabList[0].fileId).toBe('file1');
    expect(newState.activeFileId).toBe('file1');
  });

  it('Activates previous tab after closing an active tab', () => {
    const action: VZAction = {
      type: 'close_tabs',
      fileIdsToClose: ['file2'],
    };
    const stateWithTabs = {
      ...initialState,
      tabList: [
        { fileId: 'file1', isTransient: false },
        { fileId: 'file2', isTransient: false },
        { fileId: 'file3', isTransient: false },
      ],
      activeFileId: 'file2',
    };

    const newState = closeTabsReducer(
      stateWithTabs,
      action,
    );

    expect(newState.tabList.length).toBe(2);
    expect(newState.activeFileId).toBe('file1'); // should switch to the previous tab
  });

  it('Does not modify the state if closing non-existing tabs', () => {
    const action: VZAction = {
      type: 'close_tabs',
      fileIdsToClose: ['file4'],
    };
    const stateWithTabs = {
      ...initialState,
      tabList: [
        { fileId: 'file1', isTransient: false },
        { fileId: 'file2', isTransient: false },
        { fileId: 'file3', isTransient: false },
      ],
      activeFileId: 'file2',
    };

    const newState = closeTabsReducer(
      stateWithTabs,
      action,
    );

    expect(newState).toEqual(stateWithTabs);
  });
});
