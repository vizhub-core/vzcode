import { describe, test, expect } from 'vitest';
import { parseMarkdownFiles } from 'llm-code-format';

describe('AI Paste Edge Cases', () => {
  test('should handle multiple "## Formatting Instructions" markers by taking the first', () => {
    const content = `**file1.js**

\`\`\`javascript
console.log('file1');
\`\`\`

## Formatting Instructions

First formatting section

## Formatting Instructions  

Second formatting section

**fileA.js**

\`\`\`js
console.log('should be ignored');
\`\`\``;

    const preprocessed = content.split('## Formatting Instructions')[0].trim();
    const parsed = parseMarkdownFiles(preprocessed, 'bold');
    
    expect(Object.keys(parsed.files || {})).toEqual(['file1.js']);
    expect(Object.keys(parsed.files || {})).not.toContain('fileA.js');
  });

  test('should handle case-insensitive variations', () => {
    const content = `**file1.js**

\`\`\`javascript
console.log('file1');
\`\`\`

## formatting instructions

**fileA.js**

\`\`\`js
console.log('should NOT be ignored - different case');
\`\`\``;

    // Our current implementation is case-sensitive, which is correct
    // since the FORMAT_INSTRUCTIONS.whole uses exact case
    const preprocessed = content.split('## Formatting Instructions')[0].trim();
    const parsed = parseMarkdownFiles(preprocessed, 'bold');
    
    // Should include both files since case doesn't match
    expect(Object.keys(parsed.files || {})).toContain('file1.js');
    expect(Object.keys(parsed.files || {})).toContain('fileA.js');
  });

  test('should handle content with no formatting instructions normally', () => {
    const content = `**file1.js**

\`\`\`javascript
console.log('file1');
\`\`\`

**file2.js**

\`\`\`javascript
console.log('file2');
\`\`\``;

    const preprocessed = content.split('## Formatting Instructions')[0].trim();
    const parsed = parseMarkdownFiles(preprocessed, 'bold');
    
    expect(Object.keys(parsed.files || {})).toContain('file1.js');
    expect(Object.keys(parsed.files || {})).toContain('file2.js');
    expect(Object.keys(parsed.files || {}).length).toBe(2);
  });

  test('should handle empty content after formatting instructions', () => {
    const content = `**file1.js**

\`\`\`javascript
console.log('file1');
\`\`\`

## Formatting Instructions`;

    const preprocessed = content.split('## Formatting Instructions')[0].trim();
    const parsed = parseMarkdownFiles(preprocessed, 'bold');
    
    expect(Object.keys(parsed.files || {})).toContain('file1.js');
    expect(Object.keys(parsed.files || {}).length).toBe(1);
  });

  test('should handle formatting instructions at the beginning', () => {
    const content = `## Formatting Instructions

**fileA.js**

\`\`\`js
console.log('should be ignored');
\`\`\``;

    const preprocessed = content.split('## Formatting Instructions')[0].trim();
    const parsed = parseMarkdownFiles(preprocessed, 'bold');
    
    // Should result in empty content, no files
    expect(Object.keys(parsed.files || {}).length).toBe(0);
  });
});