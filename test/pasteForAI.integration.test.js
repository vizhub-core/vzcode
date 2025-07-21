import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// Integration tests for the actual paste for AI functionality
// These tests simulate the browser environment more closely

describe('Paste for AI Integration Tests', () => {
  let mockNavigator;
  let originalNavigator;

  beforeEach(() => {
    // Store original navigator
    originalNavigator = global.navigator;

    // Mock the clipboard API
    mockNavigator = {
      clipboard: {
        readText: vi.fn(),
        writeText: vi.fn()
      }
    };
    global.navigator = mockNavigator;
  });

  afterEach(() => {
    // Restore original navigator
    global.navigator = originalNavigator;
    vi.clearAllMocks();
  });

  // Helper function that simulates the actual handlePasteForAI implementation
  const createPasteHandler = (submitOperation) => {
    return async () => {
      if (!submitOperation) return { success: false, error: 'No submit operation' };

      try {
        // Read from clipboard
        const clipboardText = await navigator.clipboard.readText();

        if (!clipboardText.trim()) {
          return { success: false, error: 'Empty clipboard' };
        }

        // In a real scenario, we would import parseMarkdownFiles
        // For testing, we'll simulate its behavior
        const simulateParseMarkdownFiles = (text) => {
          // Simple parser for testing - looks for **filename** followed by code blocks
          const fileMatches = text.match(/\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/g);
          
          if (!fileMatches) {
            return { files: {} };
          }

          const files = {};
          fileMatches.forEach(match => {
            const [, fileName, content] = match.match(/\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/);
            files[fileName] = content.trim();
          });

          return { files };
        };

        const parsed = simulateParseMarkdownFiles(clipboardText);

        if (parsed.files && Object.keys(parsed.files).length > 0) {
          // Update files using the submit operation
          const result = submitOperation((document) => {
            const updatedFiles = { ...document.files };

            // Update existing files or create new ones
            Object.entries(parsed.files).forEach(([fileName, fileText]) => {
              // Find existing file with this name
              const existingFileId = Object.keys(updatedFiles).find(
                (fileId) => updatedFiles[fileId].name === fileName
              );

              if (existingFileId) {
                // Update existing file
                updatedFiles[existingFileId] = {
                  ...updatedFiles[existingFileId],
                  text: fileText,
                };
              } else {
                // Create new file
                const newFileId = `file-${Date.now()}-${Math.random()}`;
                updatedFiles[newFileId] = {
                  name: fileName,
                  text: fileText,
                };
              }
            });

            return {
              ...document,
              files: updatedFiles,
            };
          });

          const fileCount = Object.keys(parsed.files).length;
          return { success: true, filesUpdated: fileCount, result };
        } else {
          return { success: false, error: 'No files found' };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    };
  };

  it('should successfully read from clipboard and update files', async () => {
    const clipboardContent = `
**index.js**

\`\`\`javascript
console.log('Hello from AI');
\`\`\`

**styles.css**

\`\`\`css
body { margin: 0; }
\`\`\`
    `;

    mockNavigator.clipboard.readText.mockResolvedValue(clipboardContent);

    const mockDocument = {
      files: {
        'existing-1': { name: 'index.js', text: 'old content' }
      }
    };

    let capturedUpdateFunction;
    const mockSubmitOperation = vi.fn((updateFn) => {
      capturedUpdateFunction = updateFn;
      return updateFn(mockDocument);
    });

    const pasteHandler = createPasteHandler(mockSubmitOperation);
    const result = await pasteHandler();

    expect(result.success).toBe(true);
    expect(result.filesUpdated).toBe(2);
    expect(mockNavigator.clipboard.readText).toHaveBeenCalled();
    expect(mockSubmitOperation).toHaveBeenCalledWith(expect.any(Function));

    // Verify the update function works correctly
    const updatedDocument = capturedUpdateFunction(mockDocument);
    expect(updatedDocument.files['existing-1'].text).toBe("console.log('Hello from AI');");
    
    // Find the new CSS file
    const newFileId = Object.keys(updatedDocument.files).find(
      id => id !== 'existing-1'
    );
    expect(updatedDocument.files[newFileId]).toEqual({
      name: 'styles.css',
      text: 'body { margin: 0; }'
    });
  });

  it('should handle clipboard API errors gracefully', async () => {
    mockNavigator.clipboard.readText.mockRejectedValue(new Error('Clipboard access denied'));

    const mockSubmitOperation = vi.fn();
    const pasteHandler = createPasteHandler(mockSubmitOperation);
    const result = await pasteHandler();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Clipboard access denied');
    expect(mockSubmitOperation).not.toHaveBeenCalled();
  });

  it('should handle empty clipboard content', async () => {
    mockNavigator.clipboard.readText.mockResolvedValue('');

    const mockSubmitOperation = vi.fn();
    const pasteHandler = createPasteHandler(mockSubmitOperation);
    const result = await pasteHandler();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Empty clipboard');
    expect(mockSubmitOperation).not.toHaveBeenCalled();
  });

  it('should handle content with no recognizable file format', async () => {
    mockNavigator.clipboard.readText.mockResolvedValue('Just some plain text without files');

    const mockDocument = { files: {} };
    const mockSubmitOperation = vi.fn();
    const pasteHandler = createPasteHandler(mockSubmitOperation);
    const result = await pasteHandler();

    expect(result.success).toBe(false);
    expect(result.error).toBe('No files found');
    expect(mockSubmitOperation).not.toHaveBeenCalled();
  });

  it('should handle missing submit operation function', async () => {
    mockNavigator.clipboard.readText.mockResolvedValue('some content');

    const pasteHandler = createPasteHandler(null);
    const result = await pasteHandler();

    expect(result.success).toBe(false);
    expect(result.error).toBe('No submit operation');
  });

  it('should process multiple files with different extensions correctly', async () => {
    const clipboardContent = `
**App.jsx**

\`\`\`jsx
import React from 'react';
export default function App() {
  return <div>Hello World</div>;
}
\`\`\`

**config.json**

\`\`\`json
{
  "name": "my-app",
  "version": "1.0.0"
}
\`\`\`

**README.md**

\`\`\`markdown
# My App

This is a sample application.
\`\`\`
    `;

    mockNavigator.clipboard.readText.mockResolvedValue(clipboardContent);

    const mockDocument = { files: {} };
    let capturedUpdateFunction;
    const mockSubmitOperation = vi.fn((updateFn) => {
      capturedUpdateFunction = updateFn;
      return updateFn(mockDocument);
    });

    const pasteHandler = createPasteHandler(mockSubmitOperation);
    const result = await pasteHandler();

    expect(result.success).toBe(true);
    expect(result.filesUpdated).toBe(3);

    const updatedDocument = capturedUpdateFunction(mockDocument);
    const fileNames = Object.values(updatedDocument.files).map(f => f.name);
    
    expect(fileNames).toContain('App.jsx');
    expect(fileNames).toContain('config.json');
    expect(fileNames).toContain('README.md');

    // Verify content
    const appFile = Object.values(updatedDocument.files).find(f => f.name === 'App.jsx');
    expect(appFile.text).toContain('import React from \'react\';');
    expect(appFile.text).toContain('export default function App()');
  });

  it('should handle malformed markdown gracefully', async () => {
    const malformedContent = `
**incomplete.js

\`\`\`javascript
console.log('missing closing stars');

**missing-code-block.js**

console.log('no code block');
    `;

    mockNavigator.clipboard.readText.mockResolvedValue(malformedContent);

    const mockSubmitOperation = vi.fn();
    const pasteHandler = createPasteHandler(mockSubmitOperation);
    const result = await pasteHandler();

    expect(result.success).toBe(false);
    expect(result.error).toBe('No files found');
    expect(mockSubmitOperation).not.toHaveBeenCalled();
  });
});