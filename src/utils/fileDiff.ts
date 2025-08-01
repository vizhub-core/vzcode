import { diff_match_patch } from 'diff-match-patch';
import { VizFiles, VizFileId } from '@vizhub/viz-types';

export interface FileDiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber?: number; // Line number in the original or new file
}

export interface FileDiff {
  fileId: VizFileId;
  fileName: string;
  beforeContent: string;
  afterContent: string;
  lines: FileDiffLine[];
  hasChanges: boolean;
}

export interface FilesDiff {
  [fileId: VizFileId]: FileDiff;
}

/**
 * Generate a diff for a single file
 */
export function generateFileDiff(
  fileId: VizFileId,
  fileName: string,
  beforeContent: string,
  afterContent: string,
): FileDiff {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(beforeContent, afterContent);
  dmp.diff_cleanupSemantic(diffs);

  const lines: FileDiffLine[] = [];
  let originalLineNum = 1;
  let newLineNum = 1;

  for (const [operation, text] of diffs) {
    const textLines = text.split('\n');

    for (let i = 0; i < textLines.length; i++) {
      const isLastLine = i === textLines.length - 1;
      const content = textLines[i];

      // Skip empty lines at the end unless it's the only line
      if (
        isLastLine &&
        content === '' &&
        textLines.length > 1
      ) {
        continue;
      }

      if (operation === 0) {
        // EQUAL
        lines.push({
          type: 'unchanged',
          content,
          lineNumber: originalLineNum,
        });
        originalLineNum++;
        newLineNum++;
      } else if (operation === -1) {
        // DELETE
        lines.push({
          type: 'removed',
          content,
          lineNumber: originalLineNum,
        });
        originalLineNum++;
      } else if (operation === 1) {
        // INSERT
        lines.push({
          type: 'added',
          content,
          lineNumber: newLineNum,
        });
        newLineNum++;
      }
    }
  }

  const hasChanges = lines.some(
    (line) => line.type !== 'unchanged',
  );

  return {
    fileId,
    fileName,
    beforeContent,
    afterContent,
    lines,
    hasChanges,
  };
}

/**
 * Generate diffs for multiple files
 */
export function generateFilesDiff(
  beforeFiles: VizFiles,
  afterFiles: VizFiles,
): FilesDiff {
  const result: FilesDiff = {};
  const allFileIds = new Set([
    ...Object.keys(beforeFiles),
    ...Object.keys(afterFiles),
  ]);

  for (const fileId of allFileIds) {
    const beforeFile = beforeFiles[fileId];
    const afterFile = afterFiles[fileId];

    const beforeContent = beforeFile?.text || '';
    const afterContent = afterFile?.text || '';
    const fileName =
      afterFile?.name || beforeFile?.name || fileId;

    // Only generate diff if there are actual changes
    if (beforeContent !== afterContent) {
      result[fileId] = generateFileDiff(
        fileId,
        fileName,
        beforeContent,
        afterContent,
      );
    }
  }

  return result;
}

/**
 * Create a snapshot of current files for diff comparison
 */
export function createFilesSnapshot(
  files: VizFiles,
): VizFiles {
  return JSON.parse(JSON.stringify(files));
}

/**
 * Convert FilesDiff to unified diff format for diff2html
 */
export function generateUnifiedDiff(
  filesDiff: FilesDiff,
): string {
  const diffParts: string[] = [];

  for (const fileDiff of Object.values(filesDiff)) {
    if (!fileDiff.hasChanges) continue;

    // Create unified diff header
    diffParts.push(
      `diff --git a/${fileDiff.fileName} b/${fileDiff.fileName}`,
    );
    diffParts.push(`index 0000000..1111111 100644`);
    diffParts.push(`--- a/${fileDiff.fileName}`);
    diffParts.push(`+++ b/${fileDiff.fileName}`);

    // Group consecutive lines into hunks
    const hunks: string[] = [];
    let currentHunk: string[] = [];
    let hunkOldStart = 1;
    let hunkNewStart = 1;
    let hunkOldCount = 0;
    let hunkNewCount = 0;

    for (let i = 0; i < fileDiff.lines.length; i++) {
      const line = fileDiff.lines[i];

      if (currentHunk.length === 0) {
        // Start new hunk
        hunkOldStart = line.lineNumber || 1;
        hunkNewStart = line.lineNumber || 1;
      }

      if (line.type === 'unchanged') {
        currentHunk.push(` ${line.content}`);
        hunkOldCount++;
        hunkNewCount++;
      } else if (line.type === 'removed') {
        currentHunk.push(`-${line.content}`);
        hunkOldCount++;
      } else if (line.type === 'added') {
        currentHunk.push(`+${line.content}`);
        hunkNewCount++;
      }
    }

    // Add hunk header and content if we have any changes
    if (currentHunk.length > 0) {
      const hunkHeader = `@@ -${hunkOldStart},${hunkOldCount} +${hunkNewStart},${hunkNewCount} @@`;
      hunks.push(hunkHeader);
      hunks.push(...currentHunk);
    }

    diffParts.push(...hunks);
  }

  return diffParts.join('\n');
}
