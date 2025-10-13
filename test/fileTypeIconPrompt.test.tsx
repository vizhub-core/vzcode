import { describe, test, expect } from 'vitest';
import { getExtensionIcon } from '../src/client/VZSidebar/FileTypeIcon';
import { MarkdownSVG } from '../src/client/Icons';

describe('FileTypeIcon for .prompt files', () => {
  test('should return MarkdownSVG for .prompt files', () => {
    const icon = getExtensionIcon('test.prompt');
    // Both md and prompt should return the same icon type
    const mdIcon = getExtensionIcon('test.md');

    // Check that both return the same type of element
    expect(icon.type).toBe(MarkdownSVG);
    expect(mdIcon.type).toBe(MarkdownSVG);
    expect(icon.type).toBe(mdIcon.type);
  });

  test('should return MarkdownSVG for .md files', () => {
    const icon = getExtensionIcon('README.md');
    expect(icon.type).toBe(MarkdownSVG);
  });
});
