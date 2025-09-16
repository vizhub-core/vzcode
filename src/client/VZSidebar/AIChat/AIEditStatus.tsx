import React from 'react';
import './AIEditStatus.scss';

// Define types for file status tracking
export interface FileStatus {
  filename: string;
  operation:
    | 'editing'
    | 'creating'
    | 'renaming'
    | 'deleting';
  status: 'in-progress' | 'completed' | 'error';
}

export interface AIEditStatusProps {
  fileStatuses: FileStatus[];
  isGenerating: boolean;
  aiStatus?: string;
}

// Component to display live file editing status during AI generation
export const AIEditStatus: React.FC<AIEditStatusProps> = ({
  fileStatuses,
  isGenerating,
  aiStatus,
}) => {
  // If not generating, show completion message
  if (!isGenerating) {
    return (
      <div className="ai-edit-status">
        <div className="ai-edit-status-complete">
          <div className="ai-edit-status-icon">✅</div>
          <div className="ai-edit-status-message">
            Ready to review changes
          </div>
        </div>
      </div>
    );
  }

  // During generation, show file statuses or general generating message
  return (
    <div className="ai-edit-status" aria-live="polite">
      <div className="ai-edit-status-header">
        <div className="ai-edit-status-icon">
          <div className="ai-edit-status-spinner" />
        </div>
        <div className="ai-edit-status-title">
          {aiStatus === 'generating'
            ? 'Generating changes...'
            : 'Processing...'}
        </div>
      </div>

      {fileStatuses.length > 0 ? (
        <div className="ai-edit-status-files">
          {fileStatuses.map((fileStatus, index) => (
            <div
              key={`${fileStatus.filename}-${index}`}
              className="ai-edit-status-file"
            >
              <div className="ai-edit-status-file-icon">
                {fileStatus.status === 'completed'
                  ? '✅'
                  : fileStatus.status === 'error'
                    ? '❌'
                    : '⏳'}
              </div>
              <div className="ai-edit-status-file-text">
                {getOperationText(fileStatus.operation)}{' '}
                <code>{fileStatus.filename}</code>
                {fileStatus.status === 'in-progress' &&
                  '...'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="ai-edit-status-message">
          Analyzing your request...
        </div>
      )}
    </div>
  );
};

// Helper function to get human-readable operation text
function getOperationText(
  operation: FileStatus['operation'],
): string {
  switch (operation) {
    case 'editing':
      return 'Editing';
    case 'creating':
      return 'Creating';
    case 'renaming':
      return 'Renaming';
    case 'deleting':
      return 'Deleting';
    default:
      return 'Processing';
  }
}
