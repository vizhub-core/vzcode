import { Spinner } from '../../AIAssist/Spinner';

interface AIEditingStatusIndicatorProps {
  status: string;
  fileName?: string;
}

export const AIEditingStatusIndicator: React.FC<
  AIEditingStatusIndicatorProps
> = ({ status, fileName }) => {
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Analyzing request...':
        return (
          <>
            🔍 <span>Analyzing request...</span>
          </>
        );
      case 'Formulating a plan...':
        return (
          <>
            💭 <span>Formulating a plan...</span>
          </>
        );
      case 'Describing changes...':
        return (
          <>
            📝 <span>Describing changes...</span>
          </>
        );
      case 'Thinking...':
        return (
          <>
            🤔 <span>Thinking...</span>
          </>
        );
      case 'Done':
        return (
          <>
            ✅ <span>Done</span>
          </>
        );
      default:
        // Handle file editing status (e.g., "Editing filename.js...")
        if (status.startsWith('Editing ') && fileName) {
          return (
            <>
              ✏️{' '}
              <span>
                Editing <code>{fileName}</code>...
              </span>
            </>
          );
        } else if (status.startsWith('Editing ')) {
          return (
            <>
              ✏️ <span>{status}</span>
            </>
          );
        }
        return <span>{status}</span>;
    }
  };

  const showSpinner = status !== 'Done';

  return (
    <div className="file-editing-indicator">
      <div className="file-editing-header">
        {showSpinner && (
          <div className="file-editing-icon">
            <Spinner height={16} fadeIn={false} />
          </div>
        )}
        <div className="file-editing-text">
          {getStatusDisplay(status)}
        </div>
      </div>
    </div>
  );
};
