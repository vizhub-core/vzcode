import { createTwoFilesPatch } from 'diff';
import { VizFiles, VizFileId } from '@vizhub/viz-types';

export interface UnifiedFilesDiff {
  [fileId: VizFileId]: string; // Unified diff string or deletion marker
}

// Special marker to indicate a file deletion
export const FILE_DELETION_MARKER = '__FILE_DELETED__';

/**
 * Check if a diff string represents a file deletion
 */
export function isFileDeletion(
  diffString: string,
): boolean {
  return diffString.startsWith(FILE_DELETION_MARKER);
}

/**
 * Extract file name from a deletion marker
 */
export function getDeletedFileName(
  diffString: string,
): string {
  if (!isFileDeletion(diffString)) {
    return '';
  }
  return diffString.substring(
    FILE_DELETION_MARKER.length + 1,
  );
}

/**
 * Generate a unified diff for a single file using the diff library
 */
export function generateFileUnifiedDiff(
  fileId: VizFileId,
  fileName: string,
  beforeContent: string,
  afterContent: string,
): string {
  // Only generate diff if there are actual changes
  if (beforeContent === afterContent) {
    return '';
  }

  // Handle file deletion case - when file existed before but is now empty/deleted
  if (beforeContent && !afterContent) {
    return `${FILE_DELETION_MARKER}:${fileName}`;
  }

  // Use the diff library's createTwoFilesPatch function to generate unified diff
  const unifiedDiff = createTwoFilesPatch(
    fileName,
    fileName,
    beforeContent,
    afterContent,
    '',
    '',
    { context: 3 },
  );

  return unifiedDiff;
}

/**
 * Generate unified diffs for multiple files
 */
export function generateFilesUnifiedDiff(
  beforeFiles: VizFiles,
  afterFiles: VizFiles,
): UnifiedFilesDiff {
  const result: UnifiedFilesDiff = {};
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

    const unifiedDiff = generateFileUnifiedDiff(
      fileId,
      fileName,
      beforeContent,
      afterContent,
    );

    // Only include files that have changes
    if (unifiedDiff) {
      result[fileId] = unifiedDiff;
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
 * Parse unified diff to extract basic statistics
 */
export function parseUnifiedDiffStats(
  unifiedDiff: string,
): {
  additions: number;
  deletions: number;
} {
  const lines = unifiedDiff.split('\n');
  let additions = 0;
  let deletions = 0;

  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      additions++;
    } else if (
      line.startsWith('-') &&
      !line.startsWith('---')
    ) {
      deletions++;
    }
  }

  return { additions, deletions };
}

/**
 * Combine multiple unified diffs into a single diff string
 * Note: File deletion markers are excluded from combination
 */
export function combineUnifiedDiffs(
  unifiedDiffs: UnifiedFilesDiff,
): string {
  return Object.values(unifiedDiffs)
    .filter((diff) => !isFileDeletion(diff))
    .join('\n');
}
