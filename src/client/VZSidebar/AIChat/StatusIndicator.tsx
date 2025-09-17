import React from 'react';

interface StatusIndicatorProps {
  status: string;
}

export const StatusIndicator: React.FC<
  StatusIndicatorProps
> = ({ status }) => {
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Analyzing request...':
        return (
          <span className="analyzing-icon">
            🔍 Analyzing request...
          </span>
        );
      case 'Formulating a plan...':
        return (
          <span className="planning-icon">
            💭 Formulating a plan...
          </span>
        );
      case 'Describing changes...':
        return (
          <span className="describing-icon">
            📝 Describing changes...
          </span>
        );
      case 'Thinking...':
        return (
          <span className="thinking-icon">
            🤔 Thinking...
          </span>
        );
      case 'Done':
        return <span className="done-icon">✅ Done</span>;
      default:
        // Handle file editing status (e.g., "Editing filename.js...")
        if (status.startsWith('Editing ')) {
          return (
            <span className="editing-icon">
              ✏️ {status}
            </span>
          );
        }
        return (
          <span className="default-icon">{status}</span>
        );
    }
  };

  return (
    <div className="status-indicator">
      <div className="status-content">
        <div className="status-icon">
          {getStatusDisplay(status)}
        </div>
      </div>
    </div>
  );
};
