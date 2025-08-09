import { describe, test, expect } from 'vitest';
import { parseMarkdownFiles } from 'llm-code-format';

describe('AI Paste Issue', () => {
  test('should reproduce the extra files issue', () => {
    // Simulate the problematic input from the issue description
    const problematicInput = `**getUSAtlasData.js**

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
\`\`\`

## Formatting Instructions

Suggest changes to the original files using this exact format:

**fileA.js**

\`\`\`js
// Entire updated code for fileA
\`\`\`

**fileB.js**

\`\`\`js
// Entire updated code for fileB
\`\`\`

Only include the files that need to be updated or created.`;

    const parsed = parseMarkdownFiles(
      problematicInput,
      'bold',
    );

    // This should show the problem - extra files being created
    expect(Object.keys(parsed.files || {})).toContain(
      'getUSAtlasData.js',
    );
    expect(Object.keys(parsed.files || {})).toContain(
      'viz.js',
    );
    // The problem: these extra files should NOT be created
    expect(Object.keys(parsed.files || {})).toContain(
      'fileA.js',
    );
    expect(Object.keys(parsed.files || {})).toContain(
      'fileB.js',
    );
  });

  test('should fix the extra files issue by preprocessing', () => {
    const problematicInput = `**getUSAtlasData.js**

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
\`\`\`

## Formatting Instructions

Suggest changes to the original files using this exact format:

**fileA.js**

\`\`\`js
// Entire updated code for fileA
\`\`\`

**fileB.js**

\`\`\`js
// Entire updated code for fileB
\`\`\`

Only include the files that need to be updated or created.`;

    // Preprocess to remove everything after "## Formatting Instructions"
    const preprocessed = problematicInput
      .split('## Formatting Instructions')[0]
      .trim();
    const parsedFixed = parseMarkdownFiles(
      preprocessed,
      'bold',
    );

    // After preprocessing, only the real files should be present
    expect(Object.keys(parsedFixed.files || {})).toContain(
      'getUSAtlasData.js',
    );
    expect(Object.keys(parsedFixed.files || {})).toContain(
      'viz.js',
    );
    // The fix: these extra files should NOT be created
    expect(
      Object.keys(parsedFixed.files || {}),
    ).not.toContain('fileA.js');
    expect(
      Object.keys(parsedFixed.files || {}),
    ).not.toContain('fileB.js');

    // Should only have 2 files
    expect(
      Object.keys(parsedFixed.files || {}).length,
    ).toBe(2);
  });
});
