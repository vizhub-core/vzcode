import { describe, test, expect } from 'vitest';
import { prepareFilesForPrompt } from 'editcodewithai';

describe('AI Copy Truncation', () => {
  test('should truncate large code files to 500 lines', () => {
    // Create a large JavaScript file with 1000 lines
    const largeLines = Array.from(
      { length: 1000 },
      (_, i) => `console.log('line ${i + 1}');`,
    );
    const largeFileContent = largeLines.join('\n');

    const files = {
      'large.js': {
        name: 'large.js',
        text: largeFileContent,
      },
    };

    const { files: truncated } =
      prepareFilesForPrompt(files);

    // Should truncate to 500 lines
    const truncatedLines = truncated['large.js']
      .split('\n')
      .filter((line) => line.trim());
    expect(truncatedLines.length).toBeLessThanOrEqual(500);
  });

  test('should truncate CSV files to 50 lines', () => {
    // Create a large CSV file with 200 lines
    const csvLines = Array.from(
      { length: 200 },
      (_, i) => `id,name,value\n${i},item${i},${i * 100}`,
    );
    const csvContent = csvLines.join('\n');

    const files = {
      'data.csv': {
        name: 'data.csv',
        text: csvContent,
      },
    };

    const { files: truncated } =
      prepareFilesForPrompt(files);

    // Should truncate to 50 lines max
    const truncatedLines = truncated['data.csv']
      .split('\n')
      .filter((line) => line.trim());
    expect(truncatedLines.length).toBeLessThanOrEqual(50);
  });

  test('should truncate JSON files to 50 lines', () => {
    // Create a large JSON file with 200 lines
    const jsonArray = Array.from(
      { length: 200 },
      (_, i) => ({
        id: i,
        name: `item${i}`,
        value: i * 100,
      }),
    );
    const jsonContent = JSON.stringify(jsonArray, null, 2);

    const files = {
      'data.json': {
        name: 'data.json',
        text: jsonContent,
      },
    };

    const { files: truncated } =
      prepareFilesForPrompt(files);

    // Should truncate to 50 lines max
    const truncatedLines = truncated['data.json']
      .split('\n')
      .filter((line) => line.trim());
    expect(truncatedLines.length).toBeLessThanOrEqual(50);
  });

  test('should truncate individual lines to 200 characters', () => {
    const longLine =
      'a'.repeat(300) + '\n' + 'b'.repeat(300);
    const files = {
      'long-lines.txt': {
        name: 'long-lines.txt',
        text: longLine,
      },
    };

    const { files: truncated } =
      prepareFilesForPrompt(files);

    // Each line should be max 200 characters
    const lines = truncated['long-lines.txt'].split('\n');
    lines.forEach((line) => {
      expect(line.length).toBeLessThanOrEqual(200);
    });
  });

  test('should exclude image files', () => {
    const files = {
      'image1.png': {
        name: 'image1.png',
        text: 'PNG binary data',
      },
      'image2.jpg': {
        name: 'image2.jpg',
        text: 'JPG binary data',
      },
      'code.js': {
        name: 'code.js',
        text: 'console.log("hello");',
      },
    };

    const { files: truncated, imageFiles } =
      prepareFilesForPrompt(files);

    // Image files should not be in truncated files
    expect(truncated['image1.png']).toBeUndefined();
    expect(truncated['image2.jpg']).toBeUndefined();

    // Code file should still be present
    expect(truncated['code.js']).toBeDefined();

    // Image files should be listed in imageFiles array
    expect(imageFiles).toContain('image1.png');
    expect(imageFiles).toContain('image2.jpg');
  });

  test('should handle mixed file types', () => {
    const files = {
      'script.js': {
        name: 'script.js',
        text: Array.from(
          { length: 600 },
          (_, i) => `console.log('line ${i}');`,
        ).join('\n'),
      },
      'data.json': {
        name: 'data.json',
        text: Array.from({ length: 100 }, (_, i) =>
          JSON.stringify({ id: i }),
        ).join('\n'),
      },
      'readme.md': {
        name: 'readme.md',
        text: 'This is a readme file',
      },
      'image.svg': {
        name: 'image.svg',
        text: '<svg></svg>',
      },
    };

    const { files: truncated, imageFiles } =
      prepareFilesForPrompt(files);

    // SVG should be excluded
    expect(truncated['image.svg']).toBeUndefined();
    expect(imageFiles).toContain('image.svg');

    // Markdown should be included
    expect(truncated['readme.md']).toBeDefined();

    // JavaScript should be truncated to 500 lines max
    const jsLines = truncated['script.js']
      .split('\n')
      .filter((line) => line.trim());
    expect(jsLines.length).toBeLessThanOrEqual(500);

    // JSON should be truncated to 50 lines max
    const jsonLines = truncated['data.json']
      .split('\n')
      .filter((line) => line.trim());
    expect(jsonLines.length).toBeLessThanOrEqual(50);
  });

  test('should preserve small files unchanged', () => {
    const smallContent =
      'function hello() {\n  return "world";\n}';
    const files = {
      'small.js': {
        name: 'small.js',
        text: smallContent,
      },
    };

    const { files: truncated } =
      prepareFilesForPrompt(files);

    // Small files should not be truncated
    expect(
      truncated['small.js'].split('\n').length,
    ).toBeLessThanOrEqual(smallContent.split('\n').length);
  });
});
