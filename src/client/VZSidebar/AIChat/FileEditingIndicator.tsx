import React from 'react';

interface FileEditingIndicatorProps {
  fileName: string;
}

export const FileEditingIndicator: React.FC<
  FileEditingIndicatorProps
> = ({ fileName }) => {
  return (
    <div className="file-editing-indicator">
      <div className="file-editing-header">
        <div className="file-editing-icon">
          <div className="spinner" />
        </div>
        <div className="file-editing-text">
          Editing <code>{fileName}</code>...
        </div>
      </div>
    </div>
  );
};
