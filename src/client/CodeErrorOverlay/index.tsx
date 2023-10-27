import { useCallback } from 'react';
import './style.scss';

const enableErrorDismiss = true;

export const CodeErrorOverlay = ({
  errorMessage,
}: {
  errorMessage: string | null;
}) => {
  const handleCloseClick = useCallback(() => {
    // Select the overlay container by its ID and hide it
    const overlay = document.getElementById('overlay-container');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }, []);

  return errorMessage !== null ? (
    <div id="overlay-container" className="vz-code-error-overlay">
      {errorMessage}
      {enableErrorDismiss ? (
        <div
          className={'bx bx-x error-dismiss-button'}
          onClick={handleCloseClick}
        ></div>
      ) : null}
    </div>
  ) : null;
};
