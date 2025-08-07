import { describe, expect, it } from 'vitest';
import { setSearchResultsReducer } from './searchReducer';
import { VZAction, VZState, createInitialState } from '.';
import { defaultTheme } from '../themes';
import { ShareDBDoc } from '../../types';
import { VizContent } from '@vizhub/viz-types';

// Mock ShareDBDoc for testing
const createMockShareDBDoc = (
  files: any,
): ShareDBDoc<VizContent> => ({
  data: { files, id: 'mock-id' },
  ingestSnapshot: (snapshot: any, callback: any) => {
    // No-op for testing
    if (callback) callback();
  },
  subscribe: (callback: any) => {
    // No-op for testing
    if (callback) callback();
  },
  on: (
    event: string,
    callback: (op: any, source: boolean) => void,
  ) => {
    // No-op for testing
  },
  off: (
    event: string,
    callback: (op: any, source: boolean) => void,
  ) => {
    // No-op for testing
  },
  removeListener: (
    event: string,
    callback: (op: any, source: boolean) => void,
  ) => {
    // No-op for testing
  },
  submitOp: (
    op: any,
    options?: any,
    callback?: () => void,
  ) => {
    // No-op for testing
    if (callback) callback();
  },
  whenNothingPending: (callback: () => void) => {
    // No-op for testing
    if (callback) callback();
  },
});

const initialState: VZState = createInitialState({
  defaultTheme,
});

describe('searchReducer', () => {
  describe('setSearchResultsReducer', () => {
    it('should find case-insensitive matches', () => {
      const mockFiles = {
        'file1.js': {
          name: 'file1.js',
          text: 'const Hello = "world";\nconst goodbye = "HELLO";',
        },
        'file2.js': {
          name: 'file2.js',
          text: 'function hello() {\n  return "Hello World";\n}',
        },
      };

      const stateWithSearch = {
        ...initialState,
        search: {
          ...initialState.search,
          pattern: 'hello', // lowercase search pattern
        },
      };

      const action: VZAction = {
        type: 'set_search_results',
        files: createMockShareDBDoc(mockFiles),
      };

      const newState = setSearchResultsReducer(
        stateWithSearch,
        action,
      );

      // Should find matches in both files despite different cases
      expect(
        Object.keys(newState.search.results),
      ).toHaveLength(2);

      // Check file1.js results
      const file1Results =
        newState.search.results['file1.js'];
      expect(file1Results).toBeDefined();
      expect(file1Results.matches).toHaveLength(2); // "Hello" and "HELLO"
      expect(file1Results.matches[0].line).toBe(1);
      expect(file1Results.matches[0].index).toBe(6); // position of "Hello"
      expect(file1Results.matches[1].line).toBe(2);
      expect(file1Results.matches[1].index).toBe(17); // position of "HELLO"

      // Check file2.js results
      const file2Results =
        newState.search.results['file2.js'];
      expect(file2Results).toBeDefined();
      expect(file2Results.matches).toHaveLength(2); // "hello" and "Hello"
      expect(file2Results.matches[0].line).toBe(1);
      expect(file2Results.matches[0].index).toBe(9); // position of "hello"
      expect(file2Results.matches[1].line).toBe(2);
      expect(file2Results.matches[1].index).toBe(10); // position of "Hello"
    });

    it('should find exact case matches', () => {
      const mockFiles = {
        'file1.js': {
          name: 'file1.js',
          text: 'const hello = "world";',
        },
      };

      const stateWithSearch = {
        ...initialState,
        search: {
          ...initialState.search,
          pattern: 'hello', // exact case match
        },
      };

      const action: VZAction = {
        type: 'set_search_results',
        files: createMockShareDBDoc(mockFiles),
      };

      const newState = setSearchResultsReducer(
        stateWithSearch,
        action,
      );

      expect(
        Object.keys(newState.search.results),
      ).toHaveLength(1);
      const file1Results =
        newState.search.results['file1.js'];
      expect(file1Results.matches).toHaveLength(1);
      expect(file1Results.matches[0].line).toBe(1);
      expect(file1Results.matches[0].index).toBe(6);
    });

    it('should not find matches when pattern does not exist', () => {
      const mockFiles = {
        'file1.js': {
          name: 'file1.js',
          text: 'const world = "test";',
        },
      };

      const stateWithSearch = {
        ...initialState,
        search: {
          ...initialState.search,
          pattern: 'hello',
        },
      };

      const action: VZAction = {
        type: 'set_search_results',
        files: createMockShareDBDoc(mockFiles),
      };

      const newState = setSearchResultsReducer(
        stateWithSearch,
        action,
      );

      expect(
        Object.keys(newState.search.results),
      ).toHaveLength(0);
    });

    it('should handle uppercase search pattern', () => {
      const mockFiles = {
        'file1.js': {
          name: 'file1.js',
          text: 'const Hello = "world";\nfunction hello() {}',
        },
      };

      const stateWithSearch = {
        ...initialState,
        search: {
          ...initialState.search,
          pattern: 'HELLO', // uppercase search pattern
        },
      };

      const action: VZAction = {
        type: 'set_search_results',
        files: createMockShareDBDoc(mockFiles),
      };

      const newState = setSearchResultsReducer(
        stateWithSearch,
        action,
      );

      expect(
        Object.keys(newState.search.results),
      ).toHaveLength(1);
      const file1Results =
        newState.search.results['file1.js'];
      expect(file1Results.matches).toHaveLength(2); // Should find both "Hello" and "hello"
    });

    it('should handle mixed case search pattern', () => {
      const mockFiles = {
        'file1.js': {
          name: 'file1.js',
          text: 'const HeLLo = "world";\nconst hello = "test";\nconst HELLO = "end";',
        },
      };

      const stateWithSearch = {
        ...initialState,
        search: {
          ...initialState.search,
          pattern: 'HeLLo', // mixed case search pattern
        },
      };

      const action: VZAction = {
        type: 'set_search_results',
        files: createMockShareDBDoc(mockFiles),
      };

      const newState = setSearchResultsReducer(
        stateWithSearch,
        action,
      );

      expect(
        Object.keys(newState.search.results),
      ).toHaveLength(1);
      const file1Results =
        newState.search.results['file1.js'];
      expect(file1Results.matches).toHaveLength(3); // Should find all three variations
    });

    it('should skip files without text content', () => {
      const mockFiles = {
        'file1.js': {
          name: 'file1.js',
          text: 'const hello = "world";',
        },
        'file2.js': {
          name: 'file2.js',
          // no text property
        },
      };

      const stateWithSearch = {
        ...initialState,
        search: {
          ...initialState.search,
          pattern: 'hello',
        },
      };

      const action: VZAction = {
        type: 'set_search_results',
        files: createMockShareDBDoc(mockFiles),
      };

      const newState = setSearchResultsReducer(
        stateWithSearch,
        action,
      );

      // Should only find results in file1.js
      expect(
        Object.keys(newState.search.results),
      ).toHaveLength(1);
      expect(
        newState.search.results['file1.js'],
      ).toBeDefined();
      expect(
        newState.search.results['file2.js'],
      ).toBeUndefined();
    });
  });
});
