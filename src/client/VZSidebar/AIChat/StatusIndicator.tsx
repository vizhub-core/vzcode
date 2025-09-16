import React from 'react';

interface StatusIndicatorProps {
  status: string;
}

export const StatusIndicator: React.FC<
  StatusIndicatorProps
> = ({ status }) => {
  return (
    <div className="status-indicator">
      <div className="status-content">
        <div className="status-icon">
          {status === 'Done' ? (
            <span className="done-icon">✅</span>
          ) : (
            <div className="spinner" />
          )}
        </div>
        <div className="status-text">{status}</div>
      </div>
    </div>
  );
};
