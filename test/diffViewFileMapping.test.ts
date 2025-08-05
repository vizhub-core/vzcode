import { describe, it, expect } from 'vitest';
import { UnifiedFilesDiff } from '../src/utils/fileDiff';

// Extract the file name mapping logic from DiffView for testing
function createFileNameToIdMap(diffData: UnifiedFilesDiff): Map<string, string> {
  const map = new Map<string, string>();
  Object.entries(diffData).forEach(([fileId, diff]) => {
    // Extract file name from the unified diff
    // The diff contains lines like "--- a/filename" and "+++ b/filename"
    const lines = diff.split('\n');
    for (const line of lines) {
      if (line.startsWith('--- a/') || line.startsWith('+++ b/')) {
        const fileName = line.substring(6); // Remove "--- a/" or "+++ b/"
        map.set(fileName, fileId);
        break;
      }
    }
  });
  return map;
}

describe('DiffView file name mapping', () => {
  it('should map file names to file IDs correctly', () => {
    const diffData: UnifiedFilesDiff = {
      file1: `Index: components/mouth.js
===================================================================
--- a/components/mouth.js
+++ b/components/mouth.js
@@ -1,3 +1,3 @@
 export const mouth = () => {
-  return 'sad';
+  return 'happy';
 };`,
      file2: `Index: index.js
===================================================================
--- a/index.js
+++ b/index.js
@@ -1,2 +1,3 @@
+// New comment
 console.log("Hello");
 export * from './components/mouth.js';`,
    };

    const map = createFileNameToIdMap(diffData);

    expect(map.get('components/mouth.js')).toBe('file1');
    expect(map.get('index.js')).toBe('file2');
    expect(map.size).toBe(2);
  });

  it('should handle empty diff data', () => {
    const diffData: UnifiedFilesDiff = {};
    const map = createFileNameToIdMap(diffData);
    expect(map.size).toBe(0);
  });

  it('should handle diff with no file changes', () => {
    const diffData: UnifiedFilesDiff = {
      file1: '', // empty diff
    };
    const map = createFileNameToIdMap(diffData);
    expect(map.size).toBe(0);
  });

  it('should handle file with complex path', () => {
    const diffData: UnifiedFilesDiff = {
      complexFile: `Index: src/components/ui/Button.tsx
===================================================================
--- a/src/components/ui/Button.tsx
+++ b/src/components/ui/Button.tsx
@@ -1,3 +1,3 @@
 export const Button = () => {
-  return <button>Click</button>;
+  return <button className="btn">Click</button>;
 };`,
    };

    const map = createFileNameToIdMap(diffData);
    expect(map.get('src/components/ui/Button.tsx')).toBe('complexFile');
  });
});