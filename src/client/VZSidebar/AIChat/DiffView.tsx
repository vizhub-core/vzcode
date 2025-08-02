import React, { useState } from 'react';
import {
  UnifiedFilesDiff,
  parseUnifiedDiffStats,
  combineUnifiedDiffs,
} from '../../../utils/fileDiff';
import * as Diff2Html from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';
import './DiffView.scss';

interface DiffViewProps {
  diffData: UnifiedFilesDiff;
  messageId?: string;
  chatId?: string;
  beforeFiles?: any;
  canUndo?: boolean;
}

export const DiffView: React.FC<DiffViewProps> = ({
  diffData,
  messageId,
  chatId,
  beforeFiles,
  canUndo = false,
}) => {
  const [isUndoing, setIsUndoing] = useState(false);

  const unifiedDiffs = Object.values(diffData).filter(
    (diff) => diff.length > 0,
  );

  if (unifiedDiffs.length === 0) {
    return null;
  }

  const handleUndo = async () => {
    if (
      !messageId ||
      !chatId ||
      !beforeFiles ||
      isUndoing
    ) {
      return;
    }

    setIsUndoing(true);
    try {
      const response = await fetch('/ai-chat-undo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          messageId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}`,
        );
      }

      // The server will handle the ShareDB operations to undo the changes
      // The UI will update automatically via ShareDB
    } catch (error) {
      console.error('Error undoing AI edit:', error);
      // TODO: Show user-friendly error message
    } finally {
      setIsUndoing(false);
    }
  };

  // Calculate statistics from all unified diffs
  let totalAdditions = 0;
  let totalDeletions = 0;

  for (const unifiedDiff of unifiedDiffs) {
    const stats = parseUnifiedDiffStats(unifiedDiff);
    totalAdditions += stats.additions;
    totalDeletions += stats.deletions;
  }

  // Combine all unified diffs and convert to HTML using diff2html
  const combinedUnifiedDiff = combineUnifiedDiffs(diffData);
  const diffHtml = Diff2Html.html(combinedUnifiedDiff, {
    drawFileList: false,
    matching: 'none',
    diffStyle: 'word',
    outputFormat: 'side-by-side',
  });

  return (
    <div className="diff-view">
      <div className="diff-summary">
        <div className="diff-stats">
          <span className="files-changed">
            {unifiedDiffs.length} file
            {unifiedDiffs.length !== 1 ? 's' : ''} changed
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
      {canUndo && beforeFiles && (
        <div className="undo-button-container">
          <button
            className="undo-button"
            onClick={handleUndo}
            disabled={isUndoing}
            title="Undo this AI edit"
          >
            {isUndoing ? 'Undoing...' : 'Undo'}
          </button>
        </div>
      )}
    </div>
  );
};
