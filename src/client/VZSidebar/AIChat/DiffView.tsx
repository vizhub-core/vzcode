import React, {
  useContext,
  useEffect,
  useRef,
} from 'react';
import {
  UnifiedFilesDiff,
  parseUnifiedDiffStats,
  combineUnifiedDiffs,
} from '../../../utils/fileDiff';
import * as Diff2Html from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';
import './DiffView.scss';
import { VZCodeContext } from '../../VZCodeContext';
import { getFileId } from '@vizhub/viz-utils';

interface DiffViewProps {
  diffData: UnifiedFilesDiff;
}

export const DiffView: React.FC<DiffViewProps> = ({
  diffData,
}) => {
  const { content, openTab, setIsAIChatOpen } =
    useContext(VZCodeContext);
  const diffContainerRef = useRef<HTMLDivElement>(null);

  const unifiedDiffs = Object.values(diffData).filter(
    (diff) => diff.length > 0,
  );

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
    matching: 'words',
    diffStyle: 'word',
    outputFormat: 'line-by-line',
  });

  // Add click handlers to file names after HTML is rendered
  useEffect(() => {
    if (!diffContainerRef.current) return;

    const handleFileNameClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('d2h-file-name')) {
        event.preventDefault();
        event.stopPropagation();

        console.log('File name clicked');

        const fileName = target.textContent?.trim();

        console.log('Clicked file name:', fileName);
        if (fileName) {
          const fileId = getFileId(content, fileName);
          console.log('Mapped file ID:', fileId);

          if (fileId) {
            // Open the file tab and switch to files view
            openTab({ fileId, isTransient: false });
            setIsAIChatOpen(false);
          }
        }
      }
    };

    const container = diffContainerRef.current;
    const fileNameElements = container.querySelectorAll(
      '.d2h-file-name',
    );

    // Add click event listeners and cursor pointer style
    fileNameElements.forEach((element) => {
      element.addEventListener(
        'click',
        handleFileNameClick,
      );
      (element as HTMLElement).style.cursor = 'pointer';
      (element as HTMLElement).style.textDecoration =
        'underline';
      (element as HTMLElement).style.color = '#58a6ff'; // GitHub blue link color
    });

    return () => {
      // Cleanup event listeners
      fileNameElements.forEach((element) => {
        element.removeEventListener(
          'click',
          handleFileNameClick,
        );
      });
    };
  }, [diffHtml, content, openTab, setIsAIChatOpen]);

  if (unifiedDiffs.length === 0) {
    return null;
  }

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
        ref={diffContainerRef}
        dangerouslySetInnerHTML={{ __html: diffHtml }}
      />
    </div>
  );
};
