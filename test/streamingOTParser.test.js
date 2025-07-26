import { describe, test, expect, beforeEach } from 'vitest';
import { StreamingMarkdownParser } from 'llm-code-format';
import { randomId } from '../src/randomId.js';
import { diff } from '../src/client/diff.js';
import { textUnicode } from '../src/ot.js';
import OTJSON1Presence from 'sharedb-client-browser/dist/ot-json1-presence-umd.cjs';

// Mock ShareDB document
class MockShareDBDoc {
  constructor(initialData = {}) {
    this.data = {
      files: {},
      chats: {},
      ...initialData,
    };
    this.operations = [];
  }

  submitOp(op) {
    this.operations.push(op);
    // Apply the operation to simulate ShareDB behavior
    // This is a simplified version - real ShareDB would handle this more robustly
    try {
      // For testing purposes, we'll use a simplified approach
      // The diff function returns operations that modify the document
      // We'll apply them by using the json1Presence type's apply method
      const { json1Presence } = OTJSON1Presence;
      this.data = json1Presence.type.apply(this.data, op);
    } catch (error) {
      console.error('Error applying operation:', error, op);
      // Fallback: try simple merge for basic operations
      try {
        if (typeof op === 'object' && !Array.isArray(op)) {
          Object.assign(this.data, op);
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }
  }
}

// Import our functions
import {
  resolveFileId,
  createNewFile,
  ensureFileExists,
  clearFileContent,
  appendLineToFile,
} from '../src/server/aiChatHandler/chatOperations.js';

describe('Streaming OT Parser', () => {
  let mockDoc;

  beforeEach(() => {
    mockDoc = new MockShareDBDoc();
  });

  test('should create new file when file does not exist', () => {
    const fileName = 'test.js';
    const fileId = ensureFileExists(mockDoc, fileName);

    expect(fileId).toBeDefined();
    expect(mockDoc.data.files[fileId]).toBeDefined();
    expect(mockDoc.data.files[fileId].name).toBe(fileName);
    expect(mockDoc.data.files[fileId].text).toBe('');
  });

  test('should find existing file by name', () => {
    // Create a file first
    const fileName = 'existing.js';
    const fileId1 = ensureFileExists(mockDoc, fileName);

    // Try to find it again
    const fileId2 = ensureFileExists(mockDoc, fileName);

    expect(fileId1).toBe(fileId2);
  });

  test('should append lines to file incrementally', () => {
    const fileName = 'test.js';
    const fileId = ensureFileExists(mockDoc, fileName);

    appendLineToFile(
      mockDoc,
      fileId,
      'console.log("Hello");',
    );
    appendLineToFile(
      mockDoc,
      fileId,
      'console.log("World");',
    );

    const expectedContent =
      'console.log("Hello");\nconsole.log("World");\n';
    expect(mockDoc.data.files[fileId].text).toBe(
      expectedContent,
    );
  });

  test('should clear file content', () => {
    const fileName = 'test.js';
    const fileId = ensureFileExists(mockDoc, fileName);

    // Add some content
    appendLineToFile(mockDoc, fileId, 'some content');
    expect(mockDoc.data.files[fileId].text).toBe(
      'some content\n',
    );

    // Clear it
    clearFileContent(mockDoc, fileId);
    expect(mockDoc.data.files[fileId].text).toBe('');
  });

  test('should handle streaming parser callbacks - simple test without shareDB', async () => {
    let currentFileName = null;
    const capturedLines = [];
    const capturedNonCodeLines = [];

    const callbacks = {
      onFileNameChange: async (fileName, format) => {
        currentFileName = fileName;
      },
      onCodeLine: async (line) => {
        capturedLines.push(line);
      },
      onNonCodeLine: async (line) => {
        capturedNonCodeLines.push(line);
      },
    };

    const parser = new StreamingMarkdownParser(callbacks);

    // Simulate streaming content - using exact format from library test
    const streamContent = "**script.js**\n```js\nconsole.log('Hello');\n```\n";

    await parser.processChunk(streamContent);
    await parser.flushRemaining();

    // Check that file name was captured and code lines were processed
    expect(currentFileName).toBe('script.js');
    expect(capturedLines).toContain("console.log('Hello');");
  });

  test('should handle streaming parser callbacks', async () => {
    let currentFileId = null;
    const capturedLines = [];

    const callbacks = {
      onFileNameChange: async (fileName, format) => {
        currentFileId = ensureFileExists(mockDoc, fileName);
        clearFileContent(mockDoc, currentFileId);
      },
      onCodeLine: async (line) => {
        if (currentFileId) {
          appendLineToFile(mockDoc, currentFileId, line);
          capturedLines.push(line);
        }
      },
      onNonCodeLine: async (line) => {
        // Just capture for testing
      },
    };

    const parser = new StreamingMarkdownParser(callbacks);

    // Simulate streaming content - using exact format from library test
    const streamContent = "**script.js**\n```js\nconsole.log('Hello');\n```\n";

    await parser.processChunk(streamContent);
    await parser.flushRemaining();

    // Check that file was created and content was added
    expect(Object.keys(mockDoc.data.files)).toHaveLength(1);
    const fileId = Object.keys(mockDoc.data.files)[0];
    const file = mockDoc.data.files[fileId];

    expect(file.name).toBe('script.js');
    expect(file.text).toContain("console.log('Hello');");
    expect(capturedLines).toContain("console.log('Hello');");
  });

  test('should handle multiple files without content mixing', async () => {
    const fileOperations = [];
    
    const callbacks = {
      onFileNameChange: async (fileName, format) => {
        fileOperations.push({ type: 'fileChange', fileName });
        const fileId = ensureFileExists(mockDoc, fileName);
        clearFileContent(mockDoc, fileId);
      },
      onCodeLine: async (line) => {
        fileOperations.push({ type: 'codeLine', line });
        // Find the most recent file that was opened
        const lastFileChange = [...fileOperations].reverse().find(op => op.type === 'fileChange');
        if (lastFileChange) {
          const fileId = resolveFileId(lastFileChange.fileName, mockDoc);
          if (fileId) {
            appendLineToFile(mockDoc, fileId, line);
          }
        }
      },
      onNonCodeLine: async (line) => {
        fileOperations.push({ type: 'nonCodeLine', line });
      },
    };

    const parser = new StreamingMarkdownParser(callbacks);

    // Simulate streaming content with multiple files
    const streamContent = `**file1.js**
\`\`\`js
console.log('File 1 content');
\`\`\`

**file2.js**
\`\`\`js
console.log('File 2 content');
\`\`\``;

    await parser.processChunk(streamContent);
    await parser.flushRemaining();

    // Check that both files exist and have correct content
    expect(Object.keys(mockDoc.data.files)).toHaveLength(2);
    
    const file1 = Object.values(mockDoc.data.files).find(f => f.name === 'file1.js');
    const file2 = Object.values(mockDoc.data.files).find(f => f.name === 'file2.js');
    
    expect(file1).toBeDefined();
    expect(file2).toBeDefined();
    expect(file1.text).toContain('File 1 content');
    expect(file2.text).toContain('File 2 content');
    
    // Ensure no content mixing - file1 should not contain file2's content and vice versa
    expect(file1.text).not.toContain('File 2 content');
    expect(file2.text).not.toContain('File 1 content');
  });
});
