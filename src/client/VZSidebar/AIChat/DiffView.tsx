import React, {
  useContext,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
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
import { VizFiles } from '@vizhub/viz-types';
import {
  scrollToFirstDiff,
  getHeaderOffset,
  announceDiffSummary,
} from '../../utils/scrollUtils';
import { getFileId } from '@vizhub/viz-utils';

interface DiffViewProps {
  diffData: UnifiedFilesDiff;
}

// Methods that can be called on DiffView from parent components
export interface DiffViewRef {
  scrollToFirstHunk: () => void;
  focusDiffContainer: () => void;
  announceSummary: () => void;
}

export const DiffView = forwardRef<
  DiffViewRef,
  DiffViewProps
>(({ diffData }, ref) => {
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

  // Expose methods for parent components to control scrolling and focus
  useImperativeHandle(
    ref,
    () => ({
      scrollToFirstHunk: () => {
        if (diffContainerRef.current) {
          const headerOffset = getHeaderOffset();
          scrollToFirstDiff(
            diffContainerRef.current,
            headerOffset,
          );
        }
      },
      focusDiffContainer: () => {
        if (diffContainerRef.current) {
          diffContainerRef.current.tabIndex = -1;
          diffContainerRef.current.focus();
        }
      },
      announceSummary: () => {
        if (diffContainerRef.current) {
          announceDiffSummary(diffContainerRef.current);
        }
      },
    }),
    [],
  );

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
      <div className="diff-summary" id="diff-summary">
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
        tabIndex={-1}
        role="region"
        aria-label="Code diff content"
        aria-describedby="diff-summary"
        dangerouslySetInnerHTML={{ __html: diffHtml }}
      />
    </div>
  );
});

// Add display name for debugging
DiffView.displayName = 'DiffView';
