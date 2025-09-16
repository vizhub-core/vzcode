import React from 'react';
import { Spinner } from '../../AIAssist/Spinner';

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
          <Spinner height={16} fadeIn={false} />
        </div>
        <div className="file-editing-text">
          Editing <code>{fileName}</code>...
        </div>
      </div>
    </div>
  );
};
