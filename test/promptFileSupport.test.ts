import { describe, test, expect } from 'vitest';
import { getLanguageExtension } from '../src/client/CodeEditor/getOrCreateEditor';

describe('Prompt File Support', () => {
  test('should return markdown extension for .prompt files', () => {
    const extension = getLanguageExtension('prompt');
    expect(extension).toBeDefined();
    expect(extension).not.toBeNull();
  });

  test('should return markdown extension for .md files', () => {
    const extension = getLanguageExtension('md');
    expect(extension).toBeDefined();
    expect(extension).not.toBeNull();
  });

  test('should return undefined for unknown file extensions', () => {
    const extension = getLanguageExtension('unknown');
    expect(extension).toBeUndefined();
  });
});
