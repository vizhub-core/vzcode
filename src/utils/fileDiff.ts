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
      if (isLastLine && content === '' && textLines.length > 1) {
        continue;
      }

      if (operation === 0) { // EQUAL
        lines.push({
          type: 'unchanged',
          content,
          lineNumber: originalLineNum,
        });
        originalLineNum++;
        newLineNum++;
      } else if (operation === -1) { // DELETE
        lines.push({
          type: 'removed',
          content,
          lineNumber: originalLineNum,
        });
        originalLineNum++;
      } else if (operation === 1) { // INSERT
        lines.push({
          type: 'added',
          content,
          lineNumber: newLineNum,
        });
        newLineNum++;
      }
    }
  }

  const hasChanges = lines.some(line => line.type !== 'unchanged');

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
    const fileName = afterFile?.name || beforeFile?.name || fileId;

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
export function createFilesSnapshot(files: VizFiles): VizFiles {
  return JSON.parse(JSON.stringify(files));
}