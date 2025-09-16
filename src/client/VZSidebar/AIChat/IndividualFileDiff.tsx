import React, { useMemo } from 'react';
import * as Diff2Html from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';
import './DiffView.scss';
import { generateFileUnifiedDiff } from '../../../utils/fileDiff';

interface IndividualFileDiffProps {
  fileName: string;
  beforeContent: string;
  afterContent: string;
}

export const IndividualFileDiff: React.FC<
  IndividualFileDiffProps
> = ({ fileName, beforeContent, afterContent }) => {
  // Generate unified diff for this single file
  const unifiedDiff = useMemo(() => {
    return generateFileUnifiedDiff(
      'temp-id',
      fileName,
      beforeContent,
      afterContent,
    );
  }, [fileName, beforeContent, afterContent]);

  // Convert to HTML using diff2html
  const diffHtml = useMemo(() => {
    if (!unifiedDiff) return '';

    return Diff2Html.html(unifiedDiff, {
      drawFileList: false,
      matching: 'words',
      diffStyle: 'word',
      outputFormat: 'line-by-line',
    });
  }, [unifiedDiff]);

  // Calculate simple stats
  const stats = useMemo(() => {
    const lines = unifiedDiff.split('\n');
    let additions = 0;
    let deletions = 0;

    lines.forEach((line) => {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        additions++;
      } else if (
        line.startsWith('-') &&
        !line.startsWith('---')
      ) {
        deletions++;
      }
    });

    return { additions, deletions };
  }, [unifiedDiff]);

  if (!unifiedDiff) {
    return null;
  }

  return (
    <div className="diff-view" data-file={fileName}>
      <div className="diff-summary">
        <div className="diff-stats">
          <span className="files-changed">{fileName}</span>
          {stats.additions > 0 && (
            <span className="additions">
              +{stats.additions}
            </span>
          )}
          {stats.deletions > 0 && (
            <span className="deletions">
              -{stats.deletions}
            </span>
          )}
        </div>
      </div>

      <div
        className="diff-files"
        dangerouslySetInnerHTML={{ __html: diffHtml }}
      />
    </div>
  );
};
