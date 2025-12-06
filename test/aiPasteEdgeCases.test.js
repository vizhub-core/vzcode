import { describe, test, expect } from 'vitest';
import { parseMarkdownFiles } from 'llm-code-format';

describe('AI Paste Edge Cases', () => {
  test('should handle single file correctly', () => {
    const content = `**file1.js**

\`\`\`javascript
console.log('file1');
\`\`\``;

    const parsed = parseMarkdownFiles(content, 'bold');

    expect(Object.keys(parsed.files || {})).toEqual([
      'file1.js',
    ]);
  });

  test('should handle multiple files correctly', () => {
    const content = `**file1.js**

\`\`\`javascript
console.log('file1');
\`\`\`

**file2.js**

\`\`\`javascript
console.log('file2');
\`\`\``;

    const parsed = parseMarkdownFiles(content, 'bold');

    expect(Object.keys(parsed.files || {})).toContain(
      'file1.js',
    );
    expect(Object.keys(parsed.files || {})).toContain(
      'file2.js',
    );
    expect(Object.keys(parsed.files || {}).length).toBe(2);
  });

  test('should handle files with different languages', () => {
    const content = `**file1.js**

\`\`\`javascript
console.log('file1');
\`\`\`

**file2.ts**

\`\`\`typescript
console.log('file2');
\`\`\`

**file3.css**

\`\`\`css
body { color: red; }
\`\`\``;

    const parsed = parseMarkdownFiles(content, 'bold');

    expect(Object.keys(parsed.files || {}).length).toBe(3);
    expect(Object.keys(parsed.files || {})).toContain(
      'file1.js',
    );
    expect(Object.keys(parsed.files || {})).toContain(
      'file2.ts',
    );
    expect(Object.keys(parsed.files || {})).toContain(
      'file3.css',
    );
  });

  test('should handle files with various line endings', () => {
    const content = `**file1.js**\r\n\r\n\`\`\`javascript\r\nconsole.log('file1');\r\n\`\`\`\r\n\r\n**file2.js**\r\n\r\n\`\`\`javascript\r\nconsole.log('file2');\r\n\`\`\``;

    // Normalize line endings as the paste handler does
    const normalized = content.replace(/\r\n?/g, '\n');
    const parsed = parseMarkdownFiles(normalized, 'bold');

    expect(Object.keys(parsed.files || {}).length).toBe(2);
    expect(Object.keys(parsed.files || {})).toContain(
      'file1.js',
    );
    expect(Object.keys(parsed.files || {})).toContain(
      'file2.js',
    );
  });

  test('should handle empty content', () => {
    const content = '';
    const parsed = parseMarkdownFiles(content, 'bold');

    expect(Object.keys(parsed.files || {}).length).toBe(0);
  });
});
