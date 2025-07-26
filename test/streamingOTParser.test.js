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

  test('should handle streaming parser callbacks', () => {
    let currentFileId = null;
    const capturedLines = [];

    const callbacks = {
      onFileNameChange: (fileName, format) => {
        console.log(`DEBUG: onFileNameChange called with fileName: ${fileName}, format: ${format}`);
        currentFileId = ensureFileExists(mockDoc, fileName);
        console.log(`DEBUG: currentFileId set to: ${currentFileId}`);
        clearFileContent(mockDoc, currentFileId);
        console.log(`DEBUG: File content cleared for fileId: ${currentFileId}`);
      },
      onCodeLine: (line) => {
        console.log(`DEBUG: onCodeLine called with line: "${line}"`);
        if (currentFileId) {
          appendLineToFile(mockDoc, currentFileId, line);
          capturedLines.push(line);
          console.log(`DEBUG: Line appended to fileId: ${currentFileId}, total lines: ${capturedLines.length}`);
        } else {
          console.log(`DEBUG: No currentFileId set, skipping line: "${line}"`);
        }
      },
      onNonCodeLine: (line) => {
        console.log(`DEBUG: onNonCodeLine called with line: "${line}"`);
        // Just capture for testing
      },
    };

    const parser = new StreamingMarkdownParser(callbacks);

    // Simulate streaming content
    const streamContent = `**test.js**
\`\`\`javascript
function hello() {
  console.log("Hello World");
}
\`\`\``;

    console.log(`DEBUG: Processing stream content: ${streamContent}`);
    parser.processChunk(streamContent);
    parser.flushRemaining();

    console.log(`DEBUG: Mock document files:`, JSON.stringify(mockDoc.data.files, null, 2));
    console.log(`DEBUG: Captured lines:`, capturedLines);

    // Check that file was created and content was added
    expect(Object.keys(mockDoc.data.files)).toHaveLength(1);
    const fileId = Object.keys(mockDoc.data.files)[0];
    const file = mockDoc.data.files[fileId];

    console.log(`DEBUG: File object:`, file);

    expect(file.name).toBe('test.js');
    expect(file.text).toContain('function hello()');
    expect(file.text).toContain(
      'console.log("Hello World")',
    );
    expect(capturedLines).toContain('function hello() {');
    expect(capturedLines).toContain(
      '  console.log("Hello World");',
    );
  });
});
