import React, {
  useContext,
  useEffect,
  useMemo,
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
import { VizFileId, VizFiles } from '@vizhub/viz-types';

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

  if (unifiedDiffs.length === 0) {
    return null;
  }

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

  // Create a mapping from file name to file ID for click handling
  const fileNameToIdMap = useMemo(() => {
    const map = new Map<string, VizFileId>();
    Object.entries(diffData).forEach(([fileId, diff]) => {
      // Extract file name from the unified diff
      // The diff contains lines like "--- a/filename" and "+++ b/filename"
      const lines = diff.split('\n');
      for (const line of lines) {
        if (
          line.startsWith('--- a/') ||
          line.startsWith('+++ b/')
        ) {
          const fileName = line.substring(6); // Remove "--- a/" or "+++ b/"
          map.set(fileName, fileId as VizFileId);
          break;
        }
      }
    });
    return map;
  }, [diffData]);

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
          const files: VizFiles = content?.files;
          if (files) {
            //             export type VizFiles = {
            //     [fileId: VizFileId]: VizFile;
            // };
            // export type VizFileId = string;
            // export type VizFile = {
            //     name: string;
            //     text: string;
            // };

            // TODO get fileId from content.files
            const fileId = Object.entries(files).find(
              ([id, file]) => file.name === fileName,
            )?.[0];
            console.log('Mapped file ID:', fileId);

            if (fileId) {
              // Open the file tab and switch to files view
              openTab({ fileId, isTransient: false });
              setIsAIChatOpen(false);
            }
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
