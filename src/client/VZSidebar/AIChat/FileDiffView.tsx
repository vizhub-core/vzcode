import React, { useState } from 'react';
import { FileDiff } from '../../../utils/fileDiff';
import './FileDiffView.scss';

interface FileDiffViewProps {
  fileDiff: FileDiff;
}

export const FileDiffView: React.FC<FileDiffViewProps> = ({ fileDiff }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const addedLines = fileDiff.lines.filter(line => line.type === 'added').length;
  const removedLines = fileDiff.lines.filter(line => line.type === 'removed').length;

  return (
    <div className="file-diff-view">
      <div className="file-diff-header" onClick={toggleExpanded}>
        <div className="file-diff-name">
          <span className="file-name">{fileDiff.fileName}</span>
          <span className="file-changes">
            {addedLines > 0 && (
              <span className="additions">+{addedLines}</span>
            )}
            {removedLines > 0 && (
              <span className="deletions">-{removedLines}</span>
            )}
          </span>
        </div>
        <div className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </div>
      </div>
      
      {isExpanded && (
        <div className="file-diff-content">
          <div className="diff-lines">
            {fileDiff.lines.map((line, index) => (
              <div
                key={index}
                className={`diff-line diff-line-${line.type}`}
              >
                <span className="line-number">
                  {line.lineNumber || ''}
                </span>
                <span className="line-indicator">
                  {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                </span>
                <span className="line-content">
                  {line.content}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};