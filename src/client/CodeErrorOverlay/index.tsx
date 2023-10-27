import { useCallback } from 'react';
import './style.scss';

// Feature flag for the button that dismisses the error.
const enableErrorDismiss = false;

export const CodeErrorOverlay = ({
  errorMessage,
}: {
  errorMessage: string | null;
}) => {
  const handleCloseClick = useCallback(() => {
    console.log('TODO dismiss the error');
  }, []);

  return errorMessage !== null ? (
    <pre className="vz-code-error-overlay">
      {errorMessage}
      {enableErrorDismiss ? (
        <div
          className={'bx bx-x error-dismiss-button'}
          onClick={handleCloseClick}
        ></div>
      ) : null}
    </pre>
  ) : null;
};
