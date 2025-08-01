import { diffLines } from 'diff';
import { VizFiles, VizFileId } from '@vizhub/viz-types';

export interface FileDiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'ellipsis';
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
  const changes = diffLines(beforeContent, afterContent);
  
  const CONTEXT = 1; // how many unchanged lines to keep around changes
  const lines: FileDiffLine[] = [];
  let originalLineNum = 1;
  let newLineNum = 1;

  // Process each diff part
  for (const part of changes) {
    if (part.added || part.removed) {
      // For additions and removals, add all lines as-is
      const partLines = part.value.split('\n');
      
      for (let i = 0; i < partLines.length; i++) {
        const content = partLines[i];
        const isLastEmptyLine = i === partLines.length - 1 && content === '';
        
        // Skip the trailing empty line that split creates
        if (isLastEmptyLine) {
          continue;
        }

        if (part.added) {
          lines.push({
            type: 'added',
            content,
            lineNumber: newLineNum,
          });
          newLineNum++;
        } else if (part.removed) {
          lines.push({
            type: 'removed',
            content,
            lineNumber: originalLineNum,
          });
          originalLineNum++;
        }
      }
    } else {
      // For unchanged parts, apply context logic
      const partLines = part.value.split('\n');
      
      // Remove the trailing empty line that split creates
      if (partLines.length > 0 && partLines[partLines.length - 1] === '') {
        partLines.pop();
      }

      if (partLines.length > CONTEXT * 2) {
        // Add context at the beginning
        for (let i = 0; i < CONTEXT; i++) {
          if (i < partLines.length) {
            lines.push({
              type: 'unchanged',
              content: partLines[i],
              lineNumber: originalLineNum,
            });
            originalLineNum++;
            newLineNum++;
          }
        }
        
        // Add ellipsis if there are hidden lines
        if (partLines.length > CONTEXT * 2) {
          lines.push({
            type: 'ellipsis',
            content: '...',
          });
        }
        
        // Add context at the end
        const startIndex = Math.max(CONTEXT, partLines.length - CONTEXT);
        const skippedLines = startIndex - CONTEXT;
        originalLineNum += skippedLines;
        newLineNum += skippedLines;
        
        for (let i = startIndex; i < partLines.length; i++) {
          lines.push({
            type: 'unchanged',
            content: partLines[i],
            lineNumber: originalLineNum,
          });
          originalLineNum++;
          newLineNum++;
        }
      } else {
        // Add all lines if within context limits
        for (const content of partLines) {
          lines.push({
            type: 'unchanged',
            content,
            lineNumber: originalLineNum,
          });
          originalLineNum++;
          newLineNum++;
        }
      }
    }
  }

  const hasChanges = lines.some(line => line.type === 'added' || line.type === 'removed');

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