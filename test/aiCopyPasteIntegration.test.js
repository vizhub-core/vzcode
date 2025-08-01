import { describe, test, expect, vi } from 'vitest';
import { createAICopyPasteHandlers } from '../src/client/VZSidebar/aiCopyPaste.ts';

// Mock external dependencies
vi.mock('llm-code-format', () => ({
  formatMarkdownFiles: vi.fn(
    (files) => `**file1.js**

\`\`\`javascript
console.log('file1');
\`\`\`

**file2.js**

\`\`\`javascript  
console.log('file2');
\`\`\``,
  ),
  parseMarkdownFiles: vi.fn((content, type) => {
    // Simulate the real parsing behavior
    const files = {};
    const lines = content.split('\n');
    let currentFile = null;
    let currentContent = '';
    let inCodeBlock = false;

    for (const line of lines) {
      if (line.startsWith('**') && line.endsWith('**')) {
        // Save previous file if exists
        if (currentFile && currentContent) {
          files[currentFile] = currentContent.trim();
        }
        // Start new file
        currentFile = line.slice(2, -2);
        currentContent = '';
        inCodeBlock = false;
      } else if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        if (!inCodeBlock && currentFile) {
          // End of code block
        }
      } else if (inCodeBlock && currentFile) {
        currentContent += line + '\n';
      }
    }

    // Save last file
    if (currentFile && currentContent) {
      files[currentFile] = currentContent.trim();
    }

    return { files };
  }),
}));

vi.mock('editcodewithai', () => ({
  FORMAT_INSTRUCTIONS: {
    whole:
      '## Formatting Instructions\n\nMock instructions',
  },
  mergeFileChanges: vi.fn((existing, parsed) => ({
    ...existing,
    ...parsed,
  })),
}));

vi.mock('@vizhub/viz-utils', () => ({
  vizFilesToFileCollection: vi.fn((files) => files),
}));

// Mock navigator.clipboard
global.navigator = {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn(),
  },
};

describe('AI Copy Paste Integration', () => {
  test('handlePasteForAI should ignore content after "## Formatting Instructions"', async () => {
    const mockFiles = {
      'existing.js': {
        name: 'existing.js',
        text: 'console.log("existing");',
      },
    };

    const mockSubmitOperation = vi.fn();
    const setCopyButtonText = vi.fn();
    const setPasteButtonText = vi.fn();
    const setExportButtonText = vi.fn();

    const handlers = createAICopyPasteHandlers(
      mockFiles,
      mockSubmitOperation,
      setCopyButtonText,
      setPasteButtonText,
      setExportButtonText,
    );

    // Mock clipboard content with formatting instructions that should be ignored
    const clipboardContent = `**realFile.js**

\`\`\`javascript
console.log('real file');
\`\`\`

## Formatting Instructions

**fileA.js**

\`\`\`js
// This should be ignored
\`\`\`

**fileB.js**

\`\`\`js
// This should also be ignored
\`\`\``;

    navigator.clipboard.readText.mockResolvedValue(
      clipboardContent,
    );

    await handlers.handlePasteForAI();

    // Verify that submitOperation was called
    expect(mockSubmitOperation).toHaveBeenCalled();

    // Get the operation that was submitted
    const operation = mockSubmitOperation.mock.calls[0][0];
    const result = operation({ files: mockFiles });

    // Should only include the real file, not the formatting instruction examples
    expect(result.files).toHaveProperty('realFile.js');
    expect(result.files).not.toHaveProperty('fileA.js');
    expect(result.files).not.toHaveProperty('fileB.js');

    // Verify success feedback
    expect(setPasteButtonText).toHaveBeenCalledWith(
      'Pasted!',
    );
  });

  test('handlePasteForAI should work normally when no formatting instructions present', async () => {
    const mockFiles = {
      'existing.js': {
        name: 'existing.js',
        text: 'console.log("existing");',
      },
    };

    const mockSubmitOperation = vi.fn();
    const setCopyButtonText = vi.fn();
    const setPasteButtonText = vi.fn();
    const setExportButtonText = vi.fn();

    const handlers = createAICopyPasteHandlers(
      mockFiles,
      mockSubmitOperation,
      setCopyButtonText,
      setPasteButtonText,
      setExportButtonText,
    );

    // Mock clipboard content without formatting instructions
    const clipboardContent = `**newFile.js**

\`\`\`javascript
console.log('new file');
\`\`\``;

    navigator.clipboard.readText.mockResolvedValue(
      clipboardContent,
    );

    await handlers.handlePasteForAI();

    // Verify that submitOperation was called
    expect(mockSubmitOperation).toHaveBeenCalled();

    // Get the operation that was submitted
    const operation = mockSubmitOperation.mock.calls[0][0];
    const result = operation({ files: mockFiles });

    // Should include the new file
    expect(result.files).toHaveProperty('newFile.js');

    // Verify success feedback
    expect(setPasteButtonText).toHaveBeenCalledWith(
      'Pasted!',
    );
  });
});
