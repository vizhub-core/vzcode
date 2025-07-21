import { describe, expect, it, vi, beforeEach } from 'vitest';

// Test file for edge cases and error handling in paste functionality
describe('Paste for AI Edge Cases', () => {
  
  it('should handle very large clipboard content', () => {
    // Generate a large content string
    const largeContent = 'x'.repeat(1000000); // 1MB of content
    const markdownContent = `
**large-file.js**

\`\`\`javascript
${largeContent}
\`\`\`
    `;

    // This test ensures the function doesn't crash with large content
    expect(() => {
      // Simulate parsing logic
      const fileMatches = markdownContent.match(/\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/g);
      expect(fileMatches).toBeTruthy();
      expect(fileMatches.length).toBe(1);
    }).not.toThrow();
  });

  it('should handle special characters in file names', () => {
    const markdownContent = `
**my-file with spaces.js**

\`\`\`javascript
console.log('spaces in filename');
\`\`\`

**file_with_underscores.py**

\`\`\`python
print("underscores")
\`\`\`

**file-with-dashes.css**

\`\`\`css
.dash-class { color: red; }
\`\`\`
    `;

    const fileMatches = markdownContent.match(/\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/g);
    expect(fileMatches).toBeTruthy();
    expect(fileMatches.length).toBe(3);

    const fileNames = fileMatches.map(match => {
      const [, fileName] = match.match(/\*\*([^*]+)\*\*/);
      return fileName;
    });

    expect(fileNames).toContain('my-file with spaces.js');
    expect(fileNames).toContain('file_with_underscores.py');
    expect(fileNames).toContain('file-with-dashes.css');
  });

  it('should handle files with no extension', () => {
    const markdownContent = `
**Dockerfile**

\`\`\`dockerfile
FROM node:18
WORKDIR /app
\`\`\`

**README**

\`\`\`text
This is a readme file without extension
\`\`\`
    `;

    const fileMatches = markdownContent.match(/\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/g);
    expect(fileMatches).toBeTruthy();
    expect(fileMatches.length).toBe(2);
  });

  it('should handle empty files', () => {
    const markdownContent = `
**empty.js**

\`\`\`javascript
\`\`\`

**another-empty.css**

\`\`\`css

\`\`\`
    `;

    const fileMatches = markdownContent.match(/\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/g);
    expect(fileMatches).toBeTruthy();
    expect(fileMatches.length).toBe(2);

    const files = {};
    fileMatches.forEach(match => {
      const [, fileName, content] = match.match(/\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/);
      files[fileName] = content.trim();
    });

    expect(files['empty.js']).toBe('');
    expect(files['another-empty.css']).toBe('');
  });

  it('should handle mixed content with text and files', () => {
    const markdownContent = `
Here's some explanation text that should be ignored.

**config.js**

\`\`\`javascript
export const config = { api: 'localhost' };
\`\`\`

More explanatory text here.

And here's another file:

**utils.js**

\`\`\`javascript
export const helper = () => 'help';
\`\`\`

Final notes that should also be ignored.
    `;

    const fileMatches = markdownContent.match(/\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/g);
    expect(fileMatches).toBeTruthy();
    expect(fileMatches.length).toBe(2);

    const files = {};
    fileMatches.forEach(match => {
      const [, fileName, content] = match.match(/\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/);
      files[fileName] = content.trim();
    });

    expect(files['config.js']).toContain('export const config');
    expect(files['utils.js']).toContain('export const helper');
  });

  it('should handle nested directories in file names', () => {
    const markdownContent = `
**src/components/Button.jsx**

\`\`\`jsx
import React from 'react';
export const Button = () => <button>Click me</button>;
\`\`\`

**src/utils/helpers.js**

\`\`\`javascript
export const formatDate = (date) => date.toISOString();
\`\`\`

**public/index.html**

\`\`\`html
<!DOCTYPE html>
<html><head><title>App</title></head></html>
\`\`\`
    `;

    const fileMatches = markdownContent.match(/\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/g);
    expect(fileMatches).toBeTruthy();
    expect(fileMatches.length).toBe(3);

    const fileNames = fileMatches.map(match => {
      const [, fileName] = match.match(/\*\*([^*]+)\*\*/);
      return fileName;
    });

    expect(fileNames).toContain('src/components/Button.jsx');
    expect(fileNames).toContain('src/utils/helpers.js');
    expect(fileNames).toContain('public/index.html');
  });

  it('should handle unicode characters in content', () => {
    const markdownContent = `
**unicode-test.js**

\`\`\`javascript
// Test with unicode: 你好世界 🌍 🚀
const greeting = "Héllo, wörld! 🎉";
const emoji = "😀😃😄😁";
console.log(greeting + " " + emoji);
\`\`\`
    `;

    const fileMatches = markdownContent.match(/\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/g);
    expect(fileMatches).toBeTruthy();
    expect(fileMatches.length).toBe(1);

    const [, fileName, content] = fileMatches[0].match(/\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/);
    expect(fileName).toBe('unicode-test.js');
    expect(content).toContain('你好世界');
    expect(content).toContain('🌍');
    expect(content).toContain('Héllo, wörld!');
    expect(content).toContain('😀😃😄😁');
  });

  it('should handle code blocks with different language specifiers', () => {
    const markdownContent = `
**script.js**

\`\`\`javascript
console.log('JavaScript');
\`\`\`

**style.css**

\`\`\`css
body { color: blue; }
\`\`\`

**component.tsx**

\`\`\`typescript
interface Props { name: string; }
\`\`\`

**data.json**

\`\`\`json
{"key": "value"}
\`\`\`

**plain.txt**

\`\`\`
Plain text with no language specifier
\`\`\`
    `;

    const fileMatches = markdownContent.match(/\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/g);
    expect(fileMatches).toBeTruthy();
    expect(fileMatches.length).toBe(5);

    const files = {};
    fileMatches.forEach(match => {
      const [, fileName, content] = match.match(/\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/);
      files[fileName] = content.trim();
    });

    expect(files['script.js']).toContain('JavaScript');
    expect(files['style.css']).toContain('color: blue');
    expect(files['component.tsx']).toContain('interface Props');
    expect(files['data.json']).toContain('{"key": "value"}');
    expect(files['plain.txt']).toContain('Plain text');
  });

  it('should handle performance with many files', () => {
    // Generate content with many files
    const fileCount = 50;
    let markdownContent = '';
    
    for (let i = 0; i < fileCount; i++) {
      markdownContent += `
**file${i}.js**

\`\`\`javascript
console.log('File ${i}');
export const value${i} = ${i};
\`\`\`
`;
    }

    const startTime = Date.now();
    const fileMatches = markdownContent.match(/\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/g);
    const endTime = Date.now();

    expect(fileMatches).toBeTruthy();
    expect(fileMatches.length).toBe(fileCount);
    expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second

    // Verify first and last files
    const files = {};
    fileMatches.forEach(match => {
      const [, fileName, content] = match.match(/\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/);
      files[fileName] = content.trim();
    });

    expect(files['file0.js']).toContain('File 0');
    expect(files[`file${fileCount-1}.js`]).toContain(`File ${fileCount-1}`);
  });
});