import { describe, test, expect } from 'vitest';
import { parseMarkdownFiles } from 'llm-code-format';

describe('AI Paste Issue', () => {
  test('should correctly parse files from pasted content', () => {
    const pastedInput = `**getUSAtlasData.js**

\`\`\`javascript
import { json, geoCentroid } from 'd3';
export const getUSAtlasData = () => {
  console.log('test');
};
\`\`\`

**viz.js**

\`\`\`javascript
import { select } from 'd3';
export const viz = (container) => {
  console.log('viz');
};
\`\`\``;

    const parsed = parseMarkdownFiles(pastedInput, 'bold');

    expect(Object.keys(parsed.files || {})).toContain(
      'getUSAtlasData.js',
    );
    expect(Object.keys(parsed.files || {})).toContain(
      'viz.js',
    );
    expect(Object.keys(parsed.files || {}).length).toBe(2);
  });

  test('should handle file content with complex code', () => {
    const pastedInput = `**utils.js**

\`\`\`javascript
export function processData(data) {
  return data
    .filter(item => item.active)
    .map(item => ({
      ...item,
      processed: true
    }));
}
\`\`\`

**config.json**

\`\`\`json
{
  "version": "1.0.0",
  "settings": {
    "debug": true,
    "timeout": 5000
  }
}
\`\`\``;

    const parsed = parseMarkdownFiles(pastedInput, 'bold');

    expect(Object.keys(parsed.files || {}).length).toBe(2);
    expect(Object.keys(parsed.files || {})).toContain(
      'utils.js',
    );
    expect(Object.keys(parsed.files || {})).toContain(
      'config.json',
    );
  });

  test('should preserve file content exactly', () => {
    const fileContent =
      'export function hello() {\n  return "world";\n}';
    const pastedInput = `**hello.js**

\`\`\`javascript
${fileContent}
\`\`\``;

    const parsed = parseMarkdownFiles(pastedInput, 'bold');

    expect(parsed.files?.['hello.js']).toBe(fileContent);
  });
});
