import { describe, it, expect } from 'vitest';
import { MINIMAL_EXTENSIONS } from '../src/client/featureFlags';
import fs from 'fs';
import path from 'path';

// Test for MINIMAL_EXTENSIONS feature flag
describe('MINIMAL_EXTENSIONS feature flag', () => {
  it('should be defined and have a boolean value', () => {
    expect(typeof MINIMAL_EXTENSIONS).toBe('boolean');
  });

  it('should default to false', () => {
    expect(MINIMAL_EXTENSIONS).toBe(false);
  });

  it('should be used in the getOrCreateEditor function', () => {
    // Read the source file and check that MINIMAL_EXTENSIONS is used
    const filePath = path.join(
      process.cwd(),
      'src/client/CodeEditor/getOrCreateEditor.tsx',
    );
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Check that MINIMAL_EXTENSIONS is imported
    expect(fileContent).toContain(
      'import { MINIMAL_EXTENSIONS }',
    );

    // Check that MINIMAL_EXTENSIONS is used in conditional logic
    expect(fileContent).toContain(
      'if (MINIMAL_EXTENSIONS)',
    );
  });
});
