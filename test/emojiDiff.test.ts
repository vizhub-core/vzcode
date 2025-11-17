import { expect, test } from 'vitest';
import { diff } from '../src/ot.js';

test('diff should handle emoji correctly', () => {
  // Create initial state with emoji
  const initialState = {
    files: {
      'test.js': {
        text: 'Hello 👋 World!',
      },
    },
  };

  // Create modified state with emoji
  const modifiedState = {
    files: {
      'test.js': {
        text: 'Hello 👋 World! 🌎',
      },
    },
  };

  // Generate diff
  const operation = diff(initialState, modifiedState);

  // The operation should be generated successfully without errors
  expect(operation).toBeDefined();
  expect(Array.isArray(operation)).toBe(true);
  expect(operation.length).toBeGreaterThan(0);
});

test('diff should handle complex emoji with skin tones', () => {
  const initialState = {
    content: 'User 👨‍💻 is coding',
  };

  const modifiedState = {
    content: 'User 👨🏽‍💻 is coding',
  };

  // Generate diff - should handle multi-codepoint emoji correctly
  const operation = diff(initialState, modifiedState);

  expect(operation).toBeDefined();
  expect(Array.isArray(operation)).toBe(true);
});

test('diff should handle emoji in mixed content', () => {
  const initialState = {
    messages: [
      { id: 1, text: 'Hello' },
      { id: 2, text: 'World 🌍' },
    ],
  };

  const modifiedState = {
    messages: [
      { id: 1, text: 'Hello 😊' },
      { id: 2, text: 'World 🌍' },
    ],
  };

  const operation = diff(initialState, modifiedState);

  expect(operation).toBeDefined();
  expect(Array.isArray(operation)).toBe(true);
});
