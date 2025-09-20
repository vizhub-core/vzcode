import { describe, it, expect } from 'vitest';
import {
  generateFileUnifiedDiff,
  generateFilesUnifiedDiff,
  createFilesSnapshot,
  parseUnifiedDiffStats,
  combineUnifiedDiffs,
  isFileDeletion,
  getDeletedFileName,
  FILE_DELETION_MARKER,
} from '../src/utils/fileDiff';
import { VizFiles } from '@vizhub/viz-types';

describe('fileDiff', () => {
  describe('generateFileUnifiedDiff', () => {
    it('should generate correct unified diff for file changes', () => {
      const beforeContent = 'console.log("Hello, World!");';
      const afterContent =
        '// Welcome to my visualization\nconsole.log("Hello, World!");';

      const diff = generateFileUnifiedDiff(
        'file1',
        'index.js',
        beforeContent,
        afterContent,
      );

      expect(diff).toContain('Index: index.js');
      expect(diff).toContain('--- index.js');
      expect(diff).toContain('+++ index.js');
      expect(diff).toContain(
        '+// Welcome to my visualization',
      );
      expect(diff).toContain(
        ' console.log("Hello, World!");',
      );
    });

    it('should return empty string when content is identical', () => {
      const content = 'console.log("Hello, World!");';

      const diff = generateFileUnifiedDiff(
        'file1',
        'index.js',
        content,
        content,
      );

      expect(diff).toBe('');
    });

    it('should handle removals correctly', () => {
      const beforeContent =
        '// Old comment\nconsole.log("Hello, World!");';
      const afterContent = 'console.log("Hello, World!");';

      const diff = generateFileUnifiedDiff(
        'file1',
        'index.js',
        beforeContent,
        afterContent,
      );

      expect(diff).toContain('Index: index.js');
      expect(diff).toContain('-// Old comment');
      expect(diff).toContain(
        ' console.log("Hello, World!");',
      );
    });

    it('should return deletion marker for file deletions', () => {
      const beforeContent = 'console.log("Hello, World!");';
      const afterContent = '';

      const diff = generateFileUnifiedDiff(
        'file1',
        'index.js',
        beforeContent,
        afterContent,
      );

      expect(diff).toBe(`${FILE_DELETION_MARKER}:index.js`);
    });
  });

  describe('generateFilesUnifiedDiff', () => {
    it('should generate diffs for multiple files', () => {
      const beforeFiles: VizFiles = {
        file1: {
          name: 'index.js',
          text: 'console.log("Hello");',
        },
        file2: {
          name: 'style.css',
          text: 'body { color: red; }',
        },
      };

      const afterFiles: VizFiles = {
        file1: {
          name: 'index.js',
          text: '// Updated\nconsole.log("Hello");',
        },
        file2: {
          name: 'style.css',
          text: 'body { color: red; }',
        }, // No change
      };

      const diffs = generateFilesUnifiedDiff(
        beforeFiles,
        afterFiles,
      );

      // Only file1 should have changes
      expect(Object.keys(diffs)).toEqual(['file1']);
      expect(diffs['file1']).toContain('Index: index.js');
      expect(diffs['file1']).toContain('+// Updated');
    });

    it('should handle new files', () => {
      const beforeFiles: VizFiles = {
        file1: {
          name: 'index.js',
          text: 'console.log("Hello");',
        },
      };

      const afterFiles: VizFiles = {
        file1: {
          name: 'index.js',
          text: 'console.log("Hello");',
        },
        file2: {
          name: 'new.js',
          text: 'console.log("New file");',
        },
      };

      const diffs = generateFilesUnifiedDiff(
        beforeFiles,
        afterFiles,
      );

      expect(Object.keys(diffs)).toEqual(['file2']);
      expect(diffs['file2']).toContain('Index: new.js');
      expect(diffs['file2']).toContain(
        '+console.log("New file");',
      );
    });

    it('should handle deleted files with deletion marker', () => {
      const beforeFiles: VizFiles = {
        file1: {
          name: 'index.js',
          text: 'console.log("Hello");',
        },
        file2: {
          name: 'old.js',
          text: 'console.log("Old file");',
        },
      };

      const afterFiles: VizFiles = {
        file1: {
          name: 'index.js',
          text: 'console.log("Hello");',
        },
      };

      const diffs = generateFilesUnifiedDiff(
        beforeFiles,
        afterFiles,
      );

      expect(Object.keys(diffs)).toEqual(['file2']);
      expect(diffs['file2']).toBe(
        `${FILE_DELETION_MARKER}:old.js`,
      );
    });
  });

  describe('createFilesSnapshot', () => {
    it('should create a deep copy of files', () => {
      const files: VizFiles = {
        file1: {
          name: 'index.js',
          text: 'console.log("Hello");',
        },
      };

      const snapshot = createFilesSnapshot(files);

      // Modify original
      files['file1'].text = 'modified';

      // Snapshot should remain unchanged
      expect(snapshot['file1'].text).toBe(
        'console.log("Hello");',
      );
    });
  });

  describe('parseUnifiedDiffStats', () => {
    it('should parse additions and deletions correctly', () => {
      const unifiedDiff = `diff --git a/index.js b/index.js
index 0000000..1111111 100644
--- a/index.js
+++ b/index.js
@@ -1,2 +1,3 @@
+// New comment
 console.log("Hello");
-console.log("Old");`;

      const stats = parseUnifiedDiffStats(unifiedDiff);

      expect(stats.additions).toBe(1);
      expect(stats.deletions).toBe(1);
    });

    it('should handle empty diff', () => {
      const stats = parseUnifiedDiffStats('');

      expect(stats.additions).toBe(0);
      expect(stats.deletions).toBe(0);
    });

    it('should ignore header lines', () => {
      const unifiedDiff = `diff --git a/index.js b/index.js
index 0000000..1111111 100644
--- a/index.js
+++ b/index.js
@@ -1,1 +1,2 @@
+// Added line
 console.log("Hello");`;

      const stats = parseUnifiedDiffStats(unifiedDiff);

      expect(stats.additions).toBe(1);
      expect(stats.deletions).toBe(0);
    });
  });

  describe('combineUnifiedDiffs', () => {
    it('should combine multiple unified diffs', () => {
      const unifiedDiffs = {
        file1: `diff --git a/file1.js b/file1.js
--- a/file1.js
+++ b/file1.js
@@ -1,1 +1,2 @@
+// Comment
 console.log("file1");`,
        file2: `diff --git a/file2.js b/file2.js
--- a/file2.js
+++ b/file2.js
@@ -1,1 +1,2 @@
+// Comment
 console.log("file2");`,
      };

      const combined = combineUnifiedDiffs(unifiedDiffs);

      expect(combined).toContain(
        'diff --git a/file1.js b/file1.js',
      );
      expect(combined).toContain(
        'diff --git a/file2.js b/file2.js',
      );
      expect(combined).toContain('console.log("file1");');
      expect(combined).toContain('console.log("file2");');
    });

    it('should handle empty diffs object', () => {
      const combined = combineUnifiedDiffs({});
      expect(combined).toBe('');
    });

    it('should exclude file deletion markers from combination', () => {
      const unifiedDiffs = {
        file1: `diff --git a/file1.js b/file1.js
--- a/file1.js
+++ b/file1.js
@@ -1,1 +1,2 @@
+// Comment
 console.log("file1");`,
        file2: `${FILE_DELETION_MARKER}:deleted.js`,
      };

      const combined = combineUnifiedDiffs(unifiedDiffs);

      expect(combined).toContain(
        'diff --git a/file1.js b/file1.js',
      );
      expect(combined).not.toContain(FILE_DELETION_MARKER);
      expect(combined).not.toContain('deleted.js');
    });
  });

  describe('isFileDeletion', () => {
    it('should return true for deletion markers', () => {
      const deletionMarker = `${FILE_DELETION_MARKER}:test.js`;
      expect(isFileDeletion(deletionMarker)).toBe(true);
    });

    it('should return false for regular diffs', () => {
      const regularDiff = `diff --git a/test.js b/test.js
--- a/test.js
+++ b/test.js
@@ -1,1 +1,2 @@
+// Comment
 console.log("test");`;
      expect(isFileDeletion(regularDiff)).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(isFileDeletion('')).toBe(false);
    });
  });

  describe('getDeletedFileName', () => {
    it('should extract file name from deletion marker', () => {
      const deletionMarker = `${FILE_DELETION_MARKER}:test.js`;
      expect(getDeletedFileName(deletionMarker)).toBe(
        'test.js',
      );
    });

    it('should handle file names with paths', () => {
      const deletionMarker = `${FILE_DELETION_MARKER}:src/components/Test.tsx`;
      expect(getDeletedFileName(deletionMarker)).toBe(
        'src/components/Test.tsx',
      );
    });

    it('should return empty string for non-deletion strings', () => {
      const regularDiff = `diff --git a/test.js b/test.js`;
      expect(getDeletedFileName(regularDiff)).toBe('');
    });

    it('should return empty string for empty strings', () => {
      expect(getDeletedFileName('')).toBe('');
    });
  });
});
