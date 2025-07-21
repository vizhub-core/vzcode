import { describe, expect, it, vi, beforeEach } from 'vitest';
import { parseMarkdownFiles } from 'llm-code-format';

// Mock the parseMarkdownFiles function for testing
vi.mock('llm-code-format', () => ({
  parseMarkdownFiles: vi.fn()
}));

// Mock the randomId function
vi.mock('../src/randomId', () => ({
  randomId: vi.fn(() => 'mock-file-id')
}));

describe('Paste for AI Functionality', () => {
  let mockSubmitOperation;
  let mockDocument;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock the submit operation function
    mockSubmitOperation = vi.fn();
    
    // Mock document structure
    mockDocument = {
      files: {
        'existing-file-1': { name: 'index.js', text: 'console.log("hello");' },
        'existing-file-2': { name: 'package.json', text: '{"name": "test"}' }
      }
    };
  });

  // Helper function to simulate the core logic of handlePasteForAI
  const simulatePasteForAI = (clipboardText, submitOperation, existingFiles) => {
    if (!clipboardText.trim()) {
      return { success: false, error: 'Empty clipboard' };
    }

    try {
      // Parse the markdown files format
      const parsed = parseMarkdownFiles(clipboardText, 'bold');

      if (parsed.files && Object.keys(parsed.files).length > 0) {
        // Simulate the submitOperation call
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
              const newFileId = 'mock-file-id'; // Using mock ID
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

        return { 
          success: true, 
          filesUpdated: Object.keys(parsed.files).length,
          result 
        };
      } else {
        return { success: false, error: 'No files found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  it('should successfully parse and update files from valid markdown format', () => {
    // Setup
    const markdownContent = `
**index.js**

\`\`\`javascript
console.log('Updated from AI');
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

**styles.css**

\`\`\`css
body {
  background-color: #f0f0f0;
}
\`\`\`
    `;

    parseMarkdownFiles.mockReturnValue({
      files: {
        'index.js': "console.log('Updated from AI');\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}",
        'styles.css': 'body {\n  background-color: #f0f0f0;\n}'
      }
    });

    // Mock submitOperation to capture the function passed to it
    let capturedUpdateFunction;
    mockSubmitOperation.mockImplementation((updateFunction) => {
      capturedUpdateFunction = updateFunction;
      return updateFunction(mockDocument);
    });

    // Execute
    const result = simulatePasteForAI(markdownContent, mockSubmitOperation, mockDocument.files);

    // Verify
    expect(result.success).toBe(true);
    expect(result.filesUpdated).toBe(2);
    expect(parseMarkdownFiles).toHaveBeenCalledWith(markdownContent, 'bold');
    expect(mockSubmitOperation).toHaveBeenCalledWith(expect.any(Function));

    // Test the actual update function
    const updatedDocument = capturedUpdateFunction(mockDocument);
    expect(updatedDocument.files['existing-file-1'].text).toBe("console.log('Updated from AI');\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}");
    expect(updatedDocument.files['mock-file-id']).toEqual({
      name: 'styles.css',
      text: 'body {\n  background-color: #f0f0f0;\n}'
    });
  });

  it('should handle empty clipboard gracefully', () => {
    const result = simulatePasteForAI('', mockSubmitOperation, mockDocument.files);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Empty clipboard');
    expect(mockSubmitOperation).not.toHaveBeenCalled();
  });

  it('should handle whitespace-only clipboard gracefully', () => {
    const result = simulatePasteForAI('   \n\t  ', mockSubmitOperation, mockDocument.files);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Empty clipboard');
    expect(mockSubmitOperation).not.toHaveBeenCalled();
  });

  it('should handle parsing errors gracefully', () => {
    parseMarkdownFiles.mockImplementation(() => {
      throw new Error('Invalid markdown format');
    });

    const result = simulatePasteForAI('invalid content', mockSubmitOperation, mockDocument.files);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid markdown format');
    expect(mockSubmitOperation).not.toHaveBeenCalled();
  });

  it('should handle content with no parseable files', () => {
    parseMarkdownFiles.mockReturnValue({
      files: {}
    });

    const result = simulatePasteForAI('some text without files', mockSubmitOperation, mockDocument.files);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('No files found');
    expect(mockSubmitOperation).not.toHaveBeenCalled();
  });

  it('should handle content with null files', () => {
    parseMarkdownFiles.mockReturnValue({
      files: null
    });

    const result = simulatePasteForAI('some text', mockSubmitOperation, mockDocument.files);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('No files found');
    expect(mockSubmitOperation).not.toHaveBeenCalled();
  });

  it('should create new files when they do not exist', () => {
    const markdownContent = `
**new-file.js**

\`\`\`javascript
export const newFunction = () => 'new';
\`\`\`
    `;

    parseMarkdownFiles.mockReturnValue({
      files: {
        'new-file.js': "export const newFunction = () => 'new';"
      }
    });

    let capturedUpdateFunction;
    mockSubmitOperation.mockImplementation((updateFunction) => {
      capturedUpdateFunction = updateFunction;
      return updateFunction(mockDocument);
    });

    const result = simulatePasteForAI(markdownContent, mockSubmitOperation, mockDocument.files);

    expect(result.success).toBe(true);
    expect(result.filesUpdated).toBe(1);

    // Test that a new file was created
    const updatedDocument = capturedUpdateFunction(mockDocument);
    expect(updatedDocument.files['mock-file-id']).toEqual({
      name: 'new-file.js',
      text: "export const newFunction = () => 'new';"
    });
  });

  it('should update existing files and create new ones in the same operation', () => {
    const markdownContent = `
**index.js**

\`\`\`javascript
console.log('Updated existing file');
\`\`\`

**new-component.jsx**

\`\`\`jsx
import React from 'react';
export const NewComponent = () => <div>Hello</div>;
\`\`\`
    `;

    parseMarkdownFiles.mockReturnValue({
      files: {
        'index.js': "console.log('Updated existing file');",
        'new-component.jsx': "import React from 'react';\nexport const NewComponent = () => <div>Hello</div>;"
      }
    });

    let capturedUpdateFunction;
    mockSubmitOperation.mockImplementation((updateFunction) => {
      capturedUpdateFunction = updateFunction;
      return updateFunction(mockDocument);
    });

    const result = simulatePasteForAI(markdownContent, mockSubmitOperation, mockDocument.files);

    expect(result.success).toBe(true);
    expect(result.filesUpdated).toBe(2);

    const updatedDocument = capturedUpdateFunction(mockDocument);
    
    // Existing file should be updated
    expect(updatedDocument.files['existing-file-1'].text).toBe("console.log('Updated existing file');");
    
    // New file should be created
    expect(updatedDocument.files['mock-file-id']).toEqual({
      name: 'new-component.jsx',
      text: "import React from 'react';\nexport const NewComponent = () => <div>Hello</div>;"
    });
  });

  it('should preserve existing file properties when updating', () => {
    const originalFile = { 
      name: 'index.js', 
      text: 'old content',
      someOtherProperty: 'preserved'
    };
    
    const documentWithProps = {
      files: {
        'file-with-props': originalFile
      }
    };

    parseMarkdownFiles.mockReturnValue({
      files: {
        'index.js': 'new content'
      }
    });

    let capturedUpdateFunction;
    mockSubmitOperation.mockImplementation((updateFunction) => {
      capturedUpdateFunction = updateFunction;
      return updateFunction(documentWithProps);
    });

    const result = simulatePasteForAI('some content', mockSubmitOperation, documentWithProps.files);

    expect(result.success).toBe(true);

    const updatedDocument = capturedUpdateFunction(documentWithProps);
    expect(updatedDocument.files['file-with-props']).toEqual({
      name: 'index.js',
      text: 'new content',
      someOtherProperty: 'preserved'
    });
  });
});