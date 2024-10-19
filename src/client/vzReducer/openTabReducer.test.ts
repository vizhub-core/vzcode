import { assert, describe, expect, it } from 'vitest';
import { openTabReducer } from './openTabReducer';
import { VZAction, VZState, createInitialState } from '.';
import { defaultTheme } from '../themes';

const initialState: VZState = createInitialState({
  defaultTheme,
});

describe('openTabReducer', () => {
  it('Opens a new tab', () => {
    const action: VZAction = {
      type: 'open_tab',
      fileId: 'file1',
      isTransient: false,
    };
    const newState = openTabReducer(initialState, action);

    assert(newState.pane.type === 'leafPane');
    expect(newState.pane.tabList.length).toBe(1);
    expect(newState.pane.tabList[0].fileId).toBe('file1');
    expect(newState.pane.tabList[0].isTransient).toBe(
      false,
    );
    expect(newState.pane.activeFileId).toBe('file1');
  });

  it('Replaces a transient tab', () => {
    const stateWithTransientTab = {
      ...initialState,
      pane: {
        ...initialState.pane,
        tabList: [{ fileId: 'file2', isTransient: true }],
      },
    };
    const action: VZAction = {
      type: 'open_tab',
      fileId: 'file1',
      isTransient: true,
    };
    const newState = openTabReducer(
      stateWithTransientTab,
      action,
    );

    assert(newState.pane.type === 'leafPane');
    expect(newState.pane.tabList.length).toBe(1);
    expect(newState.pane.tabList[0].fileId).toBe('file1');
    expect(newState.pane.tabList[0].isTransient).toBe(true);
    expect(newState.pane.activeFileId).toBe('file1');
  });

  it('Does not modify a non-transient tab', () => {
    const stateWithNonTransientTab = {
      ...initialState,
      pane: {
        ...initialState.pane,
        tabList: [{ fileId: 'file1', isTransient: false }],
      },
    };
    const action: VZAction = {
      type: 'open_tab',
      fileId: 'file1',
      isTransient: true,
    };
    const newState = openTabReducer(
      stateWithNonTransientTab,
      action,
    );

    assert(newState.pane.type === 'leafPane');
    expect(newState.pane.tabList.length).toBe(1);
    expect(newState.pane.tabList[0].fileId).toBe('file1');
    expect(newState.pane.tabList[0].isTransient).toBe(
      false,
    ); // should remain non-transient
    expect(newState.pane.activeFileId).toBe('file1');
  });

  it('Activates an already open tab', () => {
    const stateWithMultipleTabs = {
      ...initialState,
      pane: {
        ...initialState.pane,
        tabList: [
          { fileId: 'file1', isTransient: false },
          { fileId: 'file2', isTransient: false },
        ],
      },
    };
    const action: VZAction = {
      type: 'open_tab',
      fileId: 'file1',
      isTransient: false,
    };
    const newState = openTabReducer(
      stateWithMultipleTabs,
      action,
    );

    assert(newState.pane.type === 'leafPane');
    expect(newState.pane.tabList.length).toBe(2);
    expect(newState.pane.activeFileId).toBe('file1');
  });

  it('Sets editorWantsFocus to true for non-transient tabs', () => {
    const action: VZAction = {
      type: 'open_tab',
      fileId: 'file3',
      isTransient: false, // This tab is persistent
    };
    const newState = openTabReducer(initialState, action);

    expect(newState.editorWantsFocus).toBe(true);
  });

  it('Sets editorWantsFocus to false for transient tabs', () => {
    const action: VZAction = {
      type: 'open_tab',
      fileId: 'file4',
      isTransient: true, // This tab is transient
    };
    const newState = openTabReducer(initialState, action);

    expect(newState.editorWantsFocus).toBe(false);
  });
});
