import React from 'react';
import {
  FilesDiff,
  generateUnifiedDiff,
} from '../../../utils/fileDiff';
import * as Diff2Html from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';
import './DiffView.scss';

interface DiffViewProps {
  diffData: FilesDiff;
}

export const DiffView: React.FC<DiffViewProps> = ({
  diffData,
}) => {
  const fileDiffs = Object.values(diffData).filter(
    (diff) => diff.hasChanges,
  );

  if (fileDiffs.length === 0) {
    return null;
  }

  const totalAdditions = fileDiffs.reduce(
    (sum, diff) =>
      sum +
      diff.lines.filter((line) => line.type === 'added')
        .length,
    0,
  );

  const totalDeletions = fileDiffs.reduce(
    (sum, diff) =>
      sum +
      diff.lines.filter((line) => line.type === 'removed')
        .length,
    0,
  );

  // Generate unified diff and convert to HTML using diff2html
  const unifiedDiff = generateUnifiedDiff(diffData);
  const diffHtml = Diff2Html.html(unifiedDiff, {
    drawFileList: false,
    matching: 'words',
    diffStyle: 'word',
    outputFormat: 'line-by-line',
  });

  return (
    <div className="diff-view">
      <div className="diff-summary">
        <div className="diff-stats">
          <span className="files-changed">
            {fileDiffs.length} file
            {fileDiffs.length !== 1 ? 's' : ''} changed
          </span>
          {totalAdditions > 0 && (
            <span className="additions">
              +{totalAdditions}
            </span>
          )}
          {totalDeletions > 0 && (
            <span className="deletions">
              -{totalDeletions}
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
