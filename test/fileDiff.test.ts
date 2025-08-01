import { describe, it, expect } from 'vitest';
import {
  generateFileDiff,
  generateFilesDiff,
  createFilesSnapshot,
  generateUnifiedDiff,
} from '../src/utils/fileDiff';
import { VizFiles } from '@vizhub/viz-types';

describe('fileDiff', () => {
  describe('generateFileDiff', () => {
    it('should generate correct diff for file changes', () => {
      const beforeContent = 'console.log("Hello, World!");';
      const afterContent =
        '// Welcome to my visualization\nconsole.log("Hello, World!");';

      const diff = generateFileDiff(
        'file1',
        'index.js',
        beforeContent,
        afterContent,
      );

      expect(diff.fileId).toBe('file1');
      expect(diff.fileName).toBe('index.js');
      expect(diff.hasChanges).toBe(true);
      expect(diff.lines).toHaveLength(2);
      expect(diff.lines[0].type).toBe('added');
      expect(diff.lines[0].content).toBe(
        '// Welcome to my visualization',
      );
      expect(diff.lines[1].type).toBe('unchanged');
      expect(diff.lines[1].content).toBe(
        'console.log("Hello, World!");',
      );
    });

    it('should detect no changes when content is identical', () => {
      const content = 'console.log("Hello, World!");';

      const diff = generateFileDiff(
        'file1',
        'index.js',
        content,
        content,
      );

      expect(diff.hasChanges).toBe(false);
      expect(diff.lines).toHaveLength(1);
      expect(diff.lines[0].type).toBe('unchanged');
    });

    it('should handle removals correctly', () => {
      const beforeContent =
        '// Old comment\nconsole.log("Hello, World!");';
      const afterContent = 'console.log("Hello, World!");';

      const diff = generateFileDiff(
        'file1',
        'index.js',
        beforeContent,
        afterContent,
      );

      expect(diff.hasChanges).toBe(true);
      expect(diff.lines).toHaveLength(2);
      expect(diff.lines[0].type).toBe('removed');
      expect(diff.lines[0].content).toBe('// Old comment');
      expect(diff.lines[1].type).toBe('unchanged');
      expect(diff.lines[1].content).toBe(
        'console.log("Hello, World!");',
      );
    });
  });

  describe('generateFilesDiff', () => {
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

      const diffs = generateFilesDiff(
        beforeFiles,
        afterFiles,
      );

      // Only file1 should have changes
      expect(Object.keys(diffs)).toEqual(['file1']);
      expect(diffs['file1'].hasChanges).toBe(true);
      expect(diffs['file1'].lines[0].type).toBe('added');
      expect(diffs['file1'].lines[0].content).toBe(
        '// Updated',
      );
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

      const diffs = generateFilesDiff(
        beforeFiles,
        afterFiles,
      );

      expect(Object.keys(diffs)).toEqual(['file2']);
      expect(diffs['file2'].hasChanges).toBe(true);
      expect(diffs['file2'].beforeContent).toBe('');
      expect(diffs['file2'].afterContent).toBe(
        'console.log("New file");',
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

  describe('generateUnifiedDiff', () => {
    it('should generate valid unified diff format', () => {
      const beforeContent = 'console.log("Hello");';
      const afterContent =
        '// Welcome\nconsole.log("Hello");';

      const fileDiff = generateFileDiff(
        'file1',
        'index.js',
        beforeContent,
        afterContent,
      );
      const filesDiff = { file1: fileDiff };

      const unifiedDiff = generateUnifiedDiff(filesDiff);

      expect(unifiedDiff).toContain(
        'diff --git a/index.js b/index.js',
      );
      expect(unifiedDiff).toContain('--- a/index.js');
      expect(unifiedDiff).toContain('+++ b/index.js');
      expect(unifiedDiff).toContain('+// Welcome');
      expect(unifiedDiff).toContain(
        ' console.log("Hello");',
      );
    });

    it('should handle empty diff data', () => {
      const unifiedDiff = generateUnifiedDiff({});
      expect(unifiedDiff).toBe('');
    });

    it('should skip files with no changes', () => {
      const content = 'console.log("Hello");';
      const fileDiff = generateFileDiff(
        'file1',
        'index.js',
        content,
        content,
      );
      const filesDiff = { file1: fileDiff };

      const unifiedDiff = generateUnifiedDiff(filesDiff);
      expect(unifiedDiff).toBe('');
    });
  });
});
