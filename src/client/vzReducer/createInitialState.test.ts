import { describe, expect, it } from 'vitest';
import { createInitialState } from './createInitialState';
import { defaultTheme } from '../themes';

describe('createInitialState', () => {
  it('should create initial state with auto-follow disabled by default', () => {
    const initialState = createInitialState({
      defaultTheme,
      initialUsername: 'TestUser',
    });

    expect(initialState.enableAutoFollow).toBe(false);
    expect(initialState.username).toBe('TestUser');
    expect(initialState.theme).toBe(defaultTheme);
  });

  it('should create initial state with default username when none provided', () => {
    const initialState = createInitialState({
      defaultTheme,
    });

    expect(initialState.enableAutoFollow).toBe(false);
    expect(initialState.username).toBe('Anonymous');
  });
});
